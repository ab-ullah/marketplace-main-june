from collections import defaultdict

import encrypted_fields.fields
from fractions import Fraction

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from api.carry_pools.managers import CarryPoolManager, ParticipantCarryDocumentManager

from api.companies.models import CompanyUser
from api.libs.utils.date_utils import get_most_recent_dates
from api.libs.utils.nanoid_generator import generate_nanoid
from api.models import BaseModel, MultiTenantModel, EncryptedDecimalField
from api.participants.models import ParticipantProfile
from api.users.models import RetailUser
from core.managers.has_company_filter_manager import HasCompanyFilterManager


def non_zero_validator(value):
    if value == 0:
        raise ValidationError("Denominator cannot be zero.")


class CarryPlan(BaseModel):
    class Status(models.IntegerChoices):
        UNPUBLISHED_CHANGE = 1, _('Unpublished Changes')
        PENDING_APPROVAL = 2, _('Pending Approval')
        PUBLISHED = 3, _('Published')
        APPROVED = 4, _('Approved-unpublished')
        UNAPPROVED = 5, _('Unapproved')

    deleted = models.BooleanField(default=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='carry_plans'
    )
    default_vesting_schedule = models.ForeignKey(
        'carry_pools.VestingSchedule',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='schedule_associated_carry_plans'
    )
    status = models.PositiveSmallIntegerField(choices=Status.choices, default=Status.UNPUBLISHED_CHANGE.value)
    starting_template = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='template_carry_plans'
    )
    effective_date = models.DateTimeField(null=True, blank=True)
    workflow = models.OneToOneField(
        'workflows.WorkFlow',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workflow_carry_plan'
    )

    def get_adjustments(self):
        adjustments = AllocationValueAdjustment.objects.filter(
            carry_plan=self
        )
        from api.carry_pools.serializers import AllocationValueAdjustmentSerializer
        data = AllocationValueAdjustmentSerializer(
            adjustments, many=True
        ).data
        adjustments_by_allocations = {}
        for adjustment in data:
            allocation_id = adjustment['allocation_id']
            if allocation_id not in adjustments_by_allocations:
                adjustments_by_allocations[allocation_id] = []
            adjustments_by_allocations[allocation_id].append(adjustment)
        return adjustments_by_allocations

    def get_adjustments_by_allocations(self, calculation_date=None):
        adjustments = AllocationValueAdjustment.objects.filter(
            carry_plan=self
        )
        if calculation_date:
            adjustments = adjustments.filter(effective_date__lte=calculation_date)

        adjustments = adjustments.values('allocation_id', 'value_type').annotate(net_adjustment=Sum('adjustment'))
        adjustment_map = {}
        for adjustment in adjustments:
            allocation_id = adjustment['allocation_id']
            value_type = adjustment['value_type']
            net_adjustment = adjustment['net_adjustment']
            if allocation_id not in adjustment_map:
                adjustment_map[allocation_id] = {}
            if value_type not in adjustment_map[allocation_id]:
                adjustment_map[allocation_id][value_type] = 0
            adjustment_map[allocation_id][value_type] += net_adjustment
        return adjustment_map

    @property
    def carry_estimated_value(self):
        total_value = 0
        fund_carry_plans = FundCarryPlan.objects.filter(carry_plan=self).select_related('fund')
        deal_carry_plans = DealCarryPlan.objects.filter(carry_plan=self).select_related('deal')
        investment_carry_plans = InvestmentTrancheCarryPlan.objects.filter(
            carry_plan=self
        ).select_related('investment_tranche')
        for item in fund_carry_plans:
            fund = item.fund
            total_value += fund.carry_estimated_value
        for item in deal_carry_plans:
            deal = item.deal
            total_value += deal.carry_estimated_value or 0
        for item in investment_carry_plans:
            investment_tranche = item.investment_tranche
            total_value += investment_tranche.estimated_value or 0
        return total_value

    @staticmethod
    def get_bulk_carry_estimated_values(carry_plan_ids):
        fund_carry_plans = FundCarryPlan.objects.filter(
            carry_plan__in=carry_plan_ids
        ).select_related('fund')
        deal_carry_plans = DealCarryPlan.objects.filter(
            carry_plan__in=carry_plan_ids
        ).select_related('deal')
        investment_carry_plans = InvestmentTrancheCarryPlan.objects.filter(
            carry_plan__in=carry_plan_ids
        ).select_related('investment_tranche')

        carry_fund_map = defaultdict(list)
        carry_deal_map = defaultdict(list)
        carry_investment_map = defaultdict(list)

        for item in fund_carry_plans:
            carry_fund_map[item.carry_plan_id].append(item.fund)

        for item in deal_carry_plans:
            carry_deal_map[item.carry_plan_id].append(item.deal)

        for item in investment_carry_plans:
            carry_investment_map[item.carry_plan_id].append(item.investment_tranche)

        carry_values = {}
        for carry_plan_id in carry_plan_ids:
            total_value = 0
            total_value += sum(fund.carry_estimated_value for fund in carry_fund_map.get(carry_plan_id, []))
            total_value += sum(deal.carry_estimated_value or 0 for deal in carry_deal_map.get(carry_plan_id, []))
            total_value += sum(tranche.estimated_value or 0 for tranche in carry_investment_map.get(carry_plan_id, []))
            carry_values[carry_plan_id] = total_value

        return carry_values

    @property
    def fair_market_value(self):
        total_value = 0
        fund_carry_plans = FundCarryPlan.objects.filter(carry_plan=self).select_related('fund')
        deal_carry_plans = DealCarryPlan.objects.filter(carry_plan=self).select_related('deal')
        investment_carry_plans = InvestmentTrancheCarryPlan.objects.filter(
            carry_plan=self
        ).select_related('investment_tranche')
        for item in fund_carry_plans:
            fund = item.fund
            total_value += fund.carry_fair_market_value or 0
        for item in deal_carry_plans:
            deal = item.deal
            total_value += deal.carry_fair_market_value or 0
        for item in investment_carry_plans:
            investment_tranche = item.investment_tranche
            total_value += investment_tranche.fair_market_value or 0
        return total_value

    @property
    def estimated_value_date(self):
        fund_carry_plan_date = FundCarryPlan.objects.filter(
            carry_plan=self
        ).order_by(
            '-fund__estimated_value_date'
        ).values(
            'fund__estimated_value_date'
        ).first()

        deal_carry_plans_date = DealCarryPlan.objects.filter(
            carry_plan=self
        ).order_by(
            '-deal__estimated_value_date'
        ).values(
            'deal__estimated_value_date'
        ).first()

        investment_carry_plans_date = InvestmentTrancheCarryPlan.objects.filter(
            carry_plan=self
        ).order_by(
            '-investment_tranche__estimated_value_date'
        ).values(
            'investment_tranche__estimated_value_date'
        ).first()

        dates = []
        if fund_carry_plan_date:
            dates.append(fund_carry_plan_date['fund__estimated_value_date'])
        if deal_carry_plans_date:
            dates.append(deal_carry_plans_date['deal__estimated_value_date'])
        if investment_carry_plans_date:
            dates.append(investment_carry_plans_date['investment_tranche__estimated_value_date'])
        return get_most_recent_dates(dates)

    @property
    def fair_market_value_date(self):
        fund_carry_plan_date = FundCarryPlan.objects.filter(
            carry_plan=self
        ).order_by(
            '-fund__fair_market_value_date'
        ).values(
            'fund__fair_market_value_date'
        ).first()

        deal_carry_plans_date = DealCarryPlan.objects.filter(
            carry_plan=self
        ).order_by(
            '-deal__fair_market_value_date'
        ).values(
            'deal__fair_market_value_date'
        ).first()

        investment_carry_plans_date = InvestmentTrancheCarryPlan.objects.filter(
            carry_plan=self
        ).order_by(
            '-investment_tranche__fair_market_value_date'
        ).values(
            'investment_tranche__fair_market_value_date'
        ).first()

        dates = []
        if fund_carry_plan_date:
            dates.append(fund_carry_plan_date['fund__fair_market_value_date'])
        if deal_carry_plans_date:
            dates.append(deal_carry_plans_date['deal__fair_market_value_date'])
        if investment_carry_plans_date:
            dates.append(investment_carry_plans_date['investment_tranche__fair_market_value_date'])
        return get_most_recent_dates(dates)

    def delete(self, using=None, keep_parents=False):
        self.deleted = True
        self.save()

    def hard_delete(self):
        return super().delete()

    def source_name(self):
        if hasattr(self, 'fund_realization'):
            return self.fund_realization.fund_carry_plan.fund.name
        elif hasattr(self, 'deal_realization'):
            return self.deal_realization.deal.name
        elif hasattr(self, 'investment_tranche_realization'):
            return self.investment_tranche_realization.investment_tranche.name
        return ""


