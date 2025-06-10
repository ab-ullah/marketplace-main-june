from datetime import date
from decimal import Decimal

from django.shortcuts import get_object_or_404
from django.utils.text import slugify

from api.carry_pools.models import (AllocationAction, LegalEntity,
                                    VestingSchedule)
from api.carry_pools.serializers import AllocationSerializer
from api.carry_pools.utils import (find_pool_by_external_id, floor_round,
                                   get_carry_pool)
from api.libs.utils.nanoid_generator import generate_nanoid


class ProcessAllocationAction:

    def __init__(self, allocation_action_id, admin_user):
        self.admin_user = admin_user
        self.allocation_action = get_object_or_404(AllocationAction, pk=allocation_action_id)
        self.legal_entity = LegalEntity.objects.filter(company=self.admin_user.company).first()

    def get_base_pool(self):
        return get_carry_pool(
            base_pool_id=self.allocation_action.base_pool_id,
            company_id=self.admin_user.company.id
        )

    def process_dilute_action(self):
        base_pool = self.get_base_pool()

        if self.allocation_action.parent_pool_id == self.allocation_action.base_pool_id:
            allocated_bps = self.calculate_allocated_bps(base_pool.pools, base_pool.allocations)
            unallocated_bps = base_pool.bps - allocated_bps
            allocations = base_pool.allocations
            pools = base_pool.pools

        elif self.allocation_action.parent_pool_id != self.allocation_action.base_pool_id:
            parent_pool = find_pool_by_external_id(base_pool.pools, self.allocation_action.parent_pool_id)
            allocated_bps = self.calculate_allocated_bps(
                parent_pool.get('pools', []), parent_pool.get('allocations', [])
            )
            unallocated_bps = parent_pool.get('bps', 0) - allocated_bps
            allocations = parent_pool.get('allocations', [])
            pools = parent_pool.get('pools', [])

        bps_to_dilute = float(self.allocation_action.bps) - unallocated_bps

        self.dilute_pool(bps_to_dilute, allocated_bps, allocations, pools)
        self._add_participant_or_pool(pools, allocations, base_pool.carry_plan.id)

        if self.allocation_action.parent_pool_id == self.allocation_action.base_pool_id:
            base_pool.allocations = allocations
        elif self.allocation_action.parent_pool_id != self.allocation_action.base_pool_id:
            parent_pool['allocations'] = allocations

        base_pool.save()

    def dilute_pool(self, bps_to_dilute, allocated_bps, allocations, pools):
        if bps_to_dilute > 0:
            proportion = bps_to_dilute / allocated_bps
            for allocation in allocations:
                allocation['bps'] -= allocation['bps'] * proportion
                allocation['bps'] = floor_round(allocation['bps'])

            for pool in pools:
                self._dilute_child_pools(pool, pool['bps'] * proportion)

    def _add_participant_or_pool(self, pools, allocations, carry_plan_id):
        if self.allocation_action.carry_participant:
            vesting_schedule = VestingSchedule.get_default_vesting_schedule(self.admin_user.company)

            allocation = {
                'allocation_id':  generate_nanoid(),
                'allocation_action_id': self.allocation_action.id,
                'carry_participant_id': self.allocation_action.carry_participant.id,
                'initial_bps': float(str(self.allocation_action.bps)),
                'grant_date': date.today().strftime("%Y-%m-%d"),
                'bps': float(str(self.allocation_action.bps)),
                'vesting_schedule': vesting_schedule.id,
                'carry_plan_id': carry_plan_id,
                'vesting_start_date': date.today().strftime("%Y-%m-%d"),
            }
            serializer = AllocationSerializer(data=allocation)

            if serializer.is_valid(raise_exception=True):
                allocations.append(allocation)

        else:
            pool = {
                'external_id': generate_nanoid(),
                'name': self.allocation_action.pool_name,
                'slug': slugify(self.allocation_action.pool_name),
                'allocations': [],
                'pools': [],
                'bps': self.allocation_action.bps
            }
            pools.append(pool)

    def _dilute_child_pools(self, pool, bps_to_reduce):
        # Check if there are any unallocated BPS
        total_allocated_bps = self.calculate_allocated_bps(
                pool.get('pools', []), pool.get('allocations', [])
            )
        unallocated_bps = pool['bps'] - total_allocated_bps

        if unallocated_bps >= bps_to_reduce:
            pool['bps'] -= bps_to_reduce
            pool['bps'] = floor_round(pool['bps'])
            return bps_to_reduce
        else:
            bps_to_reduce = bps_to_reduce - unallocated_bps

        bps_reduced = 0

        # Calculate the percentage to reduce from direct participants and child pools
        if total_allocated_bps == 0:  # Division by Zero
            return bps_reduced

        proportion = bps_to_reduce / total_allocated_bps
        # Reduce from direct participants
        allocations = pool.get('allocations', [])
        for allocation in allocations:
            participant_bps = allocation['bps']
            reduction = participant_bps * proportion
            allocation['bps'] -= reduction
            allocation['bps'] = floor_round(allocation['bps'])
            bps_reduced += reduction

        # Reduce from child pools recursively
        child_pools = pool.get('pools', [])
        for child_pool in child_pools:
            reduction = self._dilute_child_pools(child_pool, child_pool['bps'] * proportion)
            bps_reduced += reduction

        pool['bps'] = pool['bps'] - bps_to_reduce - unallocated_bps
        pool['bps'] = floor_round(pool['bps'])

        return bps_reduced

    def calculate_allocated_bps(self, pools, allocations):
        pool_allocated_bps = sum(pool['bps'] for pool in pools)
        participant_allocated_bps = sum(allocation['bps'] for allocation in allocations)
        return pool_allocated_bps + participant_allocated_bps

    def process(self):
        if self.allocation_action.type == AllocationAction.Type.DILUTE.value:
            self.process_dilute_action()

        return
