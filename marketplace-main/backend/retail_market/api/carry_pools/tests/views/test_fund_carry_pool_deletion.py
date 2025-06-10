from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryPool
from api.carry_pools.tests.factories import CarryPoolFactory
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class CarryPoolDeletionViewTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)

    @staticmethod
    def get_url():
        return reverse('carry-pool-delete')

    def test_create_pool_unauthenticated(self):
        url = self.get_url()
        response = self.client.post(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_base_pool(self):
        url = self.get_url()
        admin_user = AdminUser.objects.create(user=self.user, company=self.company)
        pool = CarryPoolFactory(
            created_by=admin_user,
            company=admin_user.company,
            pools=[]
        )
        payload = {
            'base_pool_id': pool.external_id,
            'pool_id': pool.external_id,

        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CarryPool.objects.count(), 0)

        # Check Soft Delete by model
        CarryPoolFactory(
            created_by=admin_user,
            company=admin_user.company,
            pools=[]
        )
        self.assertEqual(CarryPool.objects.count(), 1)
        CarryPool.objects.first().delete()
        self.assertEqual(CarryPool.objects.count(), 2)

    def test_delete_nested_pool(self):
        url = self.get_url()
        admin_user = AdminUser.objects.create(user=self.user, company=self.company)
        pool = CarryPoolFactory(
            created_by=admin_user,
            company=admin_user.company,
            pools=[{
                'name': 'Sub Pool 01',
                'external_id': 'Sub Pool 01',
                'bps': '20',
                'pools': [{
                    'name': 'Sub Pool 02',
                    'external_id': 'Sub Pool 02',
                    'bps': '20',
                }
                ]
            }]
        )

        payload = {
            'base_pool_id': pool.external_id,
            'pool_id': 'Sub Pool 02',

        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CarryPool.objects.count(), 2)
