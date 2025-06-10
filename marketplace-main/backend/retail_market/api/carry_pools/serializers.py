import uuid
from datetime import date, datetime

from django.db.transaction import atomic
from django.http import Http404
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework_recursive.fields import RecursiveField
from slugify import slugify
from decimal import Decimal

from api.carry_pools.constants import SUB_POOLS_FEATURE_FLAG, EVEN_DILUTION, PRO_RATA_DILUTION
from api.carry_pools.models import (AllocationAction, CarryPlan, CarryPool,
                                    Deal, DealCarryPlan, FundCarryPlan,
                                    Milestone, MilestoneBasedVestingSchedule,
                                    TimeBasedVestingSchedule, VestingSchedule, CarryDocument,
                                    Distribution, FundRealization,
                                    Realization, ParticipantDistribution, DealRealization,
                                    ParticipantCarryDocument, CarryParticipant, CarryVehicle, CarryShareClass,
                                    CarryVehicleShareClass, CarryPlanMilestone, CarrySubPool, CarryParticipantUser,
                                    CarryDistributionAPILog, InvestmentTranche, InvestmentTrancheCarryPlan,
                                    InvestmentTrancheRealization, CarryGpCommitment, CarryHurdle,
                                    AllocationValueAdjustment)
from api.carry_pools.services.create_updated_pool import CreateUpdatedPool
from api.carry_pools.services.participant_document import AdminParticipantDocumentService
from api.carry_pools.utils import (create_periodic_time_vesting_schedule,
                                   deep_copy_allocations,
                                   find_pool_by_external_id, get_carry_pool,
                                   get_carry_pool_of_carry_plan,
                                   get_duration_in_years_and_months,
                                   get_duration_type, pluralize_if_needed,
                                   get_allocated_points,
                                   get_allocated_points_after_adjusting_allocation_actions,
                                   get_hire_date_from_user_id, get_forfeit_dilute_transferred_adjusted_allocations,
                                   get_total_distributions_fund, get_deal_distributions_for_fund,
                                   update_custom_schedules_dict_with_milestone_data,
                                   get_allocated_unallocated_point_sub_pool)

from api.companies.models import CompanyUser
from api.currencies.serializers import CurrencyField
from api.documents.models import Document
from api.documents.serializers import DocumentSerializer
from api.documents.services.upload_document import UploadDocumentService
from api.employment_records.models import EmploymentRecord, EmploymentRecordStatusHistory
from api.funds.models import Fund
from api.funds.serializers import FundBaseInfoListSerializer
from api.libs.utils.nanoid_generator import generate_nanoid
from api.participants.models import ParticipantProfile
from api.users.models import RetailUser
from api.users.services.create_user import CreateUserService


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ('id', 'name')


class TimeBasedVestingScheduleSerializer(serializers.ModelSerializer):
    period_duration = serializers.CharField()

    class Meta:
        model = TimeBasedVestingSchedule
        fields = '__all__'
        extra_kwargs = {
            'vesting_schedule': {'read_only': True}
        }

    def create(self, validated_data):
        validated_data['vesting_schedule'] = self.context['vesting_schedule']
        return super().create(validated_data)


class MilestoneBasedVestingScheduleSerializer(serializers.ModelSerializer):
    milestone = MilestoneSerializer(read_only=True)

    class Meta:
        model = MilestoneBasedVestingSchedule
        exclude = ('created_at', 'modified_at')
        extra_kwargs = {
            'vesting_schedule': {'read_only': True}
        }

    def create(self, validated_data):
        validated_data['milestone'] = get_object_or_404(Milestone, id=self.initial_data['milestone'])
        validated_data['vesting_schedule'] = self.context['vesting_schedule']
        return super().create(validated_data)


class VestingScheduleSerializer(serializers.ModelSerializer):
    cliff_duration = serializers.CharField()
    time_vesting_schedules = TimeBasedVestingScheduleSerializer(many=True, read_only=True)
    milestone_vesting_schedules = MilestoneBasedVestingScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = VestingSchedule
        fields = '__all__'

    def create(self, validated_data):
        validated_data['company'] = self.context['company']
        vesting_schedule = super().create(validated_data)

        milestone_vesting_data = self.initial_data.get('milestone_vesting_schedules', [])
        time_vesting_data = self.initial_data.get('time_vesting_schedules', [])

        for milestone_data in milestone_vesting_data:
            milestone_vesting = {
                'milestone_vesting_percentage': milestone_data.pop('milestone_vesting_percentage'),
                'milestone': Milestone.objects.create(**milestone_data)
            }
            MilestoneBasedVestingSchedule.objects.create(
                vesting_schedule=vesting_schedule,
                **milestone_vesting
            )

        sequence = 1
        for time_vesting in time_vesting_data:
            if time_vesting.get('periodically'):
                sequence = create_periodic_time_vesting_schedule(vesting_schedule, time_vesting, sequence)
            else:
                time_vesting['sequence'] = sequence
                TimeBasedVestingSchedule.objects.create(
                    vesting_schedule=vesting_schedule,
                    **time_vesting
                )
                sequence += 1
        return vesting_schedule


class VestingScheduleBaseInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VestingSchedule
        fields = ('id', 'name')


class VestingScheduleDisplaySerializer(serializers.ModelSerializer):
    cliff = serializers.SerializerMethodField()
    cliff_percentage = serializers.SerializerMethodField()
    periods = serializers.SerializerMethodField()
    milestone_vesting_schedules = MilestoneBasedVestingScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = VestingSchedule
        fields = ('name', 'cliff', 'cliff_percentage', 'periods', 'milestone_vesting_schedules')

    @staticmethod
    def get_cliff(obj):
        if obj.cliff_duration:
            return get_duration_in_years_and_months(obj.cliff_duration)
        return "No cliff"

    @staticmethod
    def get_cliff_percentage(obj):
        return obj.cliff_vesting_percentage

    @staticmethod
    def format_decimal_without_trailing_zeros(value):
        formatted_value = '{:.4f}'.format(round(value, 4)).rstrip('0').rstrip('.')
        return formatted_value

    def get_periods(self, obj: VestingSchedule):
        period_count = obj.time_vesting_schedules.count()

        def year_order():
            yield "first"
            yield "second"
            yield "third"
            i = 4
            while True:
                yield f"{i}th"
                i += 1

        if period_count > 0:
            gen = year_order()
            return self.serialize_periods(obj, gen)
        return []

    def serialize_periods(self, obj, year_order):
        current = obj.time_vesting_schedules.first()
        periods = []
        count = 0
        accumulated_percentage = 0
        current_vesting_percentage = current.period_vesting_percentage_fraction
        for period in obj.time_vesting_schedules.all():
            count += 1
            period_vesting_percentage = period.period_vesting_percentage_fraction
            accumulated_percentage += period_vesting_percentage
            if (period.period_duration, period_vesting_percentage) != (
                    current.period_duration, current_vesting_percentage):
                duration, frequency = get_duration_type(current.period_duration)
                formatted_percentage = self.format_decimal_without_trailing_zeros(float(current_vesting_percentage))
                stringified_period = f"{frequency} at {formatted_percentage}% for {next(year_order)} {count - 1} {pluralize_if_needed(count - 1, duration)}".capitalize()
                serialized = {'period': stringified_period,
                              'percentage': float(accumulated_percentage - period_vesting_percentage)}
                periods.append(serialized)
                current = period
                current_vesting_percentage = period_vesting_percentage
                count = 1
                accumulated_percentage = period_vesting_percentage
        duration, frequency = get_duration_type(current.period_duration)
        last_duration_text = " " if len(periods) == 0 else " last "
        formatted_percentage = self.format_decimal_without_trailing_zeros(float(current_vesting_percentage))
        stringified_period = f"{frequency} at {formatted_percentage}% for{last_duration_text}{count} {pluralize_if_needed(count, duration)}".capitalize()
        periods.append({'period': stringified_period, 'percentage': float(accumulated_percentage)})
        return periods


class DealBaseInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = ('id', 'name', 'external_id')


class AllocationSerializer(serializers.Serializer):
    allocation_id = serializers.CharField(required=True)
    allocation_action_id = serializers.IntegerField(required=True)
    carry_participant_id = serializers.IntegerField(required=True)
    initial_bps = serializers.CharField(required=True)
    bps = serializers.CharField(required=True)
    forfeited_bps = serializers.FloatField(default=0)
    vested_bps = serializers.FloatField(default=0)
    vesting_schedule = serializers.IntegerField(required=True)
    grant_date = serializers.CharField(required=True, allow_null=True)
    effective_date = serializers.DateField(required=False)
    carry_plan_id = serializers.IntegerField(required=True)
    vesting_start_date = serializers.CharField(required=False, allow_null=True)
    vehicle = serializers.IntegerField(required=False)
    share_class = serializers.IntegerField(required=False)
    sub_pool_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_grant_date(self, value):
        if value:
            try:
                datetime.strptime(value, '%Y-%m-%d')
            except ValueError:
                raise serializers.ValidationError('Grant date must be in "year-month-day" format (YYYY-MM-DD).')
            return value

    def validate_vesting_start_date(self, value):
        if value:
            try:
                datetime.strptime(value, '%Y-%m-%d')
            except ValueError:
                raise serializers.ValidationError('Vesting start date must be in "year-month-day" format (YYYY-MM-DD).')
            return value


class PoolStructureSerializer(serializers.Serializer):
    bps = serializers.FloatField()
    name = serializers.CharField(max_length=120)
    external_id = serializers.CharField(max_length=120)
    allocations = AllocationSerializer(many=True, required=False, allow_null=True)
    pools = serializers.ListField(child=RecursiveField(), allow_empty=True, allow_null=True, min_length=0)


class CarryPoolSerializer(serializers.ModelSerializer):
    pools = PoolStructureSerializer(many=True, required=False, allow_null=True)
    allocations = AllocationSerializer(many=True, required=False, allow_null=True)
    read_only_fields = ('created_by',)

    def validate_pool(self, pool):
        allowed_bps = pool['bps']
        used_bps = 0
        for sub_pool in pool.get('pools', []):
            used_bps += sub_pool['bps']
        if used_bps > allowed_bps:
            raise ValidationError('A pool cannot use more bps than its parent pool')

        for sub_pool in pool.get('pools', []):
            self.validate_pool(pool=sub_pool)

    def validate(self, attrs):
        self.validate_pool(pool=attrs)
        return attrs

    def create(self, validated_data):
        validated_data['created_by'] = self.context['admin_user']
        return super().create(validated_data=validated_data)

    class Meta:
        model = CarryPool
        exclude = ('created_at', 'modified_at', 'deleted')


class CarryPlanBaseInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarryPlan
        fields = ('id', 'name')


class SingleCarryPlanListSerializer(serializers.ModelSerializer):
    default_vesting_schedule = VestingScheduleBaseInfoSerializer()
    allocated_points = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    funds = serializers.SerializerMethodField()
    deals = serializers.SerializerMethodField()
    investment_tranches = serializers.SerializerMethodField()
    starting_template = CarryPlanBaseInfoSerializer()
    carry_documents = serializers.SerializerMethodField()
    has_unreleased_documents = serializers.SerializerMethodField()

    class Meta:
        model = CarryPlan
        fields = ('id', 'name', 'default_vesting_schedule', 'allocated_points', 'status', 'funds', 'deals',
                  'total_points', 'participants', 'starting_template', 'created_at', 'carry_documents',
                  'effective_date', 'has_unreleased_documents', 'investment_tranches')

    @staticmethod
    def get_total_points(obj: CarryPlan):
        carry_pool = get_carry_pool_of_carry_plan(carry_plan_id=obj.id, company_id=obj.company.id)
        return carry_pool.bps

    def get_allocated_points(self, obj: CarryPlan):
        carry_pool = get_carry_pool_of_carry_plan(carry_plan_id=obj.id, company_id=obj.company.id)
        allocation_points = get_allocated_points(carry_pool.allocations, self.context['calculation_date'])
        return allocation_points

    @staticmethod
    def get_participants(obj: CarryPlan):
        carry_pool = get_carry_pool_of_carry_plan(carry_plan_id=obj.id, company_id=obj.company.id)
        users_ids = [allocation['carry_participant_id'] for allocation in carry_pool.allocations if allocation['bps']]
        return users_ids

    @staticmethod
    def get_status(obj):
        return obj.get_status_display()

    @staticmethod
    def get_funds(obj):
        fund_carry_plans = FundCarryPlan.objects.filter(carry_plan=obj).select_related('fund')
        if fund_carry_plans.exists():
            funds = [fund_carry_plan.fund for fund_carry_plan in fund_carry_plans]
            return FundBaseInfoListSerializer(funds, many=True).data
        return []

    @staticmethod
    def get_investment_tranches(obj):
        investment_carry_plans = InvestmentTrancheCarryPlan.objects.filter(
            carry_plan=obj
        ).select_related('investment_tranche__deal')
        if investment_carry_plans.exists():
            investment_tranches = [investment_carry_plan.investment_tranche
                                   for investment_carry_plan in investment_carry_plans]
            return InvestmentTrancheSerializer(investment_tranches, many=True).data
        return []

    @staticmethod
    def get_deals(obj):
        deal_carry_plans = DealCarryPlan.objects.filter(carry_plan=obj).select_related('deal')
        if deal_carry_plans.exists():
            deals = [deal_carry_plan.deal for deal_carry_plan in deal_carry_plans]
            return DealBaseInfoSerializer(deals, many=True).data
        return []

    @staticmethod
    def get_carry_documents(obj):
        from .serializers import CarryDocumentSerializer
        serializer = CarryDocumentSerializer(
            obj.associated_carry_documents.all(),
            many=True
        )
        return serializer.data

    @staticmethod
    def get_has_unreleased_documents(obj):
        return ParticipantCarryDocument.objects.filter(
            carry_plan=obj,
            is_released=False,
            company=obj.company
        ).exists()


class CarryPlanListSerializer(serializers.ModelSerializer):
    default_vesting_schedule = VestingScheduleBaseInfoSerializer()
    allocated_points = serializers.SerializerMethodField()
    un_allocated_points = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = CarryPlan
        fields = ('id', 'name', 'default_vesting_schedule', 'allocated_points', 'status',
                  'total_points', 'participants', 'created_at', 'un_allocated_points', 'effective_date')

    @staticmethod
    def get_total_points(obj: CarryPlan):
        return obj.last_carry_pool_bps

    def get_allocated_points(self, obj: CarryPlan):
        allocation_points = get_allocated_points_after_adjusting_allocation_actions(
            obj.last_carry_pool_allocations,
            self.context['allocation_actions_summary']
        )
        return str(allocation_points)

    def get_un_allocated_points(self, obj: CarryPlan):
        allocation_points = get_allocated_points_after_adjusting_allocation_actions(
            obj.last_carry_pool_allocations,
            self.context['allocation_actions_summary']
        )
        un_allocated_points = Decimal(str(obj.last_carry_pool_bps)) - allocation_points
        return str(un_allocated_points)

    @staticmethod
    def get_participants(obj: CarryPlan):
        carry_participant_ids = [allocation['carry_participant_id'] for allocation in obj.last_carry_pool_allocations if
                                 allocation['bps'] and 'carry_participant_id' in allocation]
        return carry_participant_ids

    @staticmethod
    def get_status(obj):
        return obj.get_status_display()


class CarryPlanSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    deals = serializers.ListField(default=[], write_only=True)
    funds = serializers.ListField(default=[], write_only=True)
    investment_tranches = serializers.ListField(default=[], write_only=True)
    slug = serializers.SerializerMethodField()
    carry_pools = serializers.SerializerMethodField()
    carry_documents = serializers.ListField(default=[], write_only=True)
    sub_pools = serializers.ListField(default=[], write_only=True)
    effective_date = serializers.CharField(required=False)

    class Meta:
        model = CarryPlan
        exclude = ('modified_at', 'deleted')

    @staticmethod
    def get_carry_pools(obj: CarryPlan):
        carry_pool = get_carry_pool_of_carry_plan(obj.id, obj.company_id)
        return [CarryPoolSerializer(carry_pool).data]

    @staticmethod
    def get_slug(obj: CarryPlan):
        return slugify(obj.name)

    def validate(self, attrs):
        if 'starting_template' in attrs:
            carry_pool = get_carry_pool_of_carry_plan(attrs['starting_template'].id, self.context['company'])
            attrs['bps'] = carry_pool.bps
            attrs['default_vesting_schedule'] = attrs['starting_template'].default_vesting_schedule

        else:
            if 'bps' in self.initial_data:
                bps_str = self.initial_data['bps']
                try:
                    attrs['bps'] = float(bps_str)
                except ValueError:
                    raise serializers.ValidationError({'bps': 'bps must be a float value!'})
            else:
                raise serializers.ValidationError('bps required to initialize the carry plan!')

        return attrs

    def funds_validation(self, funds):
        for item in funds:
            fund_object = Fund.objects.filter(
                company=self.context['company'],
                external_id=item['external_id']
            ).first()
            if fund_object is None:
                raise serializers.ValidationError(f"Fund with id {item['external_id']} not exist!")
            fund_carry_plan = FundCarryPlan.objects.filter(fund=fund_object)
            if fund_carry_plan.exists():
                raise serializers.ValidationError(f"Carry Plan for fund {fund_object.name} is already created!")
            item['fund'] = fund_object

    def update_fund_carry_plans(self, carry_plan, funds):
        if not funds:
            FundCarryPlan.objects.filter(carry_plan=carry_plan).delete()
            return

        fund_objects = []
        for item in funds:
            fund_object = Fund.objects.filter(
                company=self.context['company'],
                external_id=item['external_id']
            ).first()
            if fund_object is None:
                raise serializers.ValidationError(f"Fund with id {item['external_id']} not exist!")
            fund_carry_plan = FundCarryPlan.objects.filter(fund=fund_object).exclude(carry_plan=carry_plan)
            if fund_carry_plan.exists():
                raise serializers.ValidationError(f"Fund {fund_object.name} already assigned to another carry plan.")
            fund_objects.append(fund_object)

        FundCarryPlan.objects.filter(carry_plan=carry_plan).delete()
        new_fund_carry_plans = [
            FundCarryPlan(carry_plan=carry_plan, fund=fund)
            for fund in fund_objects
        ]
        FundCarryPlan.objects.bulk_create(new_fund_carry_plans)

    def update_deal_carry_plans(self, carry_plan, deals):
        if not deals:
            DealCarryPlan.objects.filter(carry_plan=carry_plan).delete()
            return

        deal_objects = []
        for item in deals:
            deal_object = Deal.objects.filter(
                company=self.context['company'],
                external_id=item['external_id']
            ).first()
            if deal_object is None:
                raise serializers.ValidationError(f"Deal with id {item['external_id']} not exist!")
            deal_carry_plan = DealCarryPlan.objects.filter(deal=deal_object).exclude(carry_plan=carry_plan)
            if deal_carry_plan.exists():
                raise serializers.ValidationError(f"Deal {deal_object.name} already assigned to another carry plan.")
            deal_objects.append(deal_object)

        DealCarryPlan.objects.filter(carry_plan=carry_plan).delete()
        new_deal_carry_plans = [
            DealCarryPlan(carry_plan=carry_plan, deal=deal)
            for deal in deal_objects
        ]
        DealCarryPlan.objects.bulk_create(new_deal_carry_plans)

    def update_investment_carry_plans(self, carry_plan, investments):
        if not investments:
            InvestmentTrancheCarryPlan.objects.filter(carry_plan=carry_plan).delete()
            return

        investment_objects = []
        for item in investments:
            investment_object = InvestmentTranche.objects.filter(
                company=self.context['company'],
                external_id=item['external_id']
            ).first()
            if investment_object is None:
                raise serializers.ValidationError(f"Investment with id {item['external_id']} not exist!")
            investment_carry_plan = InvestmentTrancheCarryPlan.objects.filter(
                investment_tranche=investment_object).exclude(carry_plan=carry_plan)
            if investment_carry_plan.exists():
                raise serializers.ValidationError(
                    f"Deal {investment_object.name} already assigned to another carry plan.")
            investment_objects.append(investment_object)

        InvestmentTrancheCarryPlan.objects.filter(carry_plan=carry_plan).delete()
        new_investment_carry_plans = [
            InvestmentTrancheCarryPlan(carry_plan=carry_plan, investment_tranche=investment)
            for investment in investment_objects
        ]
        InvestmentTrancheCarryPlan.objects.bulk_create(new_investment_carry_plans)

    def deals_validation(self, deals):
        for item in deals:
            deal_object = Deal.objects.filter(
                company=self.context['company'],
                external_id=item['external_id']
            ).first()
            if deal_object is None:
                raise serializers.ValidationError(f"Deal with id {item['external_id']} not exist!")
            deal_carry_plan = DealCarryPlan.objects.filter(deal=deal_object)
            if deal_carry_plan.exists():
                raise serializers.ValidationError(f"Carry Plan for deal {deal_object.name} is already created!")
            item['deal'] = deal_object

    def investment_tranches_validation(self, investment_tranches):
        for item in investment_tranches:
            investment_tranche_object = InvestmentTranche.objects.filter(
                company=self.context['company'],
                external_id=item['external_id']
            ).first()
            if investment_tranche_object is None:
                raise serializers.ValidationError(f"Investment Tranche with id {item['external_id']} not exist!")
            investment_carry_plan = InvestmentTrancheCarryPlan.objects.filter(
                investment_tranche=investment_tranche_object
            )
            if investment_carry_plan.exists():
                raise serializers.ValidationError(
                    f"Carry Plan for deal {investment_tranche_object.name} is already created!")
            item['investment_tranche'] = investment_tranche_object

    def create_carry_sub_pools(self, sub_pools, carry_plan):
        feature_flag = self.context['company'].is_feature_flag_active(SUB_POOLS_FEATURE_FLAG)
        if feature_flag:
            for sub_pool in sub_pools:
                sub_pool['carry_plan'] = carry_plan
                sub_pool_document_ids = sub_pool.pop('carry_documents')
                sub_pool = CarrySubPool.objects.create(**sub_pool)
                if sub_pool_document_ids:
                    sub_pool.subpool_carry_documents.set(sub_pool_document_ids)

    def create(self, validated_data):
        self.funds_validation(validated_data.get('funds'))
        self.deals_validation(validated_data.get('deals'))
        self.investment_tranches_validation(validated_data.get('investment_tranches'))

        with atomic():
            name = validated_data.get('name')
            carry_plan = CarryPlan.objects.create(
                name=name,
                slug=slugify(name),
                company=self.context['company'],
                default_vesting_schedule=validated_data['default_vesting_schedule'],
                starting_template=validated_data.get('starting_template'),
                effective_date=validated_data.get('effective_date', datetime.now())
            )

            carry_pool = CarryPool.objects.create(
                name=name,
                slug=slugify(name),
                bps=validated_data['bps'],
                carry_plan=carry_plan,
                external_id=generate_nanoid(),
                company=self.context['company'],
                created_by=self.context['admin_user'],
            )

            for item in validated_data['funds']:
                FundCarryPlan.objects.create(
                    fund=item['fund'],
                    carry_plan=carry_plan
                )

            for item in validated_data['deals']:
                DealCarryPlan.objects.create(
                    deal=item['deal'],
                    carry_plan=carry_plan
                )

            for item in validated_data['investment_tranches']:
                InvestmentTrancheCarryPlan.objects.create(
                    investment_tranche=item['investment_tranche'],
                    carry_plan=carry_plan
                )

            if validated_data.get('starting_template'):
                allocations = deep_copy_allocations(
                    source_carry_plan=validated_data['starting_template'],
                    destination_carry_plan=carry_plan
                )
                carry_pool.allocations = allocations
                carry_pool.save()

            carry_document_ids = validated_data.get('carry_documents')
            for doc_id in carry_document_ids:
                carry_document = CarryDocument.objects.filter(id=doc_id).first()
                if carry_document:
                    carry_plan.associated_carry_documents.add(carry_document)

            self.create_carry_sub_pools(validated_data.get('sub_pools'), carry_plan)

            return carry_plan

    def update(self, instance, validated_data):
        with atomic():
            carry_pool = get_carry_pool_of_carry_plan(instance.id, instance.company.id)
            carry_pool.bps = validated_data['bps']

            if instance.starting_template != validated_data.get('starting_template', instance.starting_template):
                carry_pool.allocations = []
                allocations = deep_copy_allocations(
                    source_carry_plan=validated_data['starting_template'],
                    destination_carry_plan=instance
                )
                carry_pool.allocations = allocations

            if validated_data.get('name'):
                instance.name = validated_data.get('name')
                instance.slug = slugify(validated_data.get('name'))
                carry_pool.name = validated_data.get('name')
                carry_pool.slug = slugify(validated_data.get('name'))
            instance.default_vesting_schedule = validated_data['default_vesting_schedule']
            instance.starting_template = validated_data.get('starting_template')
            instance.effective_date = validated_data.get('effective_date')

            if instance.status != CarryPlan.Status.PENDING_APPROVAL.value:
                instance.status = CarryPlan.Status.UNPUBLISHED_CHANGE.value

            carry_pool.save()
            instance.save()

            carry_document_ids = validated_data.get('carry_documents')
            if carry_document_ids:
                instance.associated_carry_documents.set(carry_document_ids)

            self.update_fund_carry_plans(instance, validated_data.get('funds'))
            self.update_deal_carry_plans(instance, validated_data.get('deals'))
            self.update_investment_carry_plans(instance, validated_data.get('investment_tranches'))

            if not instance.carry_plan_subpools.exists() and len(carry_pool.allocations) == 0:
                self.create_carry_sub_pools(validated_data.get('sub_pools'), instance)
            return instance


class AddPoolSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    bps = serializers.FloatField()
    base_pool_id = serializers.CharField(max_length=120, required=False, allow_null=True, allow_blank=True)
    parent_pool_id = serializers.CharField(max_length=120, required=True, allow_null=True, allow_blank=True)
    pool_id = serializers.CharField(max_length=120, required=False, allow_null=True, allow_blank=True)

    def create(self, validated_data):
        pool_payload = {
            'name': validated_data['name'],
            'bps': validated_data['bps'],
        }
        if validated_data.get('pool_id'):
            pool_payload['external_id'] = validated_data['pool_id']
        CreateUpdatedPool(
            admin_user=self.context['admin_user'],
            base_pool_id=validated_data['base_pool_id'],
            parent_pool_id=validated_data['parent_pool_id'],
            pool_payload=pool_payload
        ).process()
        return validated_data


class DeletePoolSerializer(serializers.Serializer):
    base_pool_id = serializers.CharField(max_length=120, required=True, allow_null=True, allow_blank=True)
    pool_id = serializers.CharField(max_length=120, required=True)


class AllocationActionSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AllocationAction
        fields = '__all__'

    def get_status_display(self, obj):
        for status_choice in AllocationAction.Status.choices:
            if int(status_choice[0]) == int(obj.status):
                return status_choice[1]
        return None


class AddAllocationsSerializer(serializers.Serializer):
    base_pool_id = serializers.CharField(max_length=120, required=True)
    parent_pool_id = serializers.CharField(max_length=120, required=True)
    allocations = serializers.JSONField()

    def validate(self, attrs):
        # Validation that participant bps can not be greater than pool bps
        base_pool_id = attrs.get('base_pool_id')
        base_pool = get_carry_pool(base_pool_id=base_pool_id, company_id=self.context['company'].id)
        parent_pool_id = attrs['parent_pool_id']
        allocations = attrs['allocations']

        if parent_pool_id == base_pool_id:
            child_pool_bps = sum(Decimal(str(pool['bps'])) for pool in base_pool.pools)
            parent_pool_bps = Decimal(str(base_pool.bps))
        else:
            parent_pool = find_pool_by_external_id(base_pool.pools, parent_pool_id)
            parent_pool_bps = Decimal(str(parent_pool.get('bps', 0)))
            child_pool_bps = sum(Decimal(str(pool['bps'])) for pool in parent_pool.get('pools', []))

        allocations_updated_bps = sum([Decimal(str(allocation['bps'])) for allocation in allocations])
        total_bps = child_pool_bps + allocations_updated_bps

        if total_bps > parent_pool_bps:
            raise serializers.ValidationError("Total allocated bps cannot be greater than pool bps.")

        return attrs


class ParticipantSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    hire_date = serializers.SerializerMethodField()
    entity_type = serializers.SerializerMethodField()

    class Meta:
        model = CarryParticipant
        fields = ('id', 'full_name', 'title', 'hire_date', 'entity_type',)

    @staticmethod
    def get_full_name(obj: CarryParticipant):
        return obj.get_full_name()

    @staticmethod
    def get_hire_date(obj: CarryParticipant):
        return get_hire_date_from_user_id(obj.id, obj.created_at)

    @staticmethod
    def get_entity_type(obj: CarryParticipant):
        return obj.get_entity_display()

    @staticmethod
    def get_title(obj: CarryParticipant):
        participant_profile = getattr(obj, 'profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        positions = getattr(employment_record, 'positions', None)
        current_position = positions.filter(end_date=None,
                                            company=participant_profile.company).first() if positions else None
        if current_position:
            return current_position.display_title


class ParticipantDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    office_location = serializers.CharField(default='')
    title = serializers.CharField(default='')
    salary = serializers.SerializerMethodField()
    bonus = serializers.SerializerMethodField()
    total_benefits = serializers.SerializerMethodField()
    hire_date = serializers.DateField(default=date.today)
    carry_distribution = serializers.FloatField(default=0)
    carry_in_escrow = serializers.FloatField(default=0)
    net_distribution = serializers.FloatField(default=0)
    status = serializers.CharField(default='')
    co_investment = serializers.FloatField(default=0)
    tier = serializers.CharField(default='')
    wire_account = serializers.CharField(default='+* ***-***-2779')
    bank_account = serializers.CharField(default='****-****-3167')
    bps = serializers.FloatField(default=0)

    class Meta:
        model = RetailUser
        fields = ('id', 'full_name', 'title', 'salary', 'bonus', 'total_benefits',
                  'hire_date', 'carry_distribution',
                  'carry_in_escrow', 'net_distribution', 'status', 'office_location', 'co_investment', 'tier',
                  'wire_account', 'bank_account', 'bps')

    @staticmethod
    def get_full_name(obj: RetailUser):
        return obj.get_full_name()

    def get_salary(self, _):
        if self.context.get('latest_compensation') and self.context['latest_compensation'].get('cash'):
            return self.context['latest_compensation']['cash']['salary']
        return 0

    def get_bonus(self, _):
        if self.context.get('latest_compensation') and self.context['latest_compensation'].get('cash'):
            return self.context['latest_compensation']['cash']['total_bonus']
        return 0

    def get_total_benefits(self, _):
        if not self.context.get('latest_compensation'):
            return 0
        return self.context['latest_compensation']['total_benefits']


class UserCarryDetailSerializer(serializers.Serializer):
    carry_plan_name = serializers.CharField()
    base_pool_id = serializers.CharField()
    parent_pool_id = serializers.CharField()
    external_id = serializers.CharField()
    allocation_id = serializers.CharField()
    vesting_schedule_id = serializers.SerializerMethodField()  # TODO: remove this from frontend integration
    vesting_schedule = serializers.SerializerMethodField(method_name='get_vesting_schedule_id')
    bps = serializers.CharField()
    percentage_vested = serializers.CharField()
    carry_pool_points = serializers.FloatField()
    initial_bps = serializers.FloatField()
    grant_date = serializers.CharField()
    vested_bps = serializers.FloatField()
    un_vested_bps = serializers.FloatField()
    forfeited_bps = serializers.FloatField(default=0)
    carry_plan_estimated_value = serializers.FloatField()
    carry_plan_fair_market_value = serializers.FloatField()
    estimated_value_date = serializers.DateField(required=False, allow_null=True)
    fair_market_value_date = serializers.DateField(required=False, allow_null=True)
    carry_plan_id = serializers.CharField()
    sub_pool_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    vesting_start_date = serializers.CharField()
    diluted_bps = serializers.FloatField(default=0, required=False)
    distributions = serializers.FloatField(default=0, required=False)
    entity_name = serializers.CharField(required=False)
    carry_participant_id = serializers.IntegerField()
    full_name = serializers.CharField(required=False)
    participant_estimated_carry = serializers.CharField(required=False)
    participant_estimated_carry_vested = serializers.CharField(required=False)
    participant_estimated_carry_un_vested = serializers.CharField(required=False)
    participant_fair_market_value = serializers.CharField(required=False)
    participant_fair_market_value_vested = serializers.CharField(required=False)
    participant_fair_market_value_un_vested = serializers.CharField(required=False)

    @staticmethod
    def get_vesting_schedule_id(obj):
        try:
            vesting_schedule_id = obj['vesting_schedule']['id']
        except TypeError:
            vesting_schedule_id = obj['vesting_schedule']
        vesting_schedule = get_object_or_404(VestingSchedule, pk=vesting_schedule_id)
        return VestingScheduleBaseInfoSerializer(vesting_schedule).data
    
    


class UserCarryWithVestingDetailSerializer(UserCarryDetailSerializer):
    participant_name = serializers.CharField()
    participant_ecv = serializers.CharField()
    participant_ecv_vested = serializers.CharField()
    participant_ecv_un_vested = serializers.CharField()
    participant_fmv = serializers.CharField()
    participant_fmv_vested = serializers.CharField()
    participant_fmv_un_vested = serializers.CharField()


    @staticmethod
    def get_vesting_schedule_id(obj):
        vesting_schedule = get_object_or_404(VestingSchedule, id=obj['vesting_schedule'])
        if vesting_schedule.custom_display:
            return vesting_schedule.custom_display
        return VestingScheduleDisplaySerializer(vesting_schedule).data

    def to_representation(self, instance):
        response = super().to_representation(instance)

        milestone_schedules = response.get('vesting_schedule_id', {}).get('milestone_vesting_schedules')
        if milestone_schedules:
            carry_plan_id = response['carry_plan_id']
            milestones = CarryPlanMilestone.objects.filter(carry_plan_id=carry_plan_id)
            milestone_map = {}
            for milestone in milestones:
                milestone_map[milestone.milestone_id] = {
                    'date': milestone.date.strftime('%m/%d/%Y') if milestone.date else None,
                    'vesting_percentage': milestone.vesting_percentage
                }
            for milestone_schedule in milestone_schedules:
                milestone_schedule['date'] = milestone_map.get(milestone_schedule['milestone']['id'], {}).get('date')
                milestone_schedule['vesting_percentage'] = milestone_map.get(milestone_schedule['milestone']['id'],
                                                                             {}).get('vesting_percentage')
        update_custom_schedules_dict_with_milestone_data(response['carry_plan_id'],
                                                         response.get('vesting_schedule_id', {}))
        return response


class DealSerializer(serializers.ModelSerializer):
    fund_external_id = serializers.CharField(required=False, write_only=True)
    carry_in_escrow = serializers.FloatField(read_only=True, default=900.96)
    carry_plan_id = serializers.SerializerMethodField()
    carry_plan_name = serializers.SerializerMethodField()
    distributions = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = '__all__'

    def get_distributions(self, obj: Deal):
        total = 0
        for realization in obj.realizations.all():
            realization = realization.realization
            for distribution in realization.distribution_set.all():
                total += distribution.amount
        return total

    def update(self, instance, validated_data):
        if 'fund_external_id' in validated_data:
            try:
                fund = Fund.objects.get(
                    external_id=validated_data.pop('fund_external_id')
                )
                validated_data['fund'] = fund
            except Fund.DoesNotExist:
                raise serializers.ValidationError(f"Fund does not exist!")

        return super().update(instance, validated_data)

    def create(self, validated_data):
        if 'fund_external_id' in validated_data:
            validated_data['fund'] = get_object_or_404(
                Fund,
                external_id=validated_data.pop('fund_external_id'),
                company=self.context['company']
            )
        validated_data['company'] = self.context['company']
        return super().create(validated_data=validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.fund:
            representation['fund_name'] = instance.fund.name
            representation['fund_external_id'] = instance.fund.external_id
        return representation

    @staticmethod
    def get_carry_plan_id(obj: Deal):
        if obj.deal_carry_plan.exists():
            return obj.deal_carry_plan.first().carry_plan.id
        return None

    @staticmethod
    def get_carry_plan_name(obj: Deal):
        if obj.deal_carry_plan.exists():
            return obj.deal_carry_plan.first().carry_plan.name
        return None


class DealReadSerializer(DealSerializer):
    estimated_value = serializers.SerializerMethodField()
    fair_market_value = serializers.SerializerMethodField()
    estimated_value_from_investment = serializers.SerializerMethodField()
    fair_market_value_from_investment = serializers.SerializerMethodField()
    estimated_value_date = serializers.SerializerMethodField()
    fair_market_value_date = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = '__all__'

    @staticmethod
    def get_estimated_value(obj: Deal):
        if obj.deal_investments_count > 0 and obj.investment_estimated_value is not None:
            return obj.investment_estimated_value if obj.investment_estimated_value > 0 else obj.estimated_value
        return obj.estimated_value

    @staticmethod
    def get_estimated_value_from_investment(obj: Deal):
        return obj.deal_investments_count > 0 and obj.investment_estimated_value is not None and obj.investment_estimated_value > 0

    @staticmethod
    def get_estimated_value_date(obj: Deal):
        if obj.deal_investments_count > 0 and obj.investment_latest_estimated_date is not None:
            return obj.investment_latest_estimated_date
        return obj.estimated_value_date

    @staticmethod
    def get_fair_market_value_from_investment(obj):
        return obj.deal_investments_count > 0 and obj.investment_fair_market_value is not None and obj.investment_fair_market_value > 0

    @staticmethod
    def get_fair_market_value_date(obj: Deal):
        if obj.deal_investments_count > 0 and obj.investment_latest_fair_value_date is not None:
            return obj.investment_latest_fair_value_date
        return obj.fair_market_value_date

    @staticmethod
    def get_fair_market_value(obj: Fund):
        if obj.deal_investments_count > 0 and obj.investment_fair_market_value is not None:
            return obj.investment_fair_market_value if obj.investment_fair_market_value > 0 else obj.fair_market_value
        return obj.fair_market_value


class InvestmentTrancheSerializer(serializers.ModelSerializer):
    carry_plan_id = serializers.SerializerMethodField()
    carry_plan_name = serializers.SerializerMethodField()
    deal_name = serializers.CharField(source='deal.name', read_only=True, default=None)

    class Meta:
        model = InvestmentTranche
        fields = '__all__'

    def create(self, validated_data):
        validated_data['company'] = self.context['company']
        return super().create(validated_data=validated_data)

    @staticmethod
    def get_carry_plan_id(obj: InvestmentTranche):
        if hasattr(obj, 'investment_tranche_carry_plan'):
            return obj.investment_tranche_carry_plan.carry_plan.id
        return None

    @staticmethod
    def get_carry_plan_name(obj: InvestmentTranche):
        if hasattr(obj, 'investment_tranche_carry_plan'):
            return obj.investment_tranche_carry_plan.carry_plan.name
        return None


class CreateUpdateFundSerializer(serializers.ModelSerializer):
    is_carry_plan = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        fields = ('name', 'fund_currency', 'target_fund_size',
                  'id', 'external_id', 'is_carry_plan',
                  'estimated_value', 'fair_market_value', 'estimated_value_date',
                  'fair_market_value_date')

    def create(self, validated_data):
        if not validated_data.get('company'):
            validated_data['company'] = self.context['company']
        return super().create(validated_data)

    @staticmethod
    def get_is_carry_plan(obj: Fund):
        has_carry_plan = obj.fund_carry_plans.exists()
        return has_carry_plan


class CarryFundsSerializer(serializers.ModelSerializer):
    fund_id = serializers.IntegerField(source='id')
    participants = serializers.SerializerMethodField()
    unallocated_points = serializers.SerializerMethodField()
    carry_plan_id = serializers.SerializerMethodField()
    carry_plan_name = serializers.SerializerMethodField()
    estimated_value = serializers.SerializerMethodField()
    fair_market_value = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()
    total_distributions = serializers.SerializerMethodField()
    deal_distributions = serializers.SerializerMethodField()
    estimated_value_from_deal = serializers.SerializerMethodField()
    fair_market_value_from_deal = serializers.SerializerMethodField()
    estimated_value_date = serializers.SerializerMethodField()
    fair_market_value_date = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        fields = ('fund_id', 'name', 'target_fund_size', 'participants',
                  'unallocated_points', 'external_id', 'carry_plan_id', 'created_at',
                  'fund_currency', 'estimated_value', 'fair_market_value', 'total_points', 'deal_distributions',
                  'total_distributions', 'estimated_value_date', 'fair_market_value_date', 'carry_plan_name',
                  'estimated_value_from_deal', 'fair_market_value_from_deal')

    @staticmethod
    def get_total_distributions(obj: Fund):
        return get_total_distributions_fund(obj)

    @staticmethod
    def get_deal_distributions(obj: Fund):
        return get_deal_distributions_for_fund(obj)

    def get_participants(self, obj: Fund):
        fund_carry_plans = obj.fund_carry_plans.all()
        participants = []
        for fund_carry_plan in fund_carry_plans:
            last_allocations = fund_carry_plan.carry_plan.last_carry_pool_allocations
            participants.append(len([allocation for allocation in last_allocations if allocation['bps']]))
        return sum(participants)

    def get_unallocated_points(self, obj: Fund):
        fund_carry_plans = obj.fund_carry_plans.all()
        unallocated_bps = []
        for fund_carry_plan in fund_carry_plans:
            carry_plan = fund_carry_plan.carry_plan
            allocations = carry_plan.last_carry_pool_allocations
            copy_allocations = allocations.copy()
            # TODO: we gotta find a way to do this without the n+1 query problem
            get_forfeit_dilute_transferred_adjusted_allocations(copy_allocations, self.context['calculation_date'])
            allocation_bps = sum([allocation.get('bps', 0) for allocation in copy_allocations])
            unallocated_bps.append(Decimal(str(carry_plan.last_carry_pool_bps)) - allocation_bps)
        return sum(unallocated_bps)

    @staticmethod
    def get_carry_plan_id(obj: Fund):
        if obj.fund_carry_plans.exists():
            return obj.fund_carry_plans.first().carry_plan.id
        return None

    @staticmethod
    def get_estimated_value(obj: Fund):
        if obj.fund_deals_count > 0:
            if obj.deal_investments_count > 0:
                if obj.deals_investment_estimated_value:
                    return obj.deals_investment_estimated_value
                return obj.deals_estimated_value if obj.deals_estimated_value else obj.estimated_value
            return obj.deals_estimated_value if obj.deals_estimated_value else obj.estimated_value
        return obj.estimated_value

    @staticmethod
    def get_estimated_value_from_deal(obj: Fund):
        return obj.fund_deals_count > 0 and obj.deals_estimated_value is not None and obj.deals_estimated_value > 0

    @staticmethod
    def get_fair_market_value_from_deal(obj):
        return obj.fund_deals_count > 0 and obj.deals_fair_market_value is not None and obj.deals_fair_market_value > 0

    @staticmethod
    def get_estimated_value_date(obj: Fund):
        if obj.fund_deals_count > 0 and obj.deals_latest_estimated_date is not None:
            return obj.deals_latest_estimated_date
        return obj.estimated_value_date

    @staticmethod
    def get_fair_market_value_date(obj: Fund):
        if obj.fund_deals_count > 0 and obj.deals_latest_fair_value_date is not None:
            return obj.deals_latest_fair_value_date
        return obj.fair_market_value_date

    @staticmethod
    def get_fair_market_value(obj: Fund):
        if obj.fund_deals_count > 0:
            if obj.deal_investments_count > 0:
                if obj.deals_investment_fmv:
                    return obj.deals_investment_fmv
                return obj.deals_fair_market_value if obj.deals_fair_market_value else obj.fair_market_value
            return obj.deals_fair_market_value if obj.deals_fair_market_value else obj.fair_market_value
        return obj.fair_market_value

    @staticmethod
    def get_total_points(obj: Fund):
        total_points = 0
        if obj.fund_carry_plans.exists():
            carry_plan = obj.fund_carry_plans.first().carry_plan
            total_points = carry_plan.last_carry_pool_bps
        return total_points

    @staticmethod
    def get_carry_plan_name(obj: Fund):
        if obj.fund_carry_plans.exists():
            return obj.fund_carry_plans.first().carry_plan.name
        return None


class CarryDocumentSerializer(serializers.ModelSerializer):
    document_file = serializers.FileField(write_only=True)
    document = DocumentSerializer(read_only=True)
    carry_plans = serializers.CharField(write_only=True, required=False)
    sub_pools = serializers.CharField(write_only=True, required=False)
    carry_plans_display = serializers.SerializerMethodField(read_only=True)
    document_type_display = serializers.SerializerMethodField()
    requirements_display = serializers.SerializerMethodField()

    class Meta:
        model = CarryDocument
        fields = '__all__'
        read_only_fields = ('company', 'document', 'document_type_display',
                            'requirements_display', 'carry_plans_display')

    def get_document_type_display(self, obj):
        return obj.get_document_type_display()

    def get_requirements_display(self, obj):
        return obj.get_requirements_display()

    def get_carry_plans_display(self, obj):
        return [item.id for item in obj.carry_plans.all()]

    def update(self, instance, validated_data):
        carry_plans = validated_data.pop('carry_plans', [])
        if carry_plans:
            carry_plans = [int(item) for item in carry_plans.split(',')]
            instance.carry_plans.set(carry_plans)
            instance.save()

        document_file = validated_data.get('document_file')
        if document_file:
            document_file = validated_data.pop('document_file')
            uploaded_document_info = UploadDocumentService.upload(
                document_data=document_file
            )
            document = Document.objects.create(
                title=validated_data.get('name', instance.name),
                content_type=uploaded_document_info.content_type,
                uploaded_by_admin=self.context['admin_user'],
                document_id=uploaded_document_info.document_id,
                document_path=uploaded_document_info.document_path,
                extension=uploaded_document_info.extension,
                partner_id=uuid.uuid4().hex,
                company=self.context['company'],
                access_scope=Document.AccessScopeOptions.COMPANY.value
            )
            validated_data['document'] = document

        validated_data['requirements'] = CarryDocument.RequirementsType.ACKNOWLEDGEMENT.value
        if validated_data.get('require_signature', False):
            validated_data['requirements'] = CarryDocument.RequirementsType.SIGNATURE.value

        return super().update(instance, validated_data)

    def create(self, validated_data):
        carry_plans = validated_data.pop('carry_plans', [])
        if carry_plans:
            carry_plans = [int(item) for item in carry_plans.split(',')]
        company = self.context['company']
        document_file = validated_data.pop('document_file')
        uploaded_document_info = UploadDocumentService.upload(
            document_data=document_file
        )

        document = Document.objects.create(
            title=validated_data['name'],
            content_type=uploaded_document_info.content_type,
            uploaded_by_admin=self.context['admin_user'],
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            extension=uploaded_document_info.extension,
            partner_id=uuid.uuid4().hex,
            company=company,
            access_scope=Document.AccessScopeOptions.COMPANY.value
        )
        validated_data['company'] = company
        validated_data['document'] = document
        validated_data['document_status'] = True
        validated_data['requirements'] = CarryDocument.RequirementsType.ACKNOWLEDGEMENT.value
        if validated_data.get('require_signature', False):
            validated_data['requirements'] = CarryDocument.RequirementsType.SIGNATURE.value

        instance = CarryDocument.objects.create(**validated_data)
        instance.carry_plans.set(carry_plans)

        return instance


class CarryDocumentParticipantSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(source='carry_document.document')
    signed_document = DocumentSerializer()
    document_type_display = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    participant_name = serializers.SerializerMethodField()
    is_gp_signature_required = serializers.BooleanField(source='carry_document.require_gp_signature')
    is_signature_required = serializers.BooleanField(source='carry_document.require_signature')
    carry_document_name = serializers.CharField(read_only=True, source='carry_document.name')
    carry_document_description = serializers.CharField(read_only=True, source='carry_document.description')

    class Meta:
        model = ParticipantCarryDocument
        fields = '__all__'
        read_only_fields = ('company', 'document', 'document_type_display', 'status',
                            'participant_name', 'is_gp_signature_required', 'is_signature_required',
                            'carry_document_name', 'signed_document', 'user')

    def get_document_type_display(self, obj):
        return obj.carry_document.get_document_type_display()

    def get_status(self, obj):
        if not obj.is_released:
            return 'Unreleased'

        if obj.carry_document.require_signature:
            if not obj.completed:
                return 'Pending Signature'
            if obj.carry_document.require_gp_signature and not obj.gp_signing_complete:
                return 'Pending GP Signature'
            return 'Signed'

        else:
            if obj.is_acknowledged:
                return 'Acknowledgement Complete'
            return 'Pending Acknowledgement'

    def get_participant_name(self, obj: ParticipantCarryDocument):
        return obj.user.get_full_name()

    def update(self, instance, validated_data):
        if validated_data.get('is_released'):
            AdminParticipantDocumentService(instance.company).release_document_for_participant(instance)

        return super().update(instance, validated_data)


class CarryParticipantSerializer(serializers.ModelSerializer):
    email = serializers.CharField(write_only=True, required=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CarryParticipant
        fields = '__all__'
        extra_kwargs = {'company': {'required': False}}

    def validate(self, data):
        email = data.get('email')
        retail_user = RetailUser.include_deleted.filter(email__iexact=email).first()
        data['retail_user'] = retail_user if retail_user else None
        return data

    def create(self, validated_data):
        retail_user = validated_data.pop('retail_user')
        email = validated_data.pop('email')
        if not retail_user:
            payload = {
                'email': email,
                'first_name': validated_data.get('first_name', ' '),
                'last_name': validated_data.get('last_name', ' ')
            }
            create_user_service = CreateUserService(payload=payload, company=self.context['company'])
            retail_user = create_user_service.create_user()

        validated_data['company'] = self.context['company']
        carry_participant = super().create(validated_data)
        carry_participant.associate_with_user(user=retail_user)
        return carry_participant

    @staticmethod
    def get_full_name(obj: CarryParticipant):
        return obj.get_full_name()


class UserCarryParticipantSerializer(serializers.ModelSerializer):
    email = serializers.CharField()
    full_name = serializers.SerializerMethodField(read_only=True)
    title = serializers.SerializerMethodField(read_only=True)
    hire_date = serializers.SerializerMethodField(read_only=True)
    entity_type = serializers.SerializerMethodField(read_only=True)
    entity_name = serializers.SerializerMethodField(read_only=True)
    estimated_carry_value = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = RetailUser
        fields = '__all__'
        extra_kwargs = {'company': {'required': False}}

    @staticmethod
    def get_full_name(obj: RetailUser):
        return obj.get_full_name()

    @staticmethod
    def get_hire_date(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        return getattr(employment_record, 'hire_date', "")

    @staticmethod
    def get_entity_type(obj: RetailUser):
        return ",".join({user_carry_participant.carry_participant.get_entity_display() for user_carry_participant in
                         obj.user_carry_participants.all()})

    @staticmethod
    def get_entity_name(obj: RetailUser):
        return ",".join({user_carry_participant.carry_participant.entity_name for user_carry_participant in
                         obj.user_carry_participants.all() if user_carry_participant.carry_participant.entity_name})

    @staticmethod
    def get_title(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        positions = getattr(employment_record, 'positions', None)
        current_position = positions.filter(end_date=None,
                                            company=participant_profile.company).first() if positions else None
        if current_position:
            return current_position.display_title

    def get_estimated_carry_value(self, obj):
        carry_participants_with_estimated_values = self.context['estimated_value_dict'].get(obj.id, {})
        total_carry_estimated_value = 0
        for _, value in carry_participants_with_estimated_values.items():
            total_carry_estimated_value = total_carry_estimated_value + value

        return float(total_carry_estimated_value)


class AdminCreateDistributionSerializer(serializers.Serializer):
    fund_external_id = serializers.CharField(required=False, write_only=True)
    deal_external_id = serializers.CharField(required=False, write_only=True)
    investment_tranche_external_id = serializers.CharField(required=False, write_only=True)
    amount = serializers.DecimalField(max_digits=13, decimal_places=2)
    escrow = serializers.DecimalField(max_digits=13, decimal_places=2)
    allocations = serializers.ListField(required=True, write_only=True)
    date = serializers.DateTimeField(default=now())
    is_manual = serializers.BooleanField(required=False, write_only=True)

    def __init__(self, *args, **kwargs):
        request = kwargs.get('context', {}).get('request')
        if request:
            request_data = request.data
            if request_data.get('is_manual'):
                CarryDistributionAPILog.objects.create(
                    company=kwargs.get('context', {}).get('company'),
                    request_method=request.method,
                    request_path=request.path,
                    request_body=request_data
                )
        super().__init__(*args, **kwargs)

    def create(self, validated_data):
        with atomic():
            amount = validated_data['amount']
            escrow = validated_data['escrow']
            realization_date = validated_data['date']
            company = self.context['company']
            allocations = validated_data['allocations']

            realization = Realization.objects.create(company=company, amount=amount, date=realization_date)
            if 'fund_carry_plan' in validated_data:
                fund_carry_plan = validated_data['fund_carry_plan']
                FundRealization.objects.create(
                    company=company,
                    fund_carry_plan=fund_carry_plan,
                    realization=realization
                )
            elif 'investment_tranche' in validated_data:
                investment_tranche = validated_data['investment_tranche']
                InvestmentTrancheRealization.objects.create(
                    company=company,
                    investment_tranche=investment_tranche,
                    realization=realization
                )
            else:
                deal = validated_data['deal']
                DealRealization.objects.create(
                    company=company,
                    deal=deal,
                    realization=realization
                )

            distribution = Distribution.objects.create(
                company=company,
                amount=amount,
                escrow=escrow,
                realization=realization,
                date=realization_date,
                is_manual=validated_data.get('is_manual', False)
            )

            for allocation in allocations:
                points = allocation['bps']
                distribution_amount = allocation.get('amount') or 0
                escrow_amount = allocation.get('escrow') or 0
                net_distribution = allocation.get('net_distribution') or 0
                escrow_percentage = allocation.get('escrow_percentage') or 0
                ParticipantDistribution.objects.create(
                    company=company,
                    allocation_id=allocation['allocation_id'],
                    distribution=distribution,
                    date=realization_date,
                    escrow=str(escrow_amount),
                    amount=str(distribution_amount),
                    participant_id=allocation['carry_participant_id'],
                    net_distribution=net_distribution,
                    escrow_percentage=escrow_percentage,
                    points=points
                )
            return distribution

    def _validate_fund_realization(self, attrs):
        fund_external_id = attrs.pop('fund_external_id')
        qs = FundCarryPlan.objects.filter(fund__external_id=fund_external_id).select_related('fund', 'carry_plan')
        if not qs.exists():
            raise serializers.ValidationError(f'No carry fund with external id {fund_external_id}')
        fund_carry_plan = qs.first()
        attrs['fund_carry_plan'] = fund_carry_plan
        return attrs

    def _validate_deal_realization(self, attrs):
        deal_external_id = attrs.pop('deal_external_id')
        qs = DealCarryPlan.objects.filter(deal__external_id=deal_external_id).select_related('deal', 'carry_plan')
        if not qs.exists():
            deal_qs = Deal.objects.filter(company=self.context['company'], external_id=deal_external_id).select_related(
                'fund').prefetch_related('fund__fund_carry_plans')
            if not deal_qs.exists():
                raise serializers.ValidationError(f'No deal with external id {deal_external_id}')
            deal = deal_qs.first()
            deal_fund = deal.fund
            deal_fund_carry_plans = deal_fund.fund_carry_plans
            if not deal_fund_carry_plans.exists():
                raise serializers.ValidationError(
                    f'No deal with external id {deal_external_id} associated with a carry plan or a carry fund')
            attrs['carry_plan'] = deal_fund_carry_plans.first().carry_plan
            attrs['deal'] = deal
            return attrs

        deal_carry_plan = qs.first()
        attrs['deal'] = deal_carry_plan.deal
        return attrs

    def _validate_investment_tranche_realization(self, attrs):
        investment_tranche_external_id = attrs.pop('investment_tranche_external_id')
        qs = InvestmentTrancheCarryPlan.objects.filter(
            investment_tranche__external_id=investment_tranche_external_id
        ).select_related('investment_tranche', 'carry_plan')
        if not qs.exists():
            investment_tranche_qs = InvestmentTranche.objects.filter(
                company=self.context['company'],
                external_id=investment_tranche_external_id
            ).select_related(
                'deal'
            ).prefetch_related('deal__deal_carry_plan')

            if not investment_tranche_qs.exists():
                raise serializers.ValidationError(
                    f'No Investment Tranche with external id {investment_tranche_external_id}')
            investment_tranche = investment_tranche_qs.first()
            deal = investment_tranche.deal
            deal_carry_plans = deal.deal_carry_plan
            if not deal_carry_plans.exists():
                deal_fund = deal.fund
                deal_fund_carry_plans = deal_fund.fund_carry_plans
                if not deal_fund_carry_plans.exists():
                    raise serializers.ValidationError(
                        f'No investment tranche with external id {investment_tranche_external_id} associated with a carry plan or a deal')
                else:
                    attrs['carry_plan'] = deal_fund_carry_plans.first().carry_plan
                    attrs['investment_tranche'] = investment_tranche
            else:
                attrs['carry_plan'] = deal_carry_plans.first().carry_plan
                attrs['investment_tranche'] = investment_tranche
        else:
            investment_tranche_carry_plan = qs.first()
            attrs['investment_tranche'] = investment_tranche_carry_plan.investment_tranche
            attrs['carry_plan'] = investment_tranche_carry_plan.carry_plan
        return attrs

    def validate(self, attrs):
        if not self.instance:
            if 'fund_external_id' in attrs:
                attrs = self._validate_fund_realization(attrs)
            elif 'investment_tranche_external_id' in attrs:
                attrs = self._validate_investment_tranche_realization(attrs)
            else:
                attrs = self._validate_deal_realization(attrs)
        else:
            attrs = self._validate_update(attrs)
        return attrs

    def _validate_update(self, attrs):
        company = self.context['company']
        fund_realization_qs = FundRealization.objects.filter(company=company, realization=self.instance.realization)
        deal_realization_qs = DealRealization.objects.filter(company=company, realization=self.instance.realization)
        if fund_realization_qs.exists():
            fund_realization = fund_realization_qs.first()
            attrs['carry_plan'] = fund_realization.fund_carry_plan.carry_plan
        else:
            deal_realization = deal_realization_qs.first()
            attrs['carry_plan'] = deal_realization.deal_carry_plan.carry_plan
        return attrs


class ParticipantDistributionSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    bps = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ParticipantDistribution
        fields = '__all__'

    def get_full_name(self, obj: ParticipantDistribution):
        carry_participant = get_object_or_404(CarryParticipant, id=obj.participant_id)
        return carry_participant.get_full_name()

    def get_bps(self, obj: ParticipantDistribution):
        return obj.points

    def get_source(self, obj: ParticipantDistribution):
        return obj.source_name()


class DistributionSerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()
    allocations = ParticipantDistributionSerializer(source='distribution_participants', many=True, read_only=True)

    class Meta:
        model = Distribution
        fields = '__all__'

    def get_source(self, obj: Distribution):
        return obj.source_name()

    def update(self, instance, validated_data):
        with atomic():
            allocation_distributions = self.initial_data['allocations']
            new_amount = validated_data.get('amount', instance.amount)
            new_escrow = validated_data.get('escrow', instance.escrow)
            company = self.context['company']

            instance.amount = new_amount
            instance.escrow = new_escrow
            instance.save()

            realization = instance.realization
            realization.amount = instance.amount
            realization.save()

            for allocation in allocation_distributions:
                participant_distribution_id = allocation['id']
                participant_distribution = ParticipantDistribution.objects.get(
                    company=company,
                    pk=participant_distribution_id
                )
                new_distribution_amount = allocation['amount']
                new_escrow_amount = allocation['escrow']
                new_net_distribution = allocation['net_distribution']
                new_escrow_percentage = allocation['escrow_percentage']

                participant_distribution.amount = new_distribution_amount
                participant_distribution.escrow = new_escrow_amount
                participant_distribution.net_distribution = new_net_distribution
                participant_distribution.escrow_percentage = new_escrow_percentage
                participant_distribution.save()

            return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        external_id = None
        # add carry plan level data here for now
        realization = instance.realization
        if hasattr(realization, 'fund_realization'):
            carry_plan = realization.fund_realization.fund_carry_plan.carry_plan
            external_id = realization.fund_realization.fund_carry_plan.fund.external_id
        elif hasattr(realization, 'investment_tranche_realization'):
            investment_tranche: InvestmentTranche = realization.investment_tranche_realization.investment_tranche
            external_id = investment_tranche.external_id
            if investment_tranche.investment_tranche_carry_plan:
                carry_plan = investment_tranche.investment_tranche_carry_plan.carry_plan
            elif investment_tranche.deal.deal_carry_plan.exists():
                carry_plan = investment_tranche.deal.deal_carry_plan.first().carry_plan
            else:
                carry_plan = investment_tranche.deal.fund.fund_carry_plans.first().carry_plan
        elif hasattr(realization, 'deal_realization'):
            deal: Deal = realization.deal_realization.deal
            external_id = deal.external_id
            if deal.deal_carry_plan.exists():
                carry_plan = deal.deal_carry_plan.first().carry_plan
            else:
                carry_plan = deal.fund.fund_carry_plans.first().carry_plan

        carry_plan_name = carry_plan.name
        total_participants = len(representation['allocations'])

        matching_carry_pool = CarryPool.objects.filter(
            carry_plan=carry_plan,
            company=self.context['company']
        ).order_by('-created_at').first()

        total_points = matching_carry_pool.bps
        allocated_points = 0
        for allocation in representation['allocations']:
            allocated_points += allocation['points']

        representation['total_points'] = total_points
        representation['carry_plan_name'] = carry_plan_name
        representation['total_participants'] = total_participants
        representation['allocated_points'] = allocated_points
        representation['unallocated_points'] = total_points - allocated_points
        representation['external_id'] = external_id
        return representation


class CarryShareClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarryShareClass
        fields = '__all__'
        read_only_fields = ('company',)

    def create(self, validated_data):
        validated_data['company'] = self.context['company']
        return super().create(validated_data=validated_data)


class CarryVehicleShareClassSerializer(serializers.ModelSerializer):
    template_share_class = CarryShareClassSerializer()

    class Meta:
        model = CarryVehicleShareClass
        fields = '__all__'


class CarryVehicleSerializer(serializers.ModelSerializer):
    share_classes = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    classes = serializers.SerializerMethodField()

    class Meta:
        model = CarryVehicle
        fields = '__all__'
        read_only_fields = ('company',)

    def create(self, validated_data):
        validated_data['company'] = self.context['company']
        share_classes_ids = validated_data.pop('share_classes', [])
        vehicle = super().create(validated_data=validated_data)
        share_classes = CarryShareClass.objects.filter(
            id__in=share_classes_ids,
        )
        for share_class in share_classes:
            CarryVehicleShareClass.objects.get_or_create(
                template_share_class=share_class,
                vehicle=vehicle,
                defaults={
                    'vesting_schedule': share_class.vesting_schedule
                }
            )
        return vehicle

    def update(self, instance, validated_data):
        share_classes_ids = validated_data.pop('share_classes', [])
        existing_share_class_ids = set(CarryVehicleShareClass.objects.filter(
            vehicle=instance
        ).values_list('template_share_class_id'))
        ids_to_delete = set(existing_share_class_ids) - set(share_classes_ids)

        CarryVehicleShareClass.objects.filter(
            vehicle=instance,
            template_share_class_id__in=ids_to_delete
        ).update(deleted=True)

        share_classes = CarryShareClass.objects.filter(
            id__in=share_classes_ids,
        )

        for share_class in share_classes:
            CarryVehicleShareClass.objects.get_or_create(
                template_share_class=share_class,
                vehicle=instance,
                defaults={
                    'vesting_schedule': share_class.vesting_schedule
                }
            )

        return super().update(instance, validated_data)

    @staticmethod
    def get_classes(instance):
        share_classes = CarryVehicleShareClass.objects.filter(
            vehicle=instance
        ).select_related('template_share_class')
        share_classes = CarryVehicleShareClassSerializer(share_classes, many=True)
        return share_classes.data


class CarryPlanDiluteSerializer(serializers.Serializer):
    dilute_points = serializers.FloatField(required=True)
    dilute_date = serializers.CharField(max_length=120, required=True)
    allocations = serializers.JSONField(required=True)
    mode = serializers.CharField(max_length=120, default=EVEN_DILUTION)

    def validate(self, attrs):
        if attrs['dilute_points'] <= 0:
            raise serializers.ValidationError({'dilute_points': 'must be greater than 0!'})

        if len(attrs['allocations']) == 0:
            raise serializers.ValidationError({'allocations': 'cannot be empty!'})

        if attrs['mode'] not in (EVEN_DILUTION, PRO_RATA_DILUTION):
            raise serializers.ValidationError({'mode': 'invalid dilute mode type'})

        return attrs


class CarrySubPoolCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarrySubPool
        fields = '__all__'

    def update(self, instance, validated_data):
        carry_document_ids = self.initial_data.get('carry_documents', [])
        instance.subpool_carry_documents.set(carry_document_ids)
        return super().update(instance, validated_data)


class CarrySubPoolSerializer(serializers.ModelSerializer):
    vesting_schedule = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    template_share_class_name = serializers.SerializerMethodField()
    allocated = serializers.SerializerMethodField()
    un_allocated = serializers.SerializerMethodField()
    carry_documents = serializers.SerializerMethodField()

    def get_vesting_schedule(self, obj):
        return VestingScheduleBaseInfoSerializer(obj.vesting_schedule).data

    def get_vehicle_name(self, obj):
        if obj.vehicle:
            return obj.vehicle.legal_name
        return ""

    def get_template_share_class_name(self, obj):
        if obj.template_share_class:
            return obj.template_share_class.legal_name
        return ""

    def get_allocated(self, obj):
        return Decimal(self.context.get('sub_pools_details', {}).get(obj.id, 0))

    def get_un_allocated(self, obj):
        return obj.bps - Decimal(self.context.get('sub_pools_details', {}).get(obj.id, 0))

    def get_carry_documents(self, obj):
        from .serializers import CarryDocumentSerializer
        serializer = CarryDocumentSerializer(
            obj.subpool_carry_documents.all(),
            many=True
        )
        return serializer.data

    class Meta:
        model = CarrySubPool
        fields = '__all__'


class SubPoolPointsMovingSerializer(serializers.Serializer):
    source_pool_id = serializers.IntegerField(required=True)
    target_pool_id = serializers.IntegerField(required=True)
    points = serializers.FloatField(required=True)

    def validate(self, attrs):
        source_pool_id = attrs['source_pool_id']
        points = attrs['points']
        company = self.context['company']

        source_pool = get_object_or_404(
            CarrySubPool,
            id=source_pool_id,
            carry_plan__company=company
        )  # type: CarrySubPool

        allocation_details = get_allocated_unallocated_point_sub_pool(
            source_pool,
            self.context['calculation_date']
        )

        if allocation_details['unallocated_points'] < Decimal(str(points)):
            raise serializers.ValidationError({'points': 'cannot move out more points than available!'})
        return attrs

    def create(self, validated_data):
        source_pool_id = validated_data['source_pool_id']
        target_pool_id = validated_data['target_pool_id']
        points = validated_data['points']
        company = self.context['company']
        source_pool = get_object_or_404(CarrySubPool, id=source_pool_id,
                                        carry_plan__company=company)  # type: CarrySubPool
        target_pool = get_object_or_404(CarrySubPool, id=target_pool_id,
                                        carry_plan__company=company)  # type: CarrySubPool

        with atomic():
            source_pool.bps -= Decimal(str(points))
            source_pool.save()

            target_pool.bps += Decimal(str(points))
            target_pool.save()

        return validated_data


class CompleteCarryParticipant(serializers.ModelSerializer):
    entity_type = serializers.CharField(source="get_entity_display", read_only=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = CarryParticipant
        fields = "__all__"

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        internal_value['id'] = data['id']
        return internal_value


class CarryParticipantUserSerializer(serializers.ModelSerializer):
    carry_participant = CompleteCarryParticipant()

    class Meta:
        model = CarryParticipantUser
        fields = "__all__"


class ProfileSerializer(serializers.ModelSerializer):
    job_band = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    office_location = serializers.SerializerMethodField()
    hire_date = serializers.SerializerMethodField()
    separation_date = serializers.SerializerMethodField()
    user_first_name = serializers.CharField(source="first_name")
    user_last_name = serializers.CharField(source="last_name")
    user_carry_participants = CarryParticipantUserSerializer(many=True)
    current_position_title = serializers.SerializerMethodField()
    current_position_annual_salary = serializers.SerializerMethodField()
    current_position_target_bonus = serializers.SerializerMethodField()
    current_position_start_date = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()
    ein = serializers.SerializerMethodField()

    class Meta:
        model = RetailUser
        fields = "__all__"

    @staticmethod
    def get_employee_id(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        if not employment_record:
            return str(obj.id)

        if employment_record.ein:
            return employment_record.ein

        return str(employment_record.id)

    @staticmethod
    def get_job_band(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        job_band = getattr(employment_record, 'job_band', None)
        if job_band:
            return job_band.name
        return ""

    @staticmethod
    def get_department(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        department = getattr(employment_record, 'department', None)
        if department:
            return department.name
        return ""

    @staticmethod
    def get_office_location(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        office_location = getattr(employment_record, 'office_location', None)
        if office_location:
            return office_location.name
        return ""

    @staticmethod
    def get_hire_date(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        if employment_record:
            return employment_record.hire_date
        return ""

    @staticmethod
    def get_separation_date(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        if employment_record:
            return employment_record.separation_date
        return ""

    @staticmethod
    def get_status(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        if employment_record and employment_record.status:
            return employment_record.status
        return ""

    @staticmethod
    def get_current_position_title(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        positions = getattr(employment_record, 'positions', None)
        if positions and positions.count() > 0:
            return positions.latest('start_date').display_title
        return ""

    @staticmethod
    def get_current_position_annual_salary(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        positions = getattr(employment_record, 'positions', None)
        if positions and positions.count() > 0:
            return positions.latest('start_date').annual_salary
        return ""

    @staticmethod
    def get_current_position_target_bonus(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        positions = getattr(employment_record, 'positions', None)
        if positions and positions.count() > 0:
            return positions.latest('start_date').target_bonus
        return ""

    @staticmethod
    def get_current_position_start_date(obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        positions = getattr(employment_record, 'positions', None)
        if positions and positions.count() > 0:
            return positions.latest('start_date').start_date
        return ""

    def get_ein(self, obj: RetailUser):
        participant_profile = getattr(obj, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        if employment_record:
            return employment_record.ein


class UpdateProfileSerializer(serializers.ModelSerializer):
    user_first_name = serializers.CharField(source='first_name')
    user_last_name = serializers.CharField(source='last_name')
    carry_participants = CompleteCarryParticipant(many=True, write_only=True)

    class Meta:
        model = RetailUser
        fields = (
            'user_first_name',
            'user_last_name',
            'carry_participants',
            'id')

    def validate(self, attrs):
        carry_participants = attrs.get('carry_participants', [])
        for carry_participant in carry_participants:
            if carry_participant['entity'] == CarryParticipant.EntityType.INDIVIDUAL.value:
                if 'entity_name' in carry_participant and (
                        'first_name' not in carry_participant or 'last_name' not in carry_participant):
                    raise ValidationError(
                        f"Carry participant is individual and has entity name set and not first name or last name")
            else:
                if 'entity_name' not in carry_participant and (
                        'first_name' in carry_participant or 'last_name' in carry_participant):
                    raise ValidationError(
                        f"Carry participant is an entity and has set first name or last name but not entity name")
        return attrs

    def update(self, instance: RetailUser, validated_data):
        instance.first_name = validated_data['first_name']
        instance.last_name = validated_data['last_name']
        instance.save()

        carry_participants = validated_data.get('carry_participants', [])
        for carry_participant in carry_participants:
            CarryParticipant.objects.update_or_create(
                id=carry_participant['id'],
                defaults={
                    'entity': carry_participant['entity'],
                    'first_name': carry_participant.get('first_name', None),
                    'last_name': carry_participant.get('last_name', None),
                    'entity_name': carry_participant.get('entity_name', None),
                }
            )

        return instance


class UpdateEmploymentSerializer(serializers.ModelSerializer):
    job_band = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    department = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    office_location = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    hire_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    separation_date = serializers.DateField(required=False, allow_null=True)
    current_position_title = serializers.CharField(write_only=True, )
    status = serializers.CharField(write_only=True, )
    current_position_annual_salary = serializers.DecimalField(write_only=True, decimal_places=4, max_digits=12,
                                                              required=False, allow_null=True)
    current_position_target_bonus = serializers.DecimalField(write_only=True, decimal_places=4, max_digits=12,
                                                             required=False, allow_null=True)
    current_position_start_date = serializers.DateField(write_only=True, )
    ein = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = RetailUser
        fields = (
            'job_band',
            'department',
            'office_location',
            'hire_date',
            'separation_date',
            'current_position_title',
            'status',
            'current_position_annual_salary',
            'current_position_target_bonus',
            'current_position_start_date',
            'id',
            'ein'
        )

    def validate(self, attrs):
        hire_date = attrs.get('hire_date')
        separation_date = attrs.get('separation_date', None)
        if separation_date and hire_date > separation_date:
            raise ValidationError(f"Hire date can't be after separation date")
        return attrs

    def update(self, instance: RetailUser, validated_data):
        has_participant_profile = ParticipantProfile.objects.filter(
            company=self.context['company'],
            user=instance
        ).exists()
        if not has_participant_profile:
            participant_profile = ParticipantProfile.objects.create(company=self.context['company'], user=instance)
            instance.user_participant_profile = participant_profile
            instance.save()
            employment_record = EmploymentRecord.objects.create(
                participant_profile=participant_profile,
                company=self.context['company'],
                job_band_id=validated_data.get('job_band', None),
                department_id=validated_data.get('department', None),
                office_location_id=validated_data.get('office_location', None),
                hire_date=validated_data.get('hire_date', None),
                separation_date=validated_data.get('separation_date', None),
                ein=validated_data.get('ein', None),
            )
            participant_profile.employment_record = employment_record
            participant_profile.save()
        else:
            participant_profile = instance.user_participant_profile
            employment_record = participant_profile.employment_record
            if not employment_record:
                employment_record = EmploymentRecord.objects.create(
                    participant_profile=participant_profile,
                    company=self.context['company']
                )
                participant_profile.employment_record = employment_record
                participant_profile.save()
            employment_record.job_band_id = validated_data.get('job_band', None)
            employment_record.department_id = validated_data.get('department', None)
            employment_record.office_location_id = validated_data.get('office_location', None)
            employment_record.hire_date = validated_data.get('hire_date', None)
            employment_record.ein = validated_data.get('ein', None)
            separation_date = validated_data.get('separation_date', None)
            if separation_date:
                employment_record.separation_date = separation_date
            employment_record.save()

        defaults = {
            'annual_salary': validated_data.get('current_position_annual_salary', None),
            'target_bonus': validated_data.get('current_position_target_bonus', None),
            'start_date': validated_data['current_position_start_date']
        }

        if 'current_position_title' in validated_data:
            defaults['functional_role_id'] = validated_data['current_position_title']

        employment_record.positions.update_or_create(
            company=self.context['company'],
            end_date__isnull=True,  # We only want to update the current active position
            defaults=defaults
        )

        if employment_record.status != validated_data.get('status'):
            EmploymentRecordStatusHistory.objects.create(
                employment_record=employment_record,
                status=validated_data['status'],
                updated_by=self.context['request'].user
            )
        return instance


class CarryListAllUsersSerializer(serializers.ModelSerializer):
    email = serializers.CharField(read_only=True, source='user.email')
    first_name = serializers.CharField(read_only=True, source='user.first_name')
    last_name = serializers.CharField(read_only=True, source='user.last_name')
    is_individual_participant = serializers.SerializerMethodField()

    class Meta:
        model = CompanyUser
        fields = ('email', 'first_name', 'last_name', 'is_individual_participant')

    @staticmethod
    def get_is_individual_participant(obj: CompanyUser):
        return CarryParticipantUser.objects.filter(
            user=obj.user,
            carry_participant__entity=CarryParticipant.EntityType.INDIVIDUAL.value
        ).exists()


class CompanyCarryPlansExportSerializer(serializers.Serializer):
    participant = serializers.CharField(allow_blank=True)
    grant_date = serializers.DateField()
    vehicle = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    share_class = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    vesting_start_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    vested = serializers.FloatField()
    unvested = serializers.SerializerMethodField()
    total = serializers.FloatField()

    @staticmethod
    def get_unvested(obj):
        return obj['total'] - obj['vested']


class CompanyAllocationsExportSerializer(serializers.Serializer):
    participant = serializers.CharField(allow_blank=True)
    carry_plan_name = serializers.CharField(allow_blank=True)
    sub_pool_name = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    grant_date = serializers.DateField(format='%m/%d/%Y')
    vehicle = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    share_class = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    vesting_start_date = serializers.DateField(format='%m/%d/%Y', required=False, allow_null=True)
    vested = serializers.FloatField()
    unvested = serializers.SerializerMethodField()
    points = serializers.FloatField()
    fair_market_value = CurrencyField(required=False, allow_null=True)
    estimated_value = CurrencyField(required=False, allow_null=True)
    estimated_value_vested = CurrencyField(required=False, allow_null=True)
    estimated_value_unvested = CurrencyField(required=False, allow_null=True)
    vested_fair_market_value = CurrencyField(required=False, allow_null=True)
    unvested_fair_market_value = CurrencyField(required=False, allow_null=True)
    distributions = CurrencyField(required=False, allow_null=True)
    vesting_schedule = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    source = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    fair_market_value_as_of = serializers.DateField(format='%m/%d/%Y', required=False, allow_null=True)
    estimated_value_as_of = serializers.DateField(format='%m/%d/%Y', required=False, allow_null=True)

    @staticmethod
    def get_unvested(obj):
        return obj['points'] - obj['vested']


class CarryGpCommitmentSerializer(serializers.ModelSerializer):
    participant_full_name = serializers.SerializerMethodField()

    class Meta:
        model = CarryGpCommitment
        fields = '__all__'

    @staticmethod
    def get_participant_full_name(obj):
        return obj.carry_participant.get_full_name()


class CarryTransferPointsSerializer(serializers.Serializer):
    transfer_to_allocations = serializers.JSONField(required=True)
    transfer_from_allocation = serializers.JSONField(required=True)

    def validate(self, attrs):
        from_allocation_id = attrs.get('transfer_from_allocation', {}).get('allocation_id', '')
        for item in attrs.get('transfer_to_allocations'):
            transfer_date = item.get('transfer_date')
            transfer_points = item.get('transfer_points')
            if not transfer_date or not transfer_points:
                raise ValidationError(f"transfer_date and points are required!")
            transfer_date = item['transfer_date'] = datetime.strptime(transfer_date, '%Y-%m-%dT%H:%M:%S.%fZ')
            future_actions = AllocationAction.objects.filter(
                allocation_id=from_allocation_id,
                grant_date__date__gte=transfer_date
            ).exists()
            if future_actions:
                raise ValidationError(f"Transfer Date must be greater than future allocation actions")
        return attrs


class CarryHurdleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarryHurdle
        exclude = ('carry_plan', 'source_allocation_id')

    def validate(self, attrs):
        carry_plan = self.context['carry_plan']
        applies_to = attrs['applies_to']
        for allocation_id in self.context['source_allocations']:
            if applies_to == CarryHurdle.AppliesToType.ECV.value:
                ecv_hurdle = CarryHurdle.objects.filter(
                    carry_plan=carry_plan,
                    source_allocation_id=allocation_id,
                    applies_to=CarryHurdle.AppliesToType.ECV.value
                ).exists()
                if ecv_hurdle:
                    raise ValidationError("One or more selected allocations already have a hurdle based on the "
                                          "selected attribute and cannot be duplicated")

            if applies_to == CarryHurdle.AppliesToType.FMV.value:
                fmv_hurdle = CarryHurdle.objects.filter(
                    carry_plan=carry_plan,
                    source_allocation_id=allocation_id,
                    applies_to=CarryHurdle.AppliesToType.FMV.value
                ).exists()
                if fmv_hurdle:
                    raise ValidationError("One or more selected allocations already have a hurdle based on the "
                                          "selected attribute and cannot be duplicated")

        return attrs

    def create(self, validated_data):
        validated_data['carry_plan'] = self.context['carry_plan']
        validated_data['impacted_allocations_ids'] = self.context['impacted_allocations']
        response = None
        for item in self.context['source_allocations']:
            validated_data['source_allocation_id'] = item
            response = super().create(validated_data)
        return response

    def update(self, instance, validated_data):
        validated_data['source_allocation_id'] = self.context['source_allocation']['allocation_id']
        impacted_allocation_ids = [allocation['allocation_id'] for allocation in self.context['impacted_allocations']]
        validated_data['impacted_allocations_ids'] = impacted_allocation_ids
        return super().update(instance, validated_data)


class CarryHurdleListSerializer(serializers.ModelSerializer):
    source_allocation = serializers.SerializerMethodField()
    impacted_allocations = serializers.SerializerMethodField()

    class Meta:
        model = CarryHurdle
        fields = '__all__'


    def get_source_allocation(self, obj: CarryHurdle):
        return self.context.get('allocations_map', {}).get(obj.source_allocation_id)

    def get_impacted_allocations(self, obj: CarryHurdle):
        impacted_allocations = []
        for allocation_id in obj.impacted_allocations_ids:
            impacted_allocations.append(
                self.context.get('allocations_map', {}).get(allocation_id)
            )
        return impacted_allocations


class AllocationValueAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllocationValueAdjustment
        fields = '__all__'
        read_only_fields = ('created_by',)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['admin_user']
        return super().create(validated_data=validated_data)
