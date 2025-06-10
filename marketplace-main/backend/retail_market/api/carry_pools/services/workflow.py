from api.carry_pools.models import CarryPlan, CarryPool
from api.carry_pools.utils import get_carry_pool_of_carry_plan


class CarryWorkflowService:

    def __init__(self, carry_plan: CarryPlan):
        self.carry_plan = carry_plan

    def reject_carry_plan(self):
        self.carry_plan.status = CarryPlan.Status.UNAPPROVED.value
        self.carry_plan.save()

    def process(self):
        self.carry_plan.status = CarryPlan.Status.APPROVED.value
        self.carry_plan.save()

        latest_carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.carry_plan.company.id)
        CarryPool.objects.filter(
            pk=latest_carry_pool.pk,
            company=self.carry_plan.company
        ).update(status=CarryPool.Status.APPROVED.value)
