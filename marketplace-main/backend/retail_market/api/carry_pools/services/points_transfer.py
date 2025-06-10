from datetime import datetime
from decimal import Decimal

from django.db.transaction import atomic

from api.carry_pools.models import AllocationAction
from api.carry_pools.serializers import AllocationActionSerializer
from api.carry_pools.services.add_allocations import AddPoolAllocationsService
from api.carry_pools.utils import get_carry_pool_of_carry_plan


class CarryPlanPointTransferService:
    def __init__(self, company, carry_plan, to_allocations,
                 from_allocation, admin_user):
        self.company = company
        self.carry_plan = carry_plan
        self.to_allocations = to_allocations
        self.from_allocation = from_allocation
        self.admin_user = admin_user

    def get_newly_created_allocations(self, existing_allocations, new_allocations):
        existing_ids = {alloc['allocation_id'] for alloc in existing_allocations}
        return [alloc for alloc in new_allocations if alloc['allocation_id'] not in existing_ids]

    def transfer_points_in_carry_plan(self):
        with atomic():
            carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, company_id=self.company.id)
            existing_allocations = carry_pool.allocations

            # issue new allocations with 0 bps
            for allocation in self.to_allocations:
                allocation['bps'] = '0'
            AddPoolAllocationsService(
                admin_user=self.admin_user,
                base_pool_id=carry_pool.external_id,
                parent_pool_id=carry_pool.external_id,
                allocations_data=self.to_allocations
            ).process(self.carry_plan, 'add')

            carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, company_id=self.company.id)
            new_allocations = carry_pool.allocations
            newly_created_allocations = self.get_newly_created_allocations(existing_allocations, new_allocations)

            # create 2 new transfer allocation actions, for each new allocation
            for new_allocation in self.to_allocations:
                allocation_action_data = [
                    {
                        'grant_date': new_allocation['transfer_date'],
                        'effective_date': datetime.now(),
                        'base_pool_id': carry_pool.external_id,
                        'parent_pool_id': carry_pool.external_id,
                        'carry_participant': self.from_allocation.get('carry_participant_id'),
                        'bps': Decimal(str(new_allocation['transfer_points'])),
                        'type': AllocationAction.Type.TRANSFER_FROM.value,
                        'company': self.company.id,
                        'allocation_id': self.from_allocation.get('allocation_id'),
                        'transferred_to_allocation_id': new_allocation['allocation_id']
                    },
                    {
                        'grant_date': new_allocation['transfer_date'],
                        'effective_date': datetime.now(),
                        'base_pool_id': carry_pool.external_id,
                        'parent_pool_id': carry_pool.external_id,
                        'carry_participant': new_allocation['carry_participant_id'],
                        'bps': Decimal(str(new_allocation['transfer_points'])),
                        'type': AllocationAction.Type.TRANSFER_TO.value,
                        'company': self.company.id,
                        'allocation_id': new_allocation['allocation_id'],
                        'transferred_from_allocation_id': self.from_allocation.get('allocation_id')
                    },
                ]

                serializer = AllocationActionSerializer(data=allocation_action_data, many=True)
                serializer.save() if serializer.is_valid(raise_exception=True) else None

            return {'msg': 'success'}
