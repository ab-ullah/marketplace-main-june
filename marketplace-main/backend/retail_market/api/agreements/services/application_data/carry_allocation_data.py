from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone

from api.agreements.services.application_data import SubscriptionField
from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, PARTICIPANT_CARRY_DOCUMENT, DATE_TYPE
from api.carry_pools.models import ParticipantCarryDocument, VestingSchedule, CarryParticipant, CarryShareClass, \
    CarryPool, AllocationAction
from api.carry_pools.utils import calculate_allocations_by_date, calculate_vested_percentage, format_decimal_for_docs, \
    format_four_decimals_for_docs
from api.employment_records.models import EmploymentRecord
from api.libs.utils.format_date import format_date
from api.libs.utils.user_name import get_display_name
from dateutil.parser import parse as dt_parse

PARTICIPANT_NAME_FIELD = 'participant_name'
ALLOCATION_AMOUNT_FIELD = 'allocation_amount'
AWARD_DATE_FIELD = 'award_date'
PLAN_NAME_FIELD = 'plan_name'
VESTING_SCHEDULE_NAME_FIELD = 'vesting_schedule_name'
VESTING_SCHEDULE_DESCRIPTION_FIELD = 'vesting_schedule_description'
EFFECTIVE_DATE_FIELD = 'effective_date'
FUND_NAME_FIELD = 'fund_name'
GRANT_DATE_FIELD = 'grant_date'
CARRY_PERCENTAGE_FIELD = 'carry_percentage'
ENTITY_NAME_FIELD = 'entity_name'
SHARE_CLASS_FIELD = 'share_class'
TERMINATION_DATE_FIELD = 'termination_date'
TOTAL_PERCENT_POINTS_FIELD = 'total_percent_points'
CURRENT_POINTS_PRE_FORFEITURE = 'current_points_pre_forfeiture'
CURRENT_POINTS_AFTER_FORFEITURE = 'current_points_after_forfeiture'
PERCENT_VESTED = 'percent_vested'
INVESTOR_ALLOCATIONS_POINTS = 'investor_allocations_points'


