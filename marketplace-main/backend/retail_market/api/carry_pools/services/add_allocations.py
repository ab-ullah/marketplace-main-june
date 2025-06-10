import logging
from copy import deepcopy
from datetime import datetime
from decimal import Decimal

from dateutil.parser import parse as dt_parse

from django.db.transaction import atomic
from django.http import Http404
from rest_framework.generics import get_object_or_404

from api.admin_users.models import AdminUser
from api.carry_pools.models import AllocationAction, CarryPool, VestingSchedule, CarryDocument, CarryParticipant, \
    CarryPlan
from api.carry_pools.serializers import (AllocationActionSerializer,
                                         AllocationSerializer)
from api.carry_pools.utils import find_pool_by_external_id, associate_with_carry_document, operate_on_numbers
from api.libs.utils.nanoid_generator import generate_nanoid
from api.participants.models import ParticipantProfile

logger = logging.getLogger()


class AddPoolAllocationsService:
    def __init__(self,
                 admin_user: AdminUser,
                 base_pool_id: str,
                 parent_pool_id: str,
                 allocations_data: any
                 ):
        self.parent_pool_id = parent_pool_id
        self.base_pool_id = base_pool_id
        self.allocations_data = allocations_data
        self.admin_user = admin_user
        self.company = self.admin_user.company
        self.allocations = []
        self.base_pool = self.get_carry_pool()

    def update_allocations_in_pool(self, pool):
        if pool.get('external_id') == self.parent_pool_id:
            pool['allocations'] = self.allocations
            return

        for sub_pool in pool.get('pools', []):
            if sub_pool['external_id'] == self.parent_pool_id:
                sub_pool['allocations'] = self.allocations
                return

        for sub_pool in pool.get('pools', []):
            self.update_allocations_in_pool(pool=sub_pool)

    def get_carry_pool(self):
        base_pool_id = self.base_pool_id if self.base_pool_id else self.parent_pool_id
        return CarryPool.objects.filter(
            external_id=base_pool_id,
            company_id=self.company.id
        ).latest(
            'created_at'
        )

    @staticmethod
    def get_carry_participant(carry_participant_id):
        try:
            return CarryParticipant.objects.get(id=carry_participant_id)
        except CarryParticipant.DoesNotExist:
            return None

    def set_allocation_action_to_zero(self, user):
        filter_criteria = {
            'base_pool_id': self.base_pool_id,
            'parent_pool_id': self.parent_pool_id,
            'user': user,
            'type': AllocationAction.Type.CREATE.value
        }
        is_action = AllocationAction.objects.filter(**filter_criteria).exists()

        if is_action:
            action = AllocationAction.objects.get(**filter_criteria)
            action.bps = 0
            action.save()

    def get_pool_allocation(self, allocation_id):
        if self.base_pool_id == self.parent_pool_id:
            allocations = self.base_pool.allocations
        else:
            parent_pool = find_pool_by_external_id(self.base_pool.pools, self.parent_pool_id)
            allocations = parent_pool.get('allocations', [])

        for allocation in allocations:
            if allocation['allocation_id'] == allocation_id:
                return deepcopy(allocation)

        return None

    def create_participant_profiles(self, carry_participant):
        carry_users = carry_participant.carry_participant_user.all()
        for carry_user in carry_users:
            user = carry_user.user
            if hasattr(user, "user_participant_profile"):
                profile = user.user_participant_profile
                profile.company = self.company
                profile.save()
            else:
                ParticipantProfile.objects.create(
                    user=user,
                    company=self.company,
                )
                logger.info(f"Created participant profile for {carry_participant.id=} {user.id=}")

    def zero_bps_input_validation(self, allocation_data):
        allocation_actions_sum = operate_on_numbers(
            '+',
            allocation_data.get('forfeited_bps', 0),
            allocation_data.get('diluted_bps', 0),
            allocation_data.get('transferred_from_bps', 0)
        )

        if Decimal(str(allocation_data['bps'])) <= 0 and allocation_actions_sum == 0:
            raise ValueError('Cannot Assign 0 or less points')

    def create_update_allocations(self, bulk_allocations=None):
        if not bulk_allocations:
            bulk_allocations = []
        default_vesting_schedule = VestingSchedule.get_default_vesting_schedule(self.company)

        for allocation_data in self.allocations_data:
            carry_participant = AddPoolAllocationsService.get_carry_participant(allocation_data['carry_participant_id'])

            if not carry_participant or not allocation_data.get('bps'):
                continue

            self.create_participant_profiles(carry_participant=carry_participant)

            vesting_schedule_id = allocation_data.get('vesting_schedule') or default_vesting_schedule.id

            if allocation_data.get('vesting_start_date'):
                vesting_start_date = allocation_data.get('vesting_start_date').split('T')[0]
            elif self.carry_plan.effective_date:
                vesting_start_date = self.carry_plan.effective_date.strftime("%Y-%m-%d")
            else:
                vesting_start_date = None

            grant_date = None
            if allocation_data.get('grant_date'):
                grant_date = dt_parse(allocation_data['grant_date'])

            if allocation_data.get('allocation_id'):
                allocation = self.get_pool_allocation(allocation_data['allocation_id'])
                last_initial_bps = allocation['initial_bps']
                self.zero_bps_input_validation(allocation_data)
                original_bps = operate_on_numbers('+',
                                                  allocation_data['bps'],
                                                  allocation_data.get('forfeited_bps', 0),
                                                  allocation_data.get('diluted_bps', 0),
                                                  allocation_data.get('transferred_from_bps', 0),
                                                  )
                if allocation_data.get('transferred_to_bps'):
                    original_bps = operate_on_numbers('-',
                                                      original_bps,
                                                      allocation_data.get('transferred_to_bps')
                                                      )
                allocation.update({
                    'bps': str(original_bps),
                    'initial_bps': str(original_bps),
                    'vesting_schedule': vesting_schedule_id,
                    'vesting_start_date': vesting_start_date,
                    'vehicle': allocation_data.get('vehicle', 0),
                    'share_class': allocation_data.get('share_class', 0)
                })
                if grant_date:
                    allocation['grant_date'] = grant_date.strftime("%Y-%m-%d")

                if allocation_data.get('sub_pool_id'):
                    allocation.update({
                        'sub_pool_id': allocation_data.get('sub_pool_id')
                    })
                allocation_action = get_object_or_404(AllocationAction, id=allocation['allocation_action_id'])
                allocation_action.vesting_schedule_id = vesting_schedule_id
                allocation_action.save()

                # create edit allocation action
                if original_bps != Decimal(str(last_initial_bps)):
                    allocation_action_data = {
                        'grant_date': grant_date or datetime.now(),
                        'effective_date': allocation_data.get('effective_date'),
                        'base_pool_id': self.base_pool_id,
                        'parent_pool_id': self.parent_pool_id,
                        'carry_participant': carry_participant.id,
                        'bps': Decimal(str(allocation_data['bps'])),
                        'type': AllocationAction.Type.EDIT.value,
                        'company': self.company.id,
                        'allocation_id': allocation['allocation_id']
                    }

                    serializer = AllocationActionSerializer(data=allocation_action_data)
                    serializer.save() if serializer.is_valid(raise_exception=True) else None

                bulk_allocations.append(allocation)

            else:
                allocation_id = generate_nanoid()

                allocation_action_data = {
                    'grant_date': grant_date or datetime.now(),
                    'effective_date': allocation_data.get('effective_date'),
                    'base_pool_id': self.base_pool_id,
                    'parent_pool_id': self.parent_pool_id,
                    'carry_participant': carry_participant.id,
                    'bps': Decimal(str(allocation_data['bps'])),
                    'vesting_schedule_id': vesting_schedule_id,
                    'type': AllocationAction.Type.CREATE.value,
                    'company': self.company.id,
                    'allocation_id': allocation_id
                }

                serializer = AllocationActionSerializer(data=allocation_action_data)
                allocation_action = serializer.save() if serializer.is_valid(raise_exception=True) else None

                allocation_data.update({
                    'initial_bps': allocation_data['bps'],
                    'allocation_action_id': allocation_action.id,
                    'carry_participant_id': carry_participant.id,
                    'forfeited_bps': 0,
                    'allocation_id': allocation_id,
                    'vesting_schedule': vesting_schedule_id,
                    'grant_date': allocation_action.grant_date.strftime(
                        "%Y-%m-%d") if allocation_action.grant_date else None,
                    'carry_plan_id': self.carry_plan.id if self.carry_plan else 0,
                    'vesting_start_date': vesting_start_date,
                    'vehicle': allocation_data.get('vehicle', 0),
                    'share_class': allocation_data.get('share_class', 0)
                })
                bulk_allocations.append(allocation_data)

                if self.carry_plan:
                    associate_with_carry_document(
                        self.carry_plan,
                        carry_participant,
                        self.company,
                        CarryDocument.DocumentType.CARRY_AWARD.value,
                        allocation_id,
                        allocation_data.get('sub_pool_id')
                    )

        serializer = AllocationSerializer(data=bulk_allocations, many=True)

        if serializer.is_valid(raise_exception=True):
            self.allocations = serializer.validated_data

    def delete_allocations(self, bulk_allocations):
        new_allocations = []
        allocation_ids_deleted = [allocation.get('allocation_id') for allocation in self.allocations_data]
        for allocation in bulk_allocations:
            if allocation.get('allocation_id') not in allocation_ids_deleted:
                new_allocations.append(allocation)

        serializer = AllocationSerializer(data=new_allocations, many=True)

        if serializer.is_valid(raise_exception=True):
            self.allocations = serializer.validated_data

    def process(self, carry_plan=None, mode=None):
        with atomic():
            self.carry_plan = carry_plan
            carry_pool = self.base_pool

            if mode == 'add':
                self.create_update_allocations(bulk_allocations=carry_pool.allocations)
            elif mode == 'delete':
                self.delete_allocations(bulk_allocations=carry_pool.allocations)
            else:
                self.create_update_allocations()

            if self.base_pool_id == self.parent_pool_id:
                updated_pool = deepcopy(carry_pool)
                updated_pool.pk = None
                updated_pool.status = CarryPool.Status.UNPUBLISHED_CHANGE.value
                updated_pool._state.adding = True
                updated_pool.allocations = self.allocations
                updated_pool.save()

                if updated_pool.carry_plan.status != CarryPlan.Status.PENDING_APPROVAL.value:
                    updated_pool.carry_plan.status = CarryPlan.Status.UNPUBLISHED_CHANGE.value
                    updated_pool.carry_plan.save()

                return

            if carry_pool.pools:
                for pool in carry_pool.pools:
                    self.update_allocations_in_pool(pool=pool)

            return CarryPool.objects.create(
                external_id=carry_pool.external_id,
                pools=carry_pool.pools,
                allocations=carry_pool.allocations,
                created_by=self.admin_user,
                name=carry_pool.name,
                bps=carry_pool.bps,
                carry_plan=carry_pool.carry_plan,
                company=carry_pool.company
            )
