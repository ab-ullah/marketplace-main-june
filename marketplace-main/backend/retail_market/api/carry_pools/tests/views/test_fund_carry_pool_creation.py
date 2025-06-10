from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta

from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.constants import CARRY_PLAN_PUBLISH_FEATURE_FLAG
from api.carry_pools.models import CarryPlan, CarryPool, FundCarryPlan
from api.carry_pools.tests.factories import (CarryPlanFactory,
                                             CarryPoolFactory,
                                             FundCarryPlanFactory,
                                             VestingScheduleFactory, CarryParticipantFactory)
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.feature_flags.tests.factories import FeatureFactory, ActiveCompanyFeatureFactory
from api.partners.tests.factories import FundFactory, UserFactory
from core.base_tests import BaseTestCase


class CarryPlanCreationViewTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.vesting_schedule = VestingScheduleFactory(is_default=True, company=self.company)
        self.carry_effective_date = datetime.now(timezone.utc) + relativedelta(years=15)
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    def test_create_pool_unauthenticated(self):
        url = reverse('carry-plans-list-create')
        response = self.client.get(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_fund_carry_plan(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        self.assertEqual(FundCarryPlan.objects.count(), 0)
        self.assertEqual(CarryPlan.objects.count(), 0)
        self.assertEqual(CarryPool.objects.count(), 0)

        another_fund = FundFactory(company=self.company)
        url = reverse('carry-plans-list-create')
        payload = {
            'funds': [
                {
                    'external_id': self.fund.external_id
                },
                {
                    'external_id': another_fund.external_id
                }
            ],
            'bps': 300,
            'default_vesting_schedule': self.vesting_schedule.id,
            'effective_date': self.carry_effective_date,
            'name': 'First Carry Plan Name for Test'
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FundCarryPlan.objects.count(), 2)
        self.assertEqual(CarryPlan.objects.count(), 1)
        self.assertEqual(CarryPool.objects.count(), 1)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['name'], 'First Carry Plan Name for Test')

        # verify default unpublished status
        self.assertEqual(response.data[0]['status'], 'Unpublished Changes')

        # verify carry plan effective date
        self.assertEqual(CarryPlan.objects.first().effective_date, self.carry_effective_date)

        # Verify FundCarryPlan already exists
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Verify valid fund external_id
        payload['external_id'] = 'some_id'
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def create_fund_carry_plan(self):
        carry_plan = CarryPlanFactory(company=self.company)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        return fund_carry_plan

    def test_create_allocations_with_invalid_distribution(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 110,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 50,
                    "allocation_id": None
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'Total allocated bps cannot be greater than pool bps.'
        )

    def test_create_allocations_with_valid_distribution(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 50,
                    "allocation_id": None
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(carry_pool.allocations[0]['initial_bps'], '40')
        self.assertEqual(carry_pool.allocations[1]['initial_bps'], '50')

        # Check FetchAll Api for carry_plan_allocations
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['allocations'][0]['bps'], '40')
        self.assertEqual(response.data['allocations'][1]['bps'], '50')
        self.assertIn('effective_date', response.data['carry_pool'])

        # Verify CarryPlan Company User Api
        url = reverse('carry-plan-company-users', kwargs={'pk': fund_carry_plan.carry_plan.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_multiple_allocations_for_same_user(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        test_user_one = UserFactory()
        test_user_two = UserFactory()
        carry_participant_one = CarryParticipantFactory(company=self.company)
        carry_participant_two = CarryParticipantFactory(company=self.company)
        carry_participant_one.associate_with_user(test_user_one)
        carry_participant_two.associate_with_user(test_user_two)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_one.id,
                    "bps": 5,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_two.id,
                    "bps": 3,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 3)
        self.assertEqual(carry_pool.allocations[0]['initial_bps'], '15')
        self.assertEqual(carry_pool.allocations[1]['initial_bps'], '5')
        self.assertEqual(carry_pool.allocations[2]['initial_bps'], '3')

        # create another allocation with same user with add mode
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 25,
                    "allocation_id": None
                }
            ],
            "mode": "add"
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 4)
        self.assertEqual(carry_pool.allocations[3]['initial_bps'], '25')

        # further verify that self.carry_participant is allocated 2 times
        user_allocation_count = 0
        for allocation in carry_pool.allocations:
            if allocation['carry_participant_id'] == self.carry_participant.id:
                user_allocation_count = user_allocation_count + 1
        self.assertEqual(user_allocation_count, 2)

    def test_edit_allocations_flow_consistency_with_forfeiture(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        test_user_one = UserFactory()
        test_user_two = UserFactory()
        carry_participant_one = CarryParticipantFactory(company=self.company)
        carry_participant_two = CarryParticipantFactory(company=self.company)
        carry_participant_one.associate_with_user(test_user_one)
        carry_participant_two.associate_with_user(test_user_two)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_one.id,
                    "bps": 25,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_two.id,
                    "bps": 35,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 3)
        self.assertEqual(carry_pool.allocations[0]['bps'], '15')
        self.assertEqual(carry_pool.allocations[1]['bps'], '25')
        self.assertEqual(carry_pool.allocations[2]['bps'], '35')

        # create a forfeiture for participant one
        participant_one_allocation = carry_pool.allocations[1]
        forfeit_url = reverse('forfeiture', kwargs={'user_id': test_user_one.id})
        request_data = [
            {
                "allocation_id": participant_one_allocation['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 5
            }
        ]

        response = self.client.post(forfeit_url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # validate forfeiture
        allocation = response.data[0]
        self.assertEqual(allocation['initial_bps'], 25)
        self.assertEqual(allocation['bps'], '20')
        self.assertEqual(allocation['forfeited_bps'], 5)

        # validate data consistency of all allocations
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 3)
        self.assertEqual(carry_pool.allocations[0]['bps'], '15')
        self.assertEqual(carry_pool.allocations[1]['bps'], '25')
        self.assertEqual(carry_pool.allocations[2]['bps'], '35')

        # edit points of participant two only, send rest same
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": carry_pool.allocations[0]['allocation_id']
                },
                {
                    "carry_participant_id": carry_participant_one.id,
                    "bps": 20,
                    "allocation_id": carry_pool.allocations[1]['allocation_id'],
                    'forfeited_bps': 5
                },
                {
                    "carry_participant_id": carry_participant_two.id,
                    "bps": 12,
                    "allocation_id": carry_pool.allocations[2]['allocation_id']
                }
            ],
            "mode": "edit"
        }

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # validate data consistency of all allocations
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 3)
        self.assertEqual(carry_pool.allocations[0]['bps'], '15')
        self.assertEqual(carry_pool.allocations[1]['bps'], '25')
        self.assertEqual(carry_pool.allocations[2]['bps'], '12')


