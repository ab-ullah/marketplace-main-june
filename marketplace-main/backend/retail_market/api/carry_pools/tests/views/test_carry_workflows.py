from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import Group

from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.constants import CARRY_PLAN_PUBLISH_FEATURE_FLAG, CARRY_APPROVE_ERROR_MSG
from api.carry_pools.models import CarryPlan
from api.carry_pools.tests.factories import (VestingScheduleFactory, CarryParticipantFactory)
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.feature_flags.tests.factories import FeatureFactory, ActiveCompanyFeatureFactory
from api.partners.tests.factories import UserFactory
from api.users.constants import CARRY_REVIEWER
from api.workflows.models import WorkFlow, Task
from core.base_tests import BaseTestCase


class CarryWorkflowTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.vesting_schedule = VestingScheduleFactory(is_default=True, company=self.company)
        self.vesting_start_date = datetime.now(timezone.utc) + relativedelta(years=15)
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)
        self.feature = FeatureFactory.create(name=CARRY_PLAN_PUBLISH_FEATURE_FLAG)
        self.company_feature_flag = ActiveCompanyFeatureFactory.create(
            feature=self.feature,
            company=self.company
        )

    def create_fund_carry_plan(self):
        url = reverse('carry-plans-list-create')
        payload = {
            'bps': 100,
            'default_vesting_schedule': self.vesting_schedule.id,
            'vesting_start_date': self.vesting_start_date,
            'name': 'Carry Plan Test'
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CarryPlan.objects.count(), 1)

        return CarryPlan.objects.first()

    def test_carry_approval_workflow(self):
        admin_user = AdminUser.objects.create(user=self.user, company=self.company)
        carry_plan = self.create_fund_carry_plan()

        # create allocations
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 55,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # validate carry plan unapproved/unpublished status
        carry_plan: CarryPlan = CarryPlan.objects.get(pk=carry_plan.id)
        self.assertEqual(carry_plan.status, CarryPlan.Status.UNPUBLISHED_CHANGE.value)

        # validate submit for approval is denied if no user with carry approve permission exists
        url = reverse('carry-plan-submit-for-approval', kwargs={'pk': carry_plan.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['msg'], CARRY_APPROVE_ERROR_MSG)

        # give carry reviewer permission to admin user
        carry_reviewer_group = Group.objects.get(name=CARRY_REVIEWER)
        admin_user.groups.add(carry_reviewer_group)

        # create task and workflow for carry reviewer admins
        url = reverse('carry-plan-submit-for-approval', kwargs={'pk': carry_plan.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(WorkFlow.objects.count(), 1)
        self.assertEqual(WorkFlow.objects.first().module, WorkFlow.WorkFlowModuleChoices.CARRY_PLAN.value)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.first().assigned_to.id, admin_user.id)

        # validate carry plan is now in pending approval state
        carry_plan: CarryPlan = CarryPlan.objects.get(pk=carry_plan.id)
        self.assertEqual(carry_plan.status, CarryPlan.Status.PENDING_APPROVAL.value)

        # call tasks api to approve workflow and verify carry plan status
        url = reverse('task-retrieve-update-view', kwargs={'pk': Task.objects.first().id})
        payload  = {'status': 2, 'completed': True}
        response = self.client.patch(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_plan: CarryPlan = CarryPlan.objects.get(pk=carry_plan.id)
        self.assertEqual(carry_plan.status, CarryPlan.Status.APPROVED.value)

    def test_highlight_allocation_difference(self):
        # give carry reviewer permission to admin user
        admin_user = AdminUser.objects.create(user=self.user, company=self.company)
        carry_reviewer_group = Group.objects.get(name=CARRY_REVIEWER)
        admin_user.groups.add(carry_reviewer_group)

        carry_plan = self.create_fund_carry_plan()

        # create allocations
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 55,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None
                }
            ],
            "mode": 'add'
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        carry_plan: CarryPlan = CarryPlan.objects.get(pk=carry_plan.id)
        # create task and workflow for carry reviewer admins
        url = reverse('carry-plan-submit-for-approval', kwargs={'pk': carry_plan.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(WorkFlow.objects.count(), 1)
        self.assertEqual(WorkFlow.objects.first().module, WorkFlow.WorkFlowModuleChoices.CARRY_PLAN.value)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.first().assigned_to.id, admin_user.id)

        # call tasks api to approve workflow and verify carry plan status
        url = reverse('task-retrieve-update-view', kwargs={'pk': Task.objects.first().id})
        payload = {'status': 2, 'completed': True}
        response = self.client.patch(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_plan: CarryPlan = CarryPlan.objects.get(pk=carry_plan.id)
        self.assertEqual(carry_plan.status, CarryPlan.Status.APPROVED.value)

        # validate latest carry pool is also in approved status
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, carry_plan.company.id)

        # edit carry plan, add new allocation to create difference in allocations
        # create allocations
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 10,
                    "allocation_id": None
                }
            ],
            "mode": 'add'
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


        # validate last_approved_allocations in api response
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn('last_approved_allocations', data)
        self.assertEqual(len(data['allocations']), 3)
        self.assertEqual(len(data['last_approved_allocations']), 2)