class CarryPool(BaseModel):
    class Status(models.IntegerChoices):
        UNPUBLISHED_CHANGE = 1, _('Unpublished Changes')
        PENDING_APPROVAL = 2, _('Pending Approval')
        PUBLISHED = 3, _('Published')
        APPROVED = 4, _('Approved-unpublished')
        UNAPPROVED = 5, _('Unapproved')

    history = HistoricalRecords()
    deleted = models.BooleanField(default=False)
    objects = CarryPoolManager()

    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120)
    bps = models.FloatField()
    status = models.PositiveSmallIntegerField(choices=Status.choices, default=Status.UNPUBLISHED_CHANGE.value)
    external_id = models.CharField(max_length=120, db_index=True)
    pools = models.JSONField(default=list)
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_pools'
    )
    allocations = models.JSONField(default=list)
    legal_entity = models.ForeignKey(
        'LegalEntity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='company_carry_pools'
    )

    created_by = models.ForeignKey(
        'admin_users.AdminUser',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_pools'
    )

    def delete(self, using=None, keep_parents=False):
        self.deleted = True
        self.save()

    def save(self, *args, **kwargs):
        if self.pk:
            new_instance = CarryPool(
                name=self.name,
                slug=self.slug,
                bps=self.bps,
                external_id=self.external_id,
                pools=self.pools,
                carry_plan=self.carry_plan,
                company=self.company,
                allocations=self.allocations,
                legal_entity=self.legal_entity,
                created_by=self.created_by,
                status=CarryPool.Status.UNPUBLISHED_CHANGE.value
            )
            new_instance.pk = None
            new_instance.save()

            # check carry plan status on every modification
            if self.carry_plan.status != CarryPlan.Status.PENDING_APPROVAL.value:
                self.carry_plan.status = CarryPlan.Status.UNPUBLISHED_CHANGE.value
                self.carry_plan.save()
        else:
            super().save(*args, **kwargs)


