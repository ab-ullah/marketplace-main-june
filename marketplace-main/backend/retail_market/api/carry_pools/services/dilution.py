from datetime import datetime
from decimal import Decimal

from rest_framework.generics import get_object_or_404

from api.carry_pools.models import CarryPlan, AllocationAction
from api.carry_pools.serializers import AllocationActionSerializer
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.carry_pools.constants import EVEN_DILUTION, PRO_RATA_DILUTION


class DilutionService:

    def __init__(self, company, carry_plan_id, dilute_points, dilute_date, allocations, mode):
        self.company = company
        self.carry_plan = get_object_or_404(CarryPlan, id=carry_plan_id)
        self.dilute_points = dilute_points
        self.dilute_date = datetime.strptime(dilute_date.split('T')[0], "%Y-%m-%d")
        self.allocations = allocations
        self.mode = mode
        self.errors = []

    def calculate_dilute_points_for_allocation(self, allocation):
        allocation_dilute_points = 0

        if self.mode == EVEN_DILUTION:
            allocation_dilute_points = Decimal(str(self.dilute_points)) / Decimal(len(self.allocations))

        elif self.mode == PRO_RATA_DILUTION:
            sum_of_all = sum([Decimal(str(allocation['bps'])) for allocation in self.allocations])
            allocation_dilute_points = (Decimal(str(allocation['bps'])) / sum_of_all) * Decimal(str(self.dilute_points))

        return allocation_dilute_points

    def get_allocations_with_reduced_points(self):
        negative_points = False
        for allocation in self.allocations:
            allocation_dilute_points = self.calculate_dilute_points_for_allocation(allocation)
            allocation['points_reduced'] = allocation_dilute_points
            if Decimal(str(allocation['bps'])) - allocation_dilute_points < 0:
                negative_points = True

        if negative_points:
            self.errors.append("Cannot Create a Negative Allocation")
        return self.allocations

    def dilute_carry_plan(self):
        carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, company_id=self.company.id)
        for allocation in self.allocations:
            allocation_dilute_points = self.calculate_dilute_points_for_allocation(allocation)
            allocation_action_data = {
                'bps': allocation_dilute_points,
                'carry_participant': allocation['carry_participant_id'],
                'grant_date': self.dilute_date,
                'effective_date': None,
                'base_pool_id': carry_pool.external_id,
                'parent_pool_id': carry_pool.external_id,
                'allocation_id': allocation['allocation_id'],
                'type': AllocationAction.Type.DILUTE.value,
                'company': self.company.id
            }

            serializer = AllocationActionSerializer(data=allocation_action_data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()

        if self.carry_plan.status != CarryPlan.Status.PENDING_APPROVAL.value:
            self.carry_plan.status = CarryPlan.Status.UNPUBLISHED_CHANGE.value
            self.carry_plan.save()

        return {'status': 'OK'}