class ParticipantCarryDocumentOptions(ModelBasedOptions):
    PREFIX_ID = PARTICIPANT_CARRY_DOCUMENT
    custom_fields = (
        PARTICIPANT_NAME_FIELD,
        ALLOCATION_AMOUNT_FIELD,
        AWARD_DATE_FIELD,
        PLAN_NAME_FIELD,
        VESTING_SCHEDULE_NAME_FIELD,
        VESTING_SCHEDULE_DESCRIPTION_FIELD,
        EFFECTIVE_DATE_FIELD,
        FUND_NAME_FIELD,
        GRANT_DATE_FIELD,
        CARRY_PERCENTAGE_FIELD,
        ENTITY_NAME_FIELD,
        SHARE_CLASS_FIELD,
        TERMINATION_DATE_FIELD,
        TOTAL_PERCENT_POINTS_FIELD,
        PERCENT_VESTED,
        CURRENT_POINTS_PRE_FORFEITURE,
        CURRENT_POINTS_AFTER_FORFEITURE,
        INVESTOR_ALLOCATIONS_POINTS
    )
    model = ParticipantCarryDocument

    def __init__(self):
        self.cached_values = {}

    def get_fields(self, fetch_custom=True):
        return self.process_custom_fields()

    def get_participant_name_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='participant_name'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_participant_name_value(self, instance: ParticipantCarryDocument):
        field = self.default_text_field(field_id=PARTICIPANT_NAME_FIELD)
        field['value'] = get_display_name(instance.user)
        return field

    def get_plan_name_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='plan_name'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_effective_date_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='effective_date'),
            field_name='',
            type=DATE_TYPE
        ).to_json()

    def get_effective_date_value(self, instance: ParticipantCarryDocument):
        field = self.get_effective_date_field()
        if instance.carry_plan:
            field['value'] = format_date(instance.carry_plan.effective_date)
        return field

    def get_carry_percentage_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='carry_percentage'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_carry_percentage_value(self, instance: ParticipantCarryDocument):
        field = self.get_carry_percentage_field()
        allocation = instance.get_user_allocation()
        if allocation:
            field['value'] = allocation.get('bps')
        return field

    def get_grant_date_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='grant_date'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_grant_date_value(self, instance: ParticipantCarryDocument):
        field = self.get_grant_date_field()
        allocation = instance.get_user_allocation()
        if allocation and allocation.get('grant_date'):
            field['value'] = format_date(dt_parse(allocation['grant_date']))
            field['locked'] = True
        return field

    def get_fund_name_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='fund_name'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_fund_name_value(self, instance: ParticipantCarryDocument):
        field = self.get_fund_name_field()
        if instance.carry_plan:
            fund_carry_plan = instance.carry_plan.carry_plan_fund_carry_plans.first()
            if fund_carry_plan:
                fund_name = fund_carry_plan.fund.name
                field['value'] = fund_name
        return field

    def get_entity_name_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='entity_name'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_entity_name_value(self, instance: ParticipantCarryDocument):
        field = self.get_entity_name_field()
        allocation = instance.get_user_allocation()
        if allocation and allocation.get('carry_participant_id'):
            try:
                carry_participant = CarryParticipant.objects.get(id=allocation['carry_participant_id'])
            except CarryParticipant.DoesNotExist:
                return field
            if carry_participant.entity_name:
                field['value'] = carry_participant.entity_name
        return field

    def get_share_class_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='share_class'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_share_class_value(self, instance: ParticipantCarryDocument):
        field = self.get_share_class_field()
        allocation = instance.get_user_allocation()
        if allocation.get('share_class'):
            share_class = CarryShareClass.objects.get(id=allocation['share_class'])
            field['value'] = share_class.legal_name
        return field

    # employment_record = retail_user.user_participant_profile.employment_record

    def get_termination_date_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='termination_date'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_termination_date_value(self, instance: ParticipantCarryDocument):
        field = self.get_termination_date_field()
        user = instance.user
        if hasattr(user, 'user_participant_profile'):
            user_participant_profile = user.user_participant_profile
            employment_record = user.user_participant_profile.employment_record
            if not employment_record:
                employment_record = EmploymentRecord.objects.filter(
                    participant_profile=user_participant_profile
                ).first()

            if employment_record and employment_record.separation_date:
                field['value'] = format_date(employment_record.separation_date)
        return field

    def get_allocation_amount_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='allocation_amount'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_allocation_amount_value(self, instance: ParticipantCarryDocument):
        field = self.get_allocation_amount_field()
        allocation = self.cached_values.get('allocation', {})
        field['value'] = allocation.get('bps')
        return field

    def get_plan_name_value(self, instance: ParticipantCarryDocument):
        field = self.get_plan_name_field()
        field['value'] = instance.carry_plan.name
        return field

    def get_vesting_schedule_name_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='vesting_schedule_name'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_vesting_schedule_name_value(self, instance: ParticipantCarryDocument):
        field = self.get_vesting_schedule_name_field()
        vesting_schedule = self.cached_values.get('vesting_schedule')  # type: VestingSchedule
        if vesting_schedule:
            field['value'] = vesting_schedule.name
        return field

    def get_vesting_schedule_description_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='vesting_schedule_description'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_vesting_schedule_description_value(self, instance: ParticipantCarryDocument):
        field = self.get_vesting_schedule_description_field()
        vesting_schedule = self.cached_values.get('vesting_schedule')  # type: VestingSchedule
        if vesting_schedule:
            field['value'] = vesting_schedule.description
        return field

    def get_award_date_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='award_date'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_award_date_value(self, instance: ParticipantCarryDocument):
        field = self.get_award_date_field()
        allocation = self.cached_values.get('allocation', {})
        field['value'] = allocation.get('grant_date')
        return field

    def get_total_percent_points_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='total_percent_points'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_total_percent_points_value(self, instance: ParticipantCarryDocument):
        field = self.get_total_percent_points_field()
        total_points = Decimal(0)
        allocation = self.cached_values.get('allocation')
        if not allocation:
            allocation = instance.get_user_allocation()

        carry_pool = instance.carry_plan.carry_pools.filter(
            status=CarryPool.Status.PUBLISHED.value,
            company=instance.company
        )
        if carry_pool.exists():
            carry_pool = carry_pool.latest('created_at')
            allocations = carry_pool.allocations
            calculation_date = timezone.now().strftime("%Y-%m-%d")
            calculate_allocations_by_date(allocations, calculation_date)
            carry_participant_id = allocation.get('carry_participant_id')
            for item in allocations:
                if item.get('carry_participant_id') == carry_participant_id:
                    total_points = total_points + Decimal(str(item['bps']))

        field['value'] = format_decimal_for_docs(total_points)
        return field

    def get_current_points_pre_forfeiture_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='current_points_pre_forfeiture'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_investor_allocations_points_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='investor_allocations_points'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_current_points_pre_forfeiture_value(self, instance: ParticipantCarryDocument):
        field = self.get_current_points_pre_forfeiture_field()
        allocation = self.cached_values.get('allocation')
        if not allocation:
            allocation = instance.get_user_allocation()
        field['value'] = format_decimal_for_docs(Decimal(str(allocation.get('bps', 0))))
        return field

    def get_current_points_after_forfeiture_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='current_points_after_forfeiture'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_current_points_after_forfeiture_value(self, instance: ParticipantCarryDocument):
        field = self.get_current_points_after_forfeiture_field()
        allocation = self.cached_values.get('allocation')
        if not allocation:
            allocation = instance.get_user_allocation()
        bps = Decimal(str(allocation.get('bps', 0)))
        forfeited_actions = AllocationAction.objects.filter(
            allocation_id=allocation['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        ).values('allocation_id').annotate(forfeited_bps=Sum('bps'))
        forfeited_bps_map = {action['allocation_id']: action['forfeited_bps'] or 0 for action in forfeited_actions}
        forfeited_bps = forfeited_bps_map.get(allocation['allocation_id'], 0)
        field['value'] = format_decimal_for_docs(bps - forfeited_bps)
        return field

    def get_investor_allocations_points_value(self, instance: ParticipantCarryDocument):
        field = self.get_investor_allocations_points_field()
        total_points = Decimal(0)
        allocations = instance.get_user_all_published_allocations()
        if not allocations:
            return field
        calculation_date = timezone.now().strftime("%Y-%m-%d")
        calculate_allocations_by_date(allocations, calculation_date)
        for item in allocations:
            total_points = total_points + Decimal(str(item['bps']))
        field['value'] = format_four_decimals_for_docs(total_points)
        return field

    def get_percent_vested_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='percent_vested'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_percent_vested_value(self, instance: ParticipantCarryDocument):
        field = self.get_percent_vested_field()
        allocation = self.cached_values.get('allocation')
        if not allocation:
            allocation = instance.get_user_allocation()
        calculation_date = timezone.now().strftime("%Y-%m-%d")
        calculate_allocations_by_date([allocation], calculation_date)
        field['value'] = format_decimal_for_docs(Decimal(allocation['vested_percentage_display']))
        return field

def get_values(self, instance: ParticipantCarryDocument):
        allocation = instance.get_user_allocation()
        vesting_schedule = None
        if allocation and allocation.get('vesting_schedule'):
            vesting_schedule = VestingSchedule.objects.get(
                company=instance.carry_document.company,
                id=allocation['vesting_schedule']
            )
        self.cached_values['allocation'] = allocation
        self.cached_values['vesting_schedule'] = vesting_schedule
        return super().get_values(instance=instance)