class FundCarryPlan(BaseModel):
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_plan_fund_carry_plans'
    )
    fund = models.ForeignKey(
        'funds.Fund',
        on_delete=models.CASCADE,
        related_name='fund_carry_plans'
    )
    deleted = models.BooleanField(default=False)

    class Meta:
        unique_together = (
            ('carry_plan', 'fund'),
        )


class LegalEntity(BaseModel):
    history = HistoricalRecords()
    deleted = models.BooleanField(default=False)

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_legal_entities'
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120)


class VestingSchedule(BaseModel):
    class VestingType(models.IntegerChoices):
        TIME_BASED = 1, _('Time Based')
        EVENT_BASED = 2, _('Event Based')
        HYBRID = 3, _('Hybrid')

    name = models.CharField(max_length=250)
    description = models.TextField(null=True, blank=True)
    vesting_type = models.PositiveSmallIntegerField(choices=VestingType.choices)
    deleted = models.BooleanField(default=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='vesting_schedules'
    )
    is_default = models.BooleanField(default=False)

    cliff_duration = models.DurationField(null=True, blank=True)
    cliff_vesting_percentage = models.DecimalField(max_digits=13, decimal_places=4, null=True, blank=True)
    cliff_vesting_percentage_numerator = models.IntegerField(null=True, blank=True)
    cliff_vesting_percentage_denominator = models.IntegerField(
        validators=[non_zero_validator],
        null=True,
        blank=True
    )
    custom_display = models.JSONField(null=True)
    vesting_duration = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.name

    @classmethod
    def get_default_vesting_schedule(cls, company):
        try:
            return cls.objects.get(company=company, is_default=True)
        except cls.DoesNotExist:
            # TODO: update to return None if no default and set the company default schedule from FE
            return cls.objects.filter(company=company).first()

    @property
    def cliff_vesting_percentage_fraction(self):
        if self.cliff_vesting_percentage_numerator and self.cliff_vesting_percentage_denominator:
            return Fraction(
                self.cliff_vesting_percentage_numerator,
                self.cliff_vesting_percentage_denominator
            )
        return Fraction()




