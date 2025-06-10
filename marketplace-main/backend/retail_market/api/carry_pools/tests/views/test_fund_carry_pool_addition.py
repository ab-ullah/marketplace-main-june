from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryPool
from api.carry_pools.tests.factories import CarryPoolFactory
from api.partners.tests.factories import FundFactory, UserFactory
from core.base_tests import BaseTestCase


class CarryPoolAdditionViewTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)

    @staticmethod
    def get_url():
        return reverse('carry-pool-add')

    def test_create_pool_unauthenticated(self):
        url = self.get_url()
        response = self.client.post(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_new_pool(self):
        url = self.get_url()
        admin_user = AdminUser.objects.create(user=self.user, company=self.company)
        payload = {
            'name': 'Main Pool 01',
            'bps': '20',
            'base_pool_id': None,
            'parent_pool_id': None,
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CarryPool.objects.count(), 1)
        pool = CarryPool.objects.first()
        self.assertEqual(pool.created_by_id, admin_user.id)

        payload = {
            'name': 'Sub Pool 01',
            'bps': '20',
            'base_pool_id': pool.external_id,
            'parent_pool_id': pool.external_id,
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CarryPool.objects.count(), 2)
        pool = CarryPool.objects.latest('created_at')
        self.assertEqual(pool.created_by_id, admin_user.id)
        self.assertEqual(len(pool.pools), 1)
        self.assertEqual(pool.pools[0]['name'], 'Sub Pool 01')
        self.assertEqual(pool.pools[0]['bps'], 20)

        payload = {
            'name': 'Sub Sub Pool 01',
            'bps': '20',
            'base_pool_id': pool.external_id,
            'parent_pool_id': pool.pools[0]['external_id'],
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CarryPool.objects.count(), 3)
        pool = CarryPool.objects.latest('created_at')
        self.assertEqual(pool.created_by_id, admin_user.id)
        self.assertEqual(len(pool.pools), 1)
        self.assertEqual(pool.pools[0]['name'], 'Sub Pool 01')
        self.assertEqual(pool.pools[0]['bps'], 20)
        self.assertEqual(pool.pools[0]['pools'][0]['name'], 'Sub Sub Pool 01')
        self.assertEqual(pool.pools[0]['pools'][0]['bps'], 20)

        pool_id = pool.pools[0]['pools'][0]['external_id']
        payload = {
            'name': 'updated name',
            'bps': 10,
            'base_pool_id': pool.external_id,
            'parent_pool_id': pool.pools[0]['external_id'],
            'pool_id': pool_id
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CarryPool.objects.count(), 4)
        pool = CarryPool.objects.latest('created_at')
        self.assertEqual(pool.created_by_id, admin_user.id)
        self.assertEqual(len(pool.pools), 1)
        self.assertEqual(pool.pools[0]['name'], 'Sub Pool 01')
        self.assertEqual(pool.pools[0]['bps'], 20)
        self.assertEqual(pool.pools[0]['pools'][0]['name'], 'updated name')
        self.assertEqual(pool.pools[0]['pools'][0]['bps'], 10)