class CarryPlanRetrieveUpdateDeleteViewTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    @staticmethod
    def get_url(id):
        return reverse(
            'carry-plan-retrieve-update-delete', kwargs={
                'pk': id
            }
        )

    def create_fund_carry_plan(self):
        fund = FundFactory(company=self.company)
        carry_plan = CarryPlanFactory(company=self.company)
        fund_carry_plan = FundCarryPlanFactory(fund=fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        return fund_carry_plan

    def test_delete_api_view(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_pool_to_delete = self.create_fund_carry_plan()
        fund_carry_pool_not_to_delete = self.create_fund_carry_plan()

        self.assertEqual(CarryPlan.objects.count(), 2)

        url = self.get_url(id=fund_carry_pool_to_delete.carry_plan.id)

        response = self.client.delete(
            url,
            format='json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CarryPlan.objects.count(), 1)
        self.assertEqual(CarryPlan.include_deleted.count(), 2)
        self.assertEqual(CarryPool.include_deleted.count(), 6)
        self.assertEqual(CarryPlan.objects.get().id, fund_carry_pool_not_to_delete.carry_plan.id)
        self.assertEqual(
            CarryPool.include_deleted.filter(carry_plan=fund_carry_pool_to_delete.carry_plan).count(),
            3
        )

    def test_update_api_view(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_plan = fund_carry_plan.carry_plan
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, company_id=self.company.id)
        vesting_schedule = VestingScheduleFactory()

        self.assertEqual(FundCarryPlan.objects.count(), 1)
        self.assertEqual(carry_pool.bps, 100.0)
        self.assertNotEqual(carry_plan.default_vesting_schedule, vesting_schedule)
        self.assertEqual(carry_plan.status, CarryPlan.Status.UNPUBLISHED_CHANGE.value)

        # make carry plan status published, with feature flag on

        # carry plan needs to be approved first before published
        carry_plan.status = CarryPlan.Status.APPROVED.value
        carry_plan.save()

        feature = FeatureFactory.create(name=CARRY_PLAN_PUBLISH_FEATURE_FLAG)
        ActiveCompanyFeatureFactory.create(
            feature=feature,
            company=self.company
        )
        publish_api_url = reverse(
            'carry-plan-publish-view', kwargs={
                'pk': carry_plan.pk
            }
        )
        response = self.client.post(publish_api_url, format='json', **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        fund_carry_plan.carry_plan.refresh_from_db()
        self.assertEqual(carry_plan.status, CarryPlan.Status.PUBLISHED.value)

        url = self.get_url(id=fund_carry_plan.carry_plan.id)
        data = {
            'default_vesting_schedule': vesting_schedule.id,
            'bps': 999.0,
            'name': 'carry plan updated name',
            'funds': []
        }
        response = self.client.patch(
            url,
            data,
            format='json',
            **self.get_headers()
        )

        fund_carry_plan.carry_plan.refresh_from_db()
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, carry_plan.company.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(carry_plan.default_vesting_schedule, vesting_schedule)
        self.assertEqual(carry_pool.bps, 999.0)
        self.assertEqual(carry_plan.name, 'carry plan updated name')
        self.assertEqual(FundCarryPlan.objects.count(), 0)
        # verify carry plan status changed after update
        self.assertEqual(carry_plan.status, CarryPlan.Status.UNPUBLISHED_CHANGE.value)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_points'], 999.0)

        # verify assigning multiple funds in edit
        fund_1 = FundFactory(company=self.company)
        fund_2 = FundFactory(company=self.company)
        url = self.get_url(id=carry_plan.id)
        data = {
            'name': 'carry plan updated name',
            'default_vesting_schedule': vesting_schedule.id,
            'bps': 999.0,
            'funds': [
                {
                    'external_id': fund_1.external_id
                },
                {
                    'external_id': fund_2.external_id
                }
            ]
        }
        response = self.client.patch(
            url,
            data,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FundCarryPlan.objects.count(), 2)

        # Verify starting template logic in update api
        # assign allocations
        fund_carry_plan_2 = self.create_fund_carry_plan()
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 50,
                    "allocation_id": None
                }
            ]}
        allocation_url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan_2.carry_plan.id})

        response = self.client.post(
            allocation_url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # send starting_template in patch request
        data = {
            'bps': 1999.0,
            'starting_template': fund_carry_plan_2.carry_plan.id
        }
        response = self.client.patch(
            url,
            data,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