class Milestone(BaseModel):
    name = models.CharField(max_length=250)
    type = models.CharField(max_length=250)
    deleted = models.BooleanField(default=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='company_milestones'
    )


class TimeBasedVestingSchedule(BaseModel):
    vesting_schedule = models.ForeignKey(
        VestingSchedule, on_delete=models.CASCADE, related_name='time_vesting_schedules'
    )
    period_duration = models.DurationField()
    period_vesting_percentage = models.DecimalField(max_digits=13, decimal_places=4)
    sequence = models.PositiveSmallIntegerField()
    deleted = models.BooleanField(default=False)

    period_vesting_percentage_numerator = models.IntegerField(null=True, blank=True)
    period_vesting_percentage_denominator = models.IntegerField(
        validators=[non_zero_validator],
        null=True,
        blank=True
    )

    @property
    def period_vesting_percentage_fraction(self):
        if self.period_vesting_percentage_numerator and self.period_vesting_percentage_denominator:
            return Fraction(
                self.period_vesting_percentage_numerator,
                self.period_vesting_percentage_denominator
            )
        return Fraction()

    def vesting_percentage(self):
        if self.period_vesting_percentage_numerator and self.period_vesting_percentage_denominator:
            return float(Fraction(
                self.period_vesting_percentage_numerator,
                self.period_vesting_percentage_denominator
            ))
        return self.period_vesting_percentage

    class Meta:
        ordering = ('vesting_schedule', 'sequence')


class MilestoneBasedVestingSchedule(BaseModel):
    vesting_schedule = models.ForeignKey(
        VestingSchedule, on_delete=models.CASCADE, related_name='milestone_vesting_schedules'
    )
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE, related_name='milestone_schedules')
    milestone_vesting_percentage = models.DecimalField(max_digits=13, decimal_places=4)
    is_accelerated = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)


class AllocationAction(BaseModel):
    class Status(models.IntegerChoices):
        DRAFT = 1, _('Draft')
        UNDER_REVIEW = 2, _('Under Review')
        APPROVED = 3, _('Approved')
        AWAITING_PARTICIPANT_SIGNATURE = 4, _('Awaiting Participant Signature')
        SIGNED_BY_PARTICIPANT = 5, _('Signed by Participant')
        SIGNED_BY_GP = 6, _('Signed by GP')
        FORFEITED = 7, _('Forfeited')

    class Type(models.IntegerChoices):
        CREATE = 1, _('Create')
        DELETE = 2, _('Delete')
        FORFEIT = 3, _('Forfeit')
        DILUTE = 4, _('Dilute')
        EDIT = 5, _('Edit')
        TRANSFER_FROM = 6, _('Transfer From')
        TRANSFER_TO = 7, _('Transfer To')

    status = models.PositiveSmallIntegerField(choices=Status.choices, default=Status.DRAFT.value)
    vesting_schedule = models.ForeignKey(
        VestingSchedule,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='schedule_allocation_actions'
    )
    grant_date = models.DateTimeField(blank=True, null=True)
    effective_date = models.DateTimeField(blank=True, null=True)
    type = models.PositiveSmallIntegerField(choices=Type.choices, null=False)
    bps = models.DecimalField(max_digits=28, decimal_places=24, null=True, blank=True)

    base_pool_id = models.CharField(max_length=120, db_index=True, blank=True, null=True)
    parent_pool_id = models.CharField(max_length=120, blank=True, null=True)

    pool_name = models.CharField(max_length=120, db_index=True, blank=True, null=True)
    allocation_id = models.CharField(max_length=120, db_index=True, blank=True, null=True)
    transferred_from_allocation_id = models.CharField(max_length=120, blank=True, null=True)
    transferred_to_allocation_id = models.CharField(max_length=120, blank=True, null=True)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='company_allocations'
    )
    deleted = models.BooleanField(default=False)
    carry_participant = models.ForeignKey(
        'carry_pools.CarryParticipant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='carry_participant_allocation_actions')

    @property
    def action_display_name(self):
        if self.type == self.Type.CREATE.value:
            return 'Allocation'
        if self.type == self.Type.FORFEIT.value:
            return 'Forfeiture'
        if self.type == self.Type.DILUTE.value:
            return 'Dilution'
        if self.type == self.Type.TRANSFER_FROM.value:
            return 'Transfer Out'
        if self.type == self.Type.TRANSFER_TO.value:
            return 'Transfer In'

class Deal(BaseModel):
    objects = HasCompanyFilterManager()

    name = models.CharField(max_length=120)
    fund = models.ForeignKey(
        'funds.Fund',
        on_delete=models.CASCADE,
        related_name='fund_deals',
        null=True,
        blank=True
    )
    external_id = models.CharField(max_length=120, db_index=True, default=generate_nanoid)
    capital_deployed = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    estimated_value = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    fair_market_value = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)

    estimated_value_date = models.DateField(null=True, blank=True)
    fair_market_value_date = models.DateField(null=True, blank=True)

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='company_deals'
    )
    deleted = models.BooleanField(default=False)

    @property
    def carry_estimated_value(self):
        related_investment_estimated_value_sum = InvestmentTranche.objects.filter(
            deal_id=self.id, company=self.company
        ).aggregate(
            total_estimated_value=Sum('estimated_value')
        )
        total_sum = related_investment_estimated_value_sum['total_estimated_value']
        if total_sum:
            return total_sum
        return self.estimated_value or 0

    @property
    def carry_fair_market_value(self):
        related_deals_fair_market_value_sum = InvestmentTranche.objects.filter(
            deal_id=self.id,
            company=self.company
        ).aggregate(
            total_fair_market_value=Sum('fair_market_value'))
        total_sum = related_deals_fair_market_value_sum['total_fair_market_value']
        if total_sum:
            return total_sum
        return self.fair_market_value or 0


