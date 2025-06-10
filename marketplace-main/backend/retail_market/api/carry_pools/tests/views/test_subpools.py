from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from django.core.files.uploadedfile import SimpleUploadedFile

from rest_framework import status
from rest_framework.reverse import reverse

from api.carry_pools.constants import SUB_POOLS_FEATURE_FLAG
from api.carry_pools.models import CarryPlan, CarrySubPool, CarryDocument
from api.carry_pools.serializers import CarryDocumentSerializer
from api.carry_pools.tests.factories import (VestingScheduleFactory, CarryParticipantFactory)
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.feature_flags.tests.factories import FeatureFactory, ActiveCompanyFeatureFactory
from api.partners.tests.factories import UserFactory, AdminUserFactory
from core.base_tests import BaseTestCase


class CarrySubPoolTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.admin_user = AdminUserFactory(user=self.user,company=self.company)
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.vesting_schedule = VestingScheduleFactory(is_default=True, company=self.company)
        self.vesting_start_date = datetime.now(timezone.utc) + relativedelta(years=15)
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)
        self.feature = FeatureFactory.create(name=SUB_POOLS_FEATURE_FLAG)
        self.company_feature_flag = ActiveCompanyFeatureFactory.create(
            feature=self.feature,
            company=self.company
        )

    def create_carry_document(self):
        document_file = SimpleUploadedFile(
            name='test_file.txt',
            content=b'Sample content for testing',
            content_type='text/plain'
        )

        self.carry_document_request_data = {
            'document_file': document_file,
            'name': 'Test Carry Award Document',
            'description': 'Sample description',
            'show_everytime': True,
            'require_signature': True,
            'document_type': CarryDocument.DocumentType.CARRY_AWARD.value
        }
        context = {'company': self.company, 'admin_user': self.admin_user}
        serializer = CarryDocumentSerializer(data=self.carry_document_request_data, context=context)
        if serializer.is_valid():
            return serializer.save()

    def create_fund_carry_plan_with_sub_pools(self):
        url = reverse('carry-plans-list-create')
        document = self.create_carry_document()
        payload = {
            'bps': 100,
            'default_vesting_schedule': self.vesting_schedule.id,
            'vesting_start_date': self.vesting_start_date,
            'name': 'Carry Plan with SubPools',
            'sub_pools': [
                {"name": "Executive", "bps": "60", "vehicle_id": "", "template_share_class_id": "",
                 "vesting_schedule_id": "", "carry_documents": [document.id]},
                {"name": "Workers", "bps": "40", "vehicle_id": "", "template_share_class_id": "",
                 "vesting_schedule_id": "", "carry_documents": []}
            ]
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CarryPlan.objects.count(), 1)
        self.assertEqual(CarrySubPool.objects.count(), 2)
        self.assertEqual(CarrySubPool.objects.first().subpool_carry_documents.count(), 1)
        self.assertEqual(CarrySubPool.objects.last().subpool_carry_documents.count(), 0)

        return {
            'carry_plan': CarryPlan.objects.first(),
            'sub_pools': CarrySubPool.objects.all()
        }

    def test_carry_plan_without_sub_pools(self):
        # create empty carry plan without sub-pools
        url = reverse('carry-plans-list-create')
        payload = {
            'bps': 100,
            'default_vesting_schedule': self.vesting_schedule.id,
            'vesting_start_date': self.vesting_start_date,
            'name': 'Carry Plan without SubPools'
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CarryPlan.objects.count(), 1)
        self.assertEqual(CarrySubPool.objects.count(), 0)

        carry_plan = CarryPlan.objects.first()

        # edit carry plan now with sub-pools
        payload = {
            'bps': 100,
            'default_vesting_schedule': self.vesting_schedule.id,
            'vesting_start_date': self.vesting_start_date,
            'name': 'Carry Plan with SubPools added later',
            'sub_pools': [
                {"name": "Executive", "bps": "60", "vehicle_id": "", "template_share_class_id": "",
                 "vesting_schedule_id": "", "carry_documents": []},
                {"name": "Workers", "bps": "40", "vehicle_id": "", "template_share_class_id": "",
                 "vesting_schedule_id": "", "carry_documents": []}
            ]

        }
        url = reverse('carry-plan-retrieve-update-delete', kwargs={'pk': carry_plan.id})
        response = self.client.patch(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CarryPlan.objects.count(), 1)
        self.assertEqual(CarrySubPool.objects.count(), 2)

    def test_sub_pools(self):
        response = self.create_fund_carry_plan_with_sub_pools()

        carry_plan = response['carry_plan']
        sub_pools = response['sub_pools']
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        # create allocation with sub pool information
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 55,
                    "allocation_id": None,
                    'sub_pool_id': sub_pools[0].id
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None,
                    'sub_pool_id': sub_pools[1].id
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
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, company_id=carry_plan.company.id)

        # validate allocations and related sub pools
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(carry_pool.allocations[0]['bps'], '55')
        self.assertEqual(carry_pool.allocations[0]['sub_pool_id'], sub_pools[0].id)
        self.assertEqual(carry_pool.allocations[1]['bps'], '15')
        self.assertEqual(carry_pool.allocations[1]['sub_pool_id'], sub_pools[1].id)

        # validate carry plan details for sub pools info and allocations
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        # validate sub pools
        response_sub_pools = data['carry_pool']['sub_pools']
        self.assertEqual(len(response_sub_pools), 2)
       # self.assertEqual(float(response_sub_pools[0]['bps']), 60)
       # self.assertEqual(response_sub_pools[0]['allocated'], '55')
        self.assertEqual(float(response_sub_pools[0]['un_allocated']), 5)
        self.assertEqual(len(response_sub_pools), 2)
        self.assertEqual(response_sub_pools[1]['bps'], 40)
        self.assertEqual(response_sub_pools[1]['allocated'], '15')
        self.assertEqual(float(response_sub_pools[1]['un_allocated']), 25)

        # validate allocations for sub pools info
        response_allocations = data['allocations']
        self.assertEqual(len(response_allocations), 2)
        self.assertEqual(response_allocations[0]['sub_pool_name'], 'Executive')
        self.assertEqual(response_allocations[1]['sub_pool_name'], 'Workers')

        # validate documents in sub_pools info
        self.assertEqual(len(data['carry_pool']['sub_pools'][0]['carry_documents']), 1)
        self.assertEqual(len(data['carry_pool']['sub_pools'][1]['carry_documents']), 0)


    def test_sub_pool_update_view(self):
        response = self.create_fund_carry_plan_with_sub_pools()

        carry_plan = response['carry_plan']
        sub_pools = response['sub_pools']
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        allocations_url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 55,
                    "allocation_id": None,
                    'sub_pool_id': sub_pools[0].id
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None,
                    'sub_pool_id': sub_pools[1].id
                }
            ],
            "mode": None
        }
        response = self.client.post(
            allocations_url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        url = reverse('carry-plan-sub-pools', kwargs={'pk': carry_plan.id})
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        executive_sub_pool = sub_pools.get(name='Executive')
        worker_sub_pool = sub_pools.get(name='Workers')
        data = response.json()
        for sub_pool in data:
            if sub_pool['id'] == executive_sub_pool.id:
                self.assertEqual(sub_pool['allocated'], 55)
                self.assertEqual(sub_pool['un_allocated'], 5)
            else:
                self.assertEqual(sub_pool['allocated'], 15)
                self.assertEqual(sub_pool['un_allocated'], 25)

        # update sub pool

        self.assertIsNone(executive_sub_pool.vesting_schedule_id)

        url = reverse('carry-plan-sub-pools-update', kwargs={'pk': executive_sub_pool.id})
        response = self.client.patch(
            url,
            data={
                'name': 'Executive Updated',
                'vesting_schedule': self.vesting_schedule.id
            },
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        executive_sub_pool.refresh_from_db()
        self.assertEqual(executive_sub_pool.name, 'Executive Updated')
        self.assertEqual(executive_sub_pool.vesting_schedule_id, self.vesting_schedule.id)

        # move sub pools points
        url = reverse('carry-plan-sub-pools-migration')
        response = self.client.post(
            url,
            data={
                'source_pool_id': executive_sub_pool.id,
                'target_pool_id': worker_sub_pool.id,
                'points': 5
            },
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        executive_sub_pool.refresh_from_db()
        worker_sub_pool.refresh_from_db()
        self.assertEqual(executive_sub_pool.bps, 55)
        self.assertEqual(worker_sub_pool.bps, 45)

        response = self.client.post(
            url,
            data={
                'source_pool_id': executive_sub_pool.id,
                'target_pool_id': worker_sub_pool.id,
                'points': 30
            },
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.json()['points'][0]), 'cannot move out more points than available!')

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 0,
                    "allocation_id": None,
                    'sub_pool_id': sub_pools[1].id
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None,
                    'sub_pool_id': sub_pools[1].id
                }
            ],
            "mode": None
        }
        response = self.client.post(
            allocations_url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        response = self.client.post(
            url,
            data={
                'source_pool_id': executive_sub_pool.id,
                'target_pool_id': worker_sub_pool.id,
                'points': 55
            },
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        executive_sub_pool.refresh_from_db()
        worker_sub_pool.refresh_from_db()
        self.assertEqual(executive_sub_pool.bps, 0)
        self.assertEqual(worker_sub_pool.bps, 100)

        url = reverse('carry-plan-sub-pools-update', kwargs={'pk': executive_sub_pool.id})
        response = self.client.delete(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(carry_plan.carry_plan_subpools.count(), 1)
        self.assertTrue(carry_plan.carry_plan_subpools.filter(name='Workers').exists())

        create_sub_pool_payload = {
            "name": "Managerial",
            "bps": 0,
            "vesting_schedule": self.vesting_schedule.id,
            "carry_plan": carry_plan.id
        }
        url = reverse('carry-plan-sub-pools-create')

        response = self.client.post(
            url,
            data=create_sub_pool_payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        executive_sub_pool.refresh_from_db()
        self.assertEqual(carry_plan.carry_plan_subpools.count(), 2)

        managerial_sub_pool = carry_plan.carry_plan_subpools.get(name='Managerial')
        self.assertEqual(managerial_sub_pool.bps, 0)
        self.assertEqual(managerial_sub_pool.vesting_schedule_id, self.vesting_schedule.id)
