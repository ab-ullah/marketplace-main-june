from api.carry_pools.models import AllocationAction
from api.carry_pools.services.process_allocation_action import \
    ProcessAllocationAction
from api.carry_pools.tests.factories import (AllocationActionFactory,
                                             CarryPoolFactory,
                                             VestingScheduleFactory, CarryParticipantFactory)
from api.carry_pools.utils import get_carry_pool
from api.libs.utils.nanoid_generator import generate_nanoid
from core.base_tests import BaseTestCase


class ProcessAllocationActionDilutePoolTests(BaseTestCase):

    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.vesting_schedule = VestingScheduleFactory(is_default=True, company=self.company)
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    def setup_carry_pool(self):
        vesting_schedule = VestingScheduleFactory()

        allocation_action_base_pool = AllocationActionFactory(
            type=AllocationAction.Type.CREATE.value,
            carry_participant=self.carry_participant,
            bps=60,
            vesting_schedule=self.vesting_schedule
        )

        allocation_action = AllocationActionFactory(
            type=AllocationAction.Type.CREATE.value,
            carry_participant=self.carry_participant,
            bps=20,
            vesting_schedule=self.vesting_schedule
        )

        pool = CarryPoolFactory(
            company=self.company,
            created_by=self.admin_user,
            bps=100,
            pools=[{
                'name': 'Sub Pool 01',
                'external_id': 'carry-pool-sub-pool-1',
                'bps': 40,
                'pools': [{
                    'name': 'Sub Pool 02',
                    'external_id': 'carry-pool-sub-pool-2',
                    'bps': 20,
                    'allocations': [{
                        'allocation_id': generate_nanoid(),
                        'allocation_action_id': allocation_action.id,
                        'carry_participant_id': self.carry_participant.id,
                        'bps': allocation_action.bps,
                        'vesting_schedule': self.vesting_schedule.id
                    }],
                    'pools': []
                }]
            }],
            allocations=[
                {
                    'allocation_id': generate_nanoid(),
                    'allocation_action_id': allocation_action_base_pool.id,
                    'carry_participant_id': self.carry_participant.id,
                    'bps': allocation_action_base_pool.bps,
                    'vesting_schedule': self.vesting_schedule.id
                }
            ]
        )
        return pool

    def test_dilute_participant_same_parent_and_base_pool(self):
        base_pool = self.setup_carry_pool()

        allocation_action = AllocationActionFactory(
            parent_pool_id=base_pool.external_id,
            base_pool_id=base_pool.external_id,
            type=AllocationAction.Type.DILUTE.value,
            bps=50,
            carry_participant=self.carry_participant
        )

        process_allocation_action = ProcessAllocationAction(allocation_action.id, self.admin_user)
        process_allocation_action.process_dilute_action()

        base_pool = get_carry_pool(
            base_pool_id=base_pool.external_id,
            company_id=self.company.id
        )
        self.assertEqual(len(base_pool.allocations), 2)
        allocation_bps = sum([allocation['bps'] for allocation in base_pool.allocations])
        self.assertEqual(allocation_bps, 80)

    def test_dilute_participant_different_parent_and_base_pool(self):
        base_pool = self.setup_carry_pool()

        allocation_action = AllocationActionFactory(
            parent_pool_id='carry-pool-sub-pool-2',
            base_pool_id=base_pool.external_id,
            type=AllocationAction.Type.DILUTE.value,
            carry_participant=self.carry_participant,
            bps=10
        )

        process_allocation_action = ProcessAllocationAction(allocation_action.id, self.admin_user)
        process_allocation_action.process_dilute_action()

        base_pool = get_carry_pool(
            base_pool_id=base_pool.external_id,
            company_id=self.company.id
        )
        self.assertEqual(len(base_pool.pools[0]['pools'][0]['allocations']), 2)
        self.assertEqual(base_pool.pools[0]['pools'][0]['allocations'][0]['bps'], 10)