class DealCarryPlan(BaseModel):
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_plans_deals'
    )
    deal = models.ForeignKey(
        Deal,
        on_delete=models.CASCADE,
        related_name='deal_carry_plan'
    )
    deleted = models.BooleanField(default=False)

    class Meta:
        unique_together = (
            ('carry_plan', 'deal'),
        )


class CarryDocument(BaseModel):
    class DocumentType(models.IntegerChoices):
        CARRY_AWARD = 1, _('Carry Award')
        CARRY_FORFEITURE = 2, _('Carry Forfeiture')

    class RequirementsType(models.IntegerChoices):
        SIGNATURE = 1, _('Signature')
        ACKNOWLEDGEMENT = 2, _('Acknowledgement')

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_carry_documents'
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='document_associated_carry_documents'
    )
    deleted = models.BooleanField(default=False)
    name = models.CharField(max_length=250)
    description = models.TextField()
    show_everytime = models.BooleanField(null=True, blank=True, default=None)
    require_signature = models.BooleanField(default=False)
    require_wet_signature = models.BooleanField(default=False)
    require_gp_signature = models.BooleanField(default=False)
    gp_signer = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='carry_document_gp_signer'
    )
    document_type = models.PositiveSmallIntegerField(
        choices=DocumentType.choices,
        default=DocumentType.CARRY_AWARD.value
    )
    requirements = models.PositiveSmallIntegerField(
        choices=RequirementsType.choices,
        default=RequirementsType.ACKNOWLEDGEMENT.value
    )
    document_status = models.BooleanField(default=True)
    carry_plans = models.ManyToManyField(
        CarryPlan,
        related_name='associated_carry_documents'
    )
    sub_pools = models.ManyToManyField(
        'carry_pools.CarrySubPool',
        related_name='subpool_carry_documents'
    )

    class Meta:
        ordering = ("created_at",)


