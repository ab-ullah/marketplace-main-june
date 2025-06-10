import datetime

from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryPool
from api.carry_pools.tests.factories import (CarryPoolFactory,
                                             VestingScheduleFactory, CarryParticipantFactory)
from api.participants.models import ParticipantProfile
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class CarryPoolParticipantViewTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.vesting_schedule = VestingScheduleFactory(
            is_default=True,
            company=self.company
        )
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    @staticmethod
    def get_url():
        return reverse('carry-pool-allocations')

    def test_create_pool_unauthenticated(self):
        self.create_fund(company=self.company)
        url = self.get_url()
        response = self.client.post(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_to_base_pool(self):
        url = self.get_url()
        admin_user = AdminUser.objects.create(user=self.user, company=self.company)
        pool = CarryPoolFactory(
            created_by=admin_user,
            pools=[],
            bps=150,
            company=self.company
        )

        payload = {
            'base_pool_id': pool.external_id,
            'parent_pool_id': pool.external_id,
            'allocations': [
                {
                    'carry_participant_id': self.carry_participant.id,
                    'bps': 50,
                    'allocation_id': None,
                    'vesting_start_date': datetime.date.today()
                },
                {
                    'carry_participant_id': self.carry_participant.id,
                    'bps': 100,
                    'allocation_id': None,
                    'vesting_start_date': datetime.date.today()
                }
            ]

        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CarryPool.objects.count(), 2)
        carry_pool = CarryPool.objects.latest('created_at')
        self.assertEqual(carry_pool.name, pool.name)
        self.assertEqual(carry_pool.external_id, pool.external_id)
        self.assertEqual(carry_pool.bps, pool.bps)
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(ParticipantProfile.objects.filter(user=self.user, company=self.company).count(), 1)

    def test_add_to_nested_pool(self):
        url = self.get_url()
        admin_user = AdminUser.objects.create(user=self.user, company=self.company)
        pool = CarryPoolFactory(
            created_by=admin_user,
            company=self.company,
            pools=[{
                'name': 'Sub Pool 01',
                'external_id': 'Sub Pool 01',
                'bps': '200',
                'pools': [{
                    'name': 'Sub Pool 02',
                    'external_id': 'Sub Pool 02',
                    'bps': '120',
                }
                ]
            }]
        )

        payload = {
            'base_pool_id': pool.external_id,
            'parent_pool_id': 'Sub Pool 02',
            'allocations': [
                {
                    'carry_participant_id': self.carry_participant.id,
                    'bps': 50,
                    'allocation_id': None,
                    'vesting_start_date': datetime.date.today()
                },
                {
                    'carry_participant_id': self.carry_participant.id,
                    'bps': 70,
                    'allocation_id': None,
                    'vesting_start_date': datetime.date.today()
                }
            ]

        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CarryPool.objects.count(), 2)

        updated_pool = CarryPool.objects.filter(external_id=pool.external_id, company=pool.company).latest('created_at')
        self.assertEqual(len(updated_pool.pools[0]['pools'][0]['allocations']), 2)
        self.assertEqual(ParticipantProfile.objects.filter(user=self.user, company=self.company).count(), 1)
