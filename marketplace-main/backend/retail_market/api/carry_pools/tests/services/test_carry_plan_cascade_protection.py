from api.carry_pools.models import VestingSchedule, CarryPlan, CarryPool
from api.carry_pools.tests.factories import (VestingScheduleFactory, CarryParticipantFactory, CarryPlanFactory,
                                             CarryPoolFactory)
from api.companies.models import company_logo_upload_path
from core.base_tests import BaseTestCase


class CarryPlanCascadeProtection(BaseTestCase):

    def setUp(self):
        self.create_user()

    def test_carry_plan_protection(self):
        vesting_schedule = VestingScheduleFactory()
        carry_participant = CarryParticipantFactory(company=self.company)
        carry_participant.associate_with_user(self.user)

        template_carry_plan = CarryPlanFactory(
            company=self.company
        )

        carry_plan = CarryPlanFactory(
            company=self.company,
            default_vesting_schedule=vesting_schedule,
            starting_template=template_carry_plan
        )

        carry_pool = CarryPoolFactory(
            company=self.company,
            carry_plan=carry_plan
        )

        vesting_schedule.delete()
        self.assertFalse(VestingSchedule.objects.filter(id=vesting_schedule.id).exists())

        self.assertTrue(CarryPlan.objects.filter(id=carry_plan.id).exists())
        self.assertTrue(CarryPool.objects.filter(id=carry_pool.id, company=self.company).exists())

        template_carry_plan.delete()

        self.assertFalse(CarryPlan.objects.filter(id=template_carry_plan.id).exists())
        self.assertTrue(CarryPlan.objects.filter(id=carry_plan.id).exists())
        self.assertTrue(CarryPool.objects.filter(id=carry_pool.id, company=self.company).exists())

        carry_plan.refresh_from_db()
        carry_plan.delete()
        self.assertFalse(CarryPlan.objects.filter(id=carry_plan.id).exists())
        self.assertTrue(CarryPlan.include_deleted.filter(id=carry_plan.id).exists())