class ParticipantCarryDocument(BaseModel):
    objects = ParticipantCarryDocumentManager()

    user = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.CASCADE,
        related_name='user_carry_documents'
    )
    carry_document = models.ForeignKey(
        CarryDocument,
        on_delete=models.CASCADE,
        related_name='carry_document_users'
    )
    signed_document = models.ForeignKey(
        'documents.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='document_participant_carry_documents'
    )
    is_acknowledged = models.BooleanField(default=False)
    is_released = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    gp_signing_complete = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)
    envelope_id = models.CharField(max_length=80, null=True, blank=True)
    certificate = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        related_name='participant_carry_document_certificates',
        null=True,
        blank=True
    )
    task = models.OneToOneField(
        'workflows.Task',
        related_name='task_participant_carry_document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    carry_plan = models.ForeignKey(
        CarryPlan,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='carry_plan_participant_document'
    )
    sub_pool = models.ForeignKey(
        'carry_pools.CarrySubPool',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='sub_pool_participant_document'
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='participants_carry_documents'
    )
    allocation_id = models.CharField(max_length=120, blank=True, null=True)

    class Meta:
        ordering = ("created_at",)

    def get_user_allocation(self):
        carry_pool = self.carry_plan.carry_pools.latest('created_at')
        allocation = {}
        if self.allocation_id:
            for allocation in carry_pool.allocations:
                if allocation['allocation_id'] == self.allocation_id:
                    return allocation
        carry_users = self.user.user_carry_participants.all()
        carry_participant_ids = [carry_user.carry_participant.id for carry_user in carry_users]
        for allocation in carry_pool.allocations:
            if allocation['carry_participant_id'] in carry_participant_ids:
                return allocation

        return allocation

    def get_user_all_published_allocations(self):
        carry_pool = self.carry_plan.carry_pools.filter(
            status=CarryPool.Status.PUBLISHED.value,
            company=self.company
        )
        allocations = []
        if carry_pool.exists():
            carry_pool = carry_pool.latest('created_at')
            carry_users = self.user.user_carry_participants.all()
            carry_participant_ids = [carry_user.carry_participant.id for carry_user in carry_users]
            for allocation in carry_pool.allocations:
                if allocation['carry_participant_id'] in carry_participant_ids:
                    allocations.append(allocation)
        return allocations


class CarryPlanMilestone(BaseModel):
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_plan_milestones'
    )
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.CASCADE,
        related_name='milestone_carry_plans'
    )
    date = models.DateField(null=True, blank=True)
    vesting_percentage = models.DecimalField(max_digits=13, decimal_places=4, null=True, blank=True)
    deleted = models.BooleanField(default=False)

    class Meta:
        unique_together = (
            ('carry_plan', 'milestone'),
        )


class CarryParticipant(BaseModel):
    class EntityType(models.IntegerChoices):
        INDIVIDUAL = 1, _('Individual')
        CORPORATE = 2, _('Corporate')
        TRUST = 3, _('Trust')

    entity = models.PositiveSmallIntegerField(choices=EntityType.choices, default=EntityType.INDIVIDUAL.value)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_carry_participants'
    )
    entity_name = models.CharField(max_length=150, null=True, blank=True)
    deleted = models.BooleanField(default=False)

    def get_full_name(self):
        if self.entity == self.EntityType.INDIVIDUAL.value:
            return '{} {}'.format(self.first_name, self.last_name)
        return self.entity_name

    def associate_with_user(self, user: RetailUser):
        CarryParticipantUser.objects.create(
            user=user,
            carry_participant=self
        )

    def get_company_users(self, company):
        user_ids = list(self.carry_participant_user.values_list('user_id', flat=True))
        return CompanyUser.objects.filter(
            company=company,
            user_id__in=user_ids
        )

    def get_direct_reports(self):
        retail_user = self.carry_participant_user.first().user
        if retail_user:
            employment_record = retail_user.user_participant_profile.employment_record
            if employment_record:
                direct_report_employees = employment_record.get_direct_report_employees()
                direct_report_carry_participants = []
                for employee in direct_report_employees.all():
                    participant_profile = ParticipantProfile.objects.filter(
                        company=self.company,
                        employment_record=employee
                    ).first()
                    if participant_profile:
                        user = participant_profile.user
                        carry_users = CarryParticipantUser.objects.filter(user=user)
                        for carry_user in carry_users:
                            direct_report_carry_participants.append(carry_user.carry_participant.id)

                return direct_report_carry_participants

        return []


class CarryParticipantUser(BaseModel):
    carry_participant = models.ForeignKey(
        CarryParticipant,
        on_delete=models.CASCADE,
        related_name='carry_participant_user'
    )
    user = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.CASCADE,
        related_name='user_carry_participants'
    )
    deleted = models.BooleanField(default=False)


