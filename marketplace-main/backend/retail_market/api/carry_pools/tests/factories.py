import datetime
from datetime import timedelta

import factory
from faker import Faker
from django.utils import timezone

from api.carry_pools.models import (AllocationAction, CarryPlan, CarryPool,
                                    FundCarryPlan, Milestone,
                                    MilestoneBasedVestingSchedule,
                                    TimeBasedVestingSchedule, VestingSchedule, DealCarryPlan, Deal,
                                    ParticipantCarryDocument, CarryPlanMilestone, CarryParticipant, CarryGpCommitment)
from api.funds.models import Fund
from api.partners.tests.factories import CompanyFactory, FundFactory, CurrencyFactory

fake = Faker()

class VestingScheduleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = VestingSchedule

    name = factory.Faker('company')
    description = factory.Faker('sentence')
    vesting_type = VestingSchedule.VestingType.HYBRID
    company = factory.SubFactory(CompanyFactory)
    is_default = False
    cliff_duration = timedelta(days=365)
    cliff_vesting_percentage = 25.00
    cliff_vesting_percentage_numerator = 25
    cliff_vesting_percentage_denominator = 1


class MilestoneFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Milestone

    name = factory.Faker('word')
    type = factory.Faker('word')
    company = factory.SubFactory(CompanyFactory)


class TimeBasedVestingScheduleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TimeBasedVestingSchedule

    vesting_schedule = factory.SubFactory(VestingScheduleFactory)
    period_duration = timedelta(days=365)
    period_vesting_percentage = 20.00
    period_vesting_percentage_numerator = 20
    period_vesting_percentage_denominator = 1

class MilestoneBasedVestingScheduleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MilestoneBasedVestingSchedule

    vesting_schedule = factory.SubFactory(VestingScheduleFactory)
    milestone = factory.SubFactory(MilestoneFactory)
    milestone_vesting_percentage = 50.00


class AllocationActionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AllocationAction

    status = AllocationAction.Status.DRAFT.value
    vesting_schedule = factory.SubFactory(VestingScheduleFactory)
    grant_date = timezone.now()
    type = AllocationAction.Type.DILUTE.value


class CarryPlanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CarryPlan

    company = factory.SubFactory(CompanyFactory)
    default_vesting_schedule = factory.SubFactory(VestingScheduleFactory, company=factory.SelfAttribute('..company'))
    name = factory.Sequence(lambda n: 'carry-pool-{0}'.format(n))
    slug = factory.Sequence(lambda n: 'carry-pool-{0}'.format(n))
    effective_date = timezone.now()

    @classmethod
    def create(cls, **kwargs):
        carry_plan = super().create(**kwargs)
        CarryPoolFactory.create(carry_plan=carry_plan, company=carry_plan.company)
        return carry_plan


class CarryPoolFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CarryPool

    company = factory.SubFactory(CompanyFactory)
    carry_plan = factory.SubFactory(CarryPlanFactory, company=factory.SelfAttribute('..company'))
    bps = 100
    external_id = factory.Sequence(lambda n: 'carry-pool-{0}'.format(n))
    name = factory.Sequence(lambda n: 'carry-pool-{0}'.format(n))
    slug = factory.Sequence(lambda n: 'carry-pool-{0}'.format(n))
    status = CarryPool.Status.PENDING_APPROVAL


class FundCarryPlanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundCarryPlan

    fund = factory.SubFactory(FundFactory)
    carry_plan = factory.SubFactory(CarryPlanFactory, company=factory.SelfAttribute('..fund.company'))


class DealFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Deal

    company = factory.SubFactory(CompanyFactory)
    fund = factory.SubFactory(FundFactory, company=factory.SelfAttribute('..company'))
    name = factory.Faker('company')


class DealCarryPlanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DealCarryPlan

    deal = factory.SubFactory(DealFactory)
    carry_plan = factory.SubFactory(CarryPlanFactory, company=factory.SelfAttribute('..deal.company'))


class CarryFundFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Fund

    fund_currency = factory.SubFactory(CurrencyFactory, company=factory.SelfAttribute('..company'))
    name = factory.LazyAttribute(lambda x: factory.Faker('company'))
    company = factory.SubFactory(CompanyFactory)
    partner_id = factory.Sequence(lambda n: 'partner{0}'.format(n))
    estimated_value = 1000


class ParticipantCarryDocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ParticipantCarryDocument

    is_released = True

class CarryPlanMilestoneFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CarryPlanMilestone

    milestone = factory.SubFactory(MilestoneFactory)
    carry_plan = factory.SubFactory(CarryPlanFactory)
    date = datetime.date.today()
    vesting_percentage = 0


class CarryParticipantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CarryParticipant

    first_name = factory.LazyAttribute(lambda x: fake.unique.name())
    last_name = factory.LazyAttribute(lambda x: fake.unique.name())
    company = factory.SubFactory(CompanyFactory)


class CarryGpCommitmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CarryGpCommitment

    company = factory.SubFactory(CompanyFactory)
    carry_participant = factory.SubFactory(CarryParticipantFactory)
    source_external_id = factory.Faker('uuid4')
    source_type = factory.Faker('word')
    total_capital_commit = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True)
    cashless_commit = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True)
    management_fee_offset = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True)
    salary_reduction = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True)