class Realization(MultiTenantModel):
    amount = EncryptedDecimalField(decimal_places=2, max_digits=13)
    date = encrypted_fields.fields.EncryptedDateTimeField()
    deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "carry_realizations"


class Distribution(MultiTenantModel):
    amount = EncryptedDecimalField(decimal_places=2, max_digits=13)
    date = encrypted_fields.fields.EncryptedDateTimeField()
    escrow = EncryptedDecimalField(decimal_places=2, max_digits=13)
    realization = models.ForeignKey(Realization, on_delete=models.CASCADE)
    is_manual = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)

    def source_name(self):
        if hasattr(self.realization, 'fund_realization'):
            return self.realization.fund_realization.fund_carry_plan.fund.name
        elif hasattr(self.realization, 'deal_realization'):
            return self.realization.deal_realization.deal.name
        elif hasattr(self.realization, 'investment_tranche_realization'):
            return self.realization.investment_tranche_realization.investment_tranche.name
        return ""

    class Meta:
        db_table = "carry_distributions"


class ParticipantDistribution(MultiTenantModel):
    amount = EncryptedDecimalField(decimal_places=2, max_digits=13)
    date = encrypted_fields.fields.EncryptedDateTimeField()
    escrow = EncryptedDecimalField(decimal_places=2, max_digits=13)
    distribution = models.ForeignKey(Distribution, on_delete=models.CASCADE, related_name='distribution_participants')
    allocation_id = models.CharField(max_length=20)
    participant = models.ForeignKey(CarryParticipant, on_delete=models.CASCADE)
    points = models.FloatField(null=True, blank=True)
    net_distribution = EncryptedDecimalField(decimal_places=2, max_digits=13, null=True, blank=True)
    escrow_percentage = models.FloatField(null=True, blank=True)
    deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "carry_participant_distributions"

    def source_name(self):
        if hasattr(self.distribution.realization, 'fund_realization'):
            return self.distribution.realization.fund_realization.fund_carry_plan.fund.name
        elif hasattr(self.distribution.realization, 'deal_realization'):
            return self.distribution.realization.deal_realization.deal.name
        elif hasattr(self.distribution.realization, 'investment_tranche_realization'):
            return self.distribution.realization.investment_tranche_realization.investment_tranche.name
        return ""


class FundRealization(MultiTenantModel):
    fund_carry_plan = models.ForeignKey(FundCarryPlan, on_delete=models.CASCADE, related_name="fund_realizations")
    realization = models.OneToOneField(Realization, on_delete=models.CASCADE, related_name="fund_realization")
    deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "carry_fund_realizations"


class DealRealization(MultiTenantModel):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name="realizations")
    realization = models.OneToOneField(Realization, on_delete=models.CASCADE, related_name="deal_realization")
    deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "carry_deal_realizations"


class InvestmentTrancheRealization(MultiTenantModel):
    investment_tranche = models.ForeignKey('InvestmentTranche', on_delete=models.CASCADE,
                                           related_name="investment_tranche_realizations")
    realization = models.OneToOneField(Realization, on_delete=models.CASCADE,
                                       related_name="investment_tranche_realization")
    deleted = models.BooleanField(default=False)


class CarryShareClass(BaseModel):
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_carry_share_classes'
    )
    legal_name = models.CharField(max_length=120)
    common_name = models.CharField(max_length=120, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    vesting_schedule = models.ForeignKey(
        'carry_pools.VestingSchedule',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    require_no_share_class = models.BooleanField(default=False)


class CarryVehicle(BaseModel):
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_vehicles'
    )
    legal_name = models.CharField(max_length=120)
    common_name = models.CharField(max_length=120)


class CarryVehicleShareClass(BaseModel):
    vehicle = models.ForeignKey(
        'carry_pools.CarryVehicle',
        on_delete=models.CASCADE
    )
    template_share_class = models.ForeignKey(
        'carry_pools.CarryShareClass',
        on_delete=models.CASCADE
    )
    vesting_schedule = models.ForeignKey(
        'carry_pools.VestingSchedule',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    deleted = models.BooleanField(default=False)


class CarrySubPool(BaseModel):
    name = models.CharField(max_length=120)
    bps = models.DecimalField(max_digits=28, decimal_places=24, null=True, blank=True)
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_plan_subpools'
    )
    vehicle = models.ForeignKey(
        'carry_pools.CarryVehicle',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    template_share_class = models.ForeignKey(
        'carry_pools.CarryShareClass',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    vesting_schedule = models.ForeignKey(
        'carry_pools.VestingSchedule',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    deleted = models.BooleanField(default=False)


class InvestmentTranche(BaseModel):
    deleted = models.BooleanField(default=False)
    history = HistoricalRecords()

    name = models.CharField(max_length=120)

    external_id = models.CharField(max_length=120, db_index=True, default=generate_nanoid)

    amount = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)

    estimated_value = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    fair_market_value = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)

    estimated_value_date = models.DateField(null=True, blank=True)
    fair_market_value_date = models.DateField(null=True, blank=True)

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='company_investment_tranche'
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.CASCADE,
        related_name='deal_investment_tranches'
    )


class InvestmentTrancheCarryPlan(BaseModel):
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_plan_investment_tranche'
    )
    investment_tranche = models.OneToOneField(
        InvestmentTranche,
        on_delete=models.CASCADE,
        related_name='investment_tranche_carry_plan'
    )
    deleted = models.BooleanField(default=False)


class CarryDistributionAPILog(BaseModel):
    company = models.ForeignKey(
        'companies.Company',
        related_name='carry_distributions_api_logs',
        on_delete=models.CASCADE
    )
    request_path = models.TextField()
    request_body = models.JSONField()
    request_method = models.CharField(max_length=50)

    class Meta:
        db_table = "carry_distributions_api_logs"


class CarryGpCommitment(BaseModel):
    class SourceType(models.IntegerChoices):
        FUND = 1, _('Fund')
        DEAL = 2, _('Deal')
        INVESTMENT_TRANCHE = 3, _('Investment Tranche')

    source_external_id = models.CharField(max_length=120)
    source_type = models.PositiveSmallIntegerField(choices=SourceType.choices)
    carry_participant = models.ForeignKey(
        CarryParticipant,
        on_delete=models.CASCADE,
        related_name='associated_gp_commits'
    )
    company = models.ForeignKey(
        'companies.Company',
        related_name='associated_carry_gp_commits',
        on_delete=models.CASCADE
    )
    total_capital_commit = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    cashless_commit = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    management_fee_offset = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    salary_reduction = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    deleted = models.BooleanField(default=False)

    def get_source_name(self):
        from api.carry_pools.utils import get_gp_commit_source_name
        return get_gp_commit_source_name(self.source_type, self.source_external_id, self.company)


class CarryHurdle(BaseModel):
    class ImpactType(models.IntegerChoices):
        EVEN = 1, _('Even')
        PRO_RATA = 2, _('Pro Rata')

    class AppliesToType(models.IntegerChoices):
        ECV = 1, _('Estimated Carry Value')
        FMV = 2, _('Fair Market Value')
        BOTH = 3, _('Both ECV and FMV')

    hurdle_rate = models.DecimalField(max_digits=13, decimal_places=2)
    is_supercharged = models.BooleanField(default=False)
    source_allocation_id = models.CharField(max_length=120)
    impacted_allocations_ids = models.JSONField(default=list, blank=True)
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_plan_hurdles'
    )
    deleted = models.BooleanField(default=False)
    impact_type = models.PositiveSmallIntegerField(choices=ImpactType.choices, default=ImpactType.EVEN.value)
    applies_to = models.PositiveSmallIntegerField(choices=AppliesToType.choices, default=AppliesToType.ECV.value)
    supercharge_end_value = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)



class AllocationValueAdjustment(BaseModel):
    class ValueType(models.IntegerChoices):
        ESTIMATED_VALUE = 1, _('Estimated Value')
        FAIR_MARKET_VALUE = 2, _('Fair Market Value')

    allocation_id = models.CharField(max_length=120)
    carry_plan = models.ForeignKey(
        CarryPlan,
        on_delete=models.CASCADE,
        related_name='carry_plan_value_adjustments'
    )
    deleted = models.BooleanField(default=False)
    value_type = models.PositiveSmallIntegerField(choices=ValueType.choices)
    effective_date = models.DateField()
    adjustment = models.DecimalField(max_digits=13, decimal_places=2, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='allocation_value_adjustments'
    )
