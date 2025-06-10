from datetime import datetime
from unittest import mock

from dateutil.relativedelta import relativedelta
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.reverse import reverse

from api.carry_pools.models import CarryDocument, ParticipantCarryDocument, CarryPlan
from api.carry_pools.serializers import CarryDocumentSerializer, CarryDocumentParticipantSerializer
from api.carry_pools.tests.factories import CarryPlanFactory, FundCarryPlanFactory, CarryPoolFactory, \
    ParticipantCarryDocumentFactory, VestingScheduleFactory, CarryParticipantFactory
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.partners.tests.factories import FundFactory
from core.base_tests import BaseTestCase


class CarryDocumentAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund(company=self.company)
        self.carry_plan = self.create_carry_plan()
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    def create_carry_plan(self):
        carry_plan = CarryPlanFactory(company=self.company)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)
        return fund_carry_plan.carry_plan

    def create_carry_plan_with_carry_documents(self, carry_document_ids):
        fund = FundFactory(company=self.company, accept_applications=True)
        vesting_schedule = VestingScheduleFactory(is_default=True, company=self.company)
        url = reverse('carry-plans-list-create')
        payload = {
            'external_id': fund.external_id,
            'bps': 100,
            'default_vesting_schedule': vesting_schedule.id,
            'is_deal': False,
            'carry_documents': carry_document_ids,
            'name': 'some carry plan name'
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        carry_plan_id = response.data['id']
        carry_plan = CarryPlan.objects.get(id=carry_plan_id)

        return carry_plan

    def add_allocation_in_carry_plan(self, carry_plan):
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None,
                    "grant_date": datetime.now() - relativedelta(years=2, days=1)
                }
            ],
            "mode": "add"
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

    def create_carry_document(self, carry_plan_ids=None):
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
        if carry_plan_ids:
            self.carry_document_request_data['carry_plans'] = str(carry_plan_ids)
        context = {'company': self.company, 'admin_user': self.admin_user}
        serializer = CarryDocumentSerializer(data=self.carry_document_request_data, context=context)
        if serializer.is_valid():
            return serializer.save()

    def test_carry_document_creation(self):
        self.create_carry_document()
        self.assertEqual(CarryDocument.objects.count(), 1)

        created_document = CarryDocument.objects.first()
        data = self.carry_document_request_data

        self.assertEqual(created_document.name, data['name'])
        self.assertEqual(created_document.description, data['description'])
        self.assertEqual(created_document.show_everytime, True)
        self.assertEqual(created_document.require_signature, True)
        self.assertEqual(created_document.company, self.company)

    def test_carry_document_creation_with_carry_plans(self):
        self.create_carry_document(self.carry_plan.id)
        self.assertEqual(CarryDocument.objects.count(), 1)

        created_document = CarryDocument.objects.first()
        data = self.carry_document_request_data

        self.assertEqual(created_document.name, data['name'])
        self.assertEqual(created_document.require_gp_signature, False)
        self.assertEqual(self.carry_plan.associated_carry_documents.count(), 1)

    def test_carry_document_retrieval_update(self):
        self.create_carry_document(self.carry_plan.id)
        self.assertEqual(CarryDocument.objects.count(), 1)

        # test fetch all api
        url = reverse('carry-documents')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data[0]
        carry_document_id = data['id']
        self.assertEqual(len(response.data), 1)
        self.assertEqual(data['document_type_display'], 'Carry Award')

        # test get by id
        url = reverse('carry-document-get-update', kwargs={'pk': carry_document_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['id'], carry_document_id)
        self.assertEqual(data['document_status'], True)
        self.assertEqual(data['carry_plans_display'], [self.carry_plan.id])

        # test update by id
        url = reverse('carry-document-get-update', kwargs={'pk': carry_document_id})
        payload = {
            'document_status': False
        }
        response = self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['id'], carry_document_id)
        self.assertEqual(data['document_status'], False)

    def test_participant_carry_document_associations_upon_allocation(self):
        self.create_carry_document(carry_plan_ids=self.carry_plan.id)
        self.assertEqual(CarryDocument.objects.count(), 1)
        carry_document = CarryDocument.objects.first()

        # verify document is carry award document
        self.assertEqual(carry_document.document_type, CarryDocument.DocumentType.CARRY_AWARD.value)

        # verify if document is associated with a participant upon allocation
        self.add_allocation_in_carry_plan(self.carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 1)

        # verify if document is associated again upon allocation since show_everytime is true
        self.add_allocation_in_carry_plan(self.carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 2)

        # verify document is not associated again upon allocation when its forfeiture document
        carry_document.document_type = CarryDocument.DocumentType.CARRY_FORFEITURE.value
        carry_document.save()
        self.add_allocation_in_carry_plan(self.carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 2)

        # revert to default carry doc
        carry_document.document_type = CarryDocument.DocumentType.CARRY_AWARD.value
        carry_document.save()

        # verify document is not associated again upon allocation when show_everytime is False
        carry_document.show_everytime = False
        carry_document.save()
        self.add_allocation_in_carry_plan(self.carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 2)

        # set show everytime true again for further testing
        carry_document.show_everytime = True
        carry_document.save()

        # verify document is triggered based on document status
        carry_document.document_status = True
        carry_document.save()
        self.add_allocation_in_carry_plan(self.carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 3)

        carry_document.document_status = False
        carry_document.save()
        self.add_allocation_in_carry_plan(self.carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 3)

        # verify that all allocations and carry docs were for same user
        allocations = get_carry_pool_of_carry_plan(self.carry_plan.id, self.company.id).allocations
        carry_participant_ids = set([allocation['carry_participant_id'] for allocation in allocations])
        self.assertEqual(len(allocations), 6)
        self.assertEqual(carry_participant_ids, {self.carry_participant.id})


    def test_participant_carry_document_associations_on_carry_plan_creation(self):
        document1 = self.create_carry_document()
        document2 = self.create_carry_document()
        self.assertEqual(CarryDocument.objects.count(), 2)

        document_ids = [document1.id, document2.id]
        carry_plan = self.create_carry_plan_with_carry_documents(document_ids)

        # verify if 2 documents are associated with a participant upon allocation
        self.add_allocation_in_carry_plan(carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 2)


    def test_participant_carry_documents(self):
        carry_document = self.create_carry_document()
        self.assertEqual(CarryDocument.objects.count(), 1)

        ParticipantCarryDocumentFactory(
            carry_document=carry_document,
            user=self.user,
            company=self.company,
            is_released=False
        )

        # test fetch all api
        url = reverse('carry-document-participants')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data[0]
        self.assertEqual(len(response.data), 1)
        self.assertEqual(data['status'], "Unreleased")
        self.assertEqual(data['user'], self.user.id)


    def test_participant_carry_documents_deletion(self):
        carry_document = self.create_carry_document()
        self.assertEqual(CarryDocument.objects.count(), 1)

        participant_document = ParticipantCarryDocumentFactory(
            carry_document=carry_document,
            user=self.user,
            company=self.company,
            is_released=False
        )

        url = reverse('carry-document-participants')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        url = reverse('carry-document-participants-retrieve-update', kwargs={'pk': participant_document.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        url = reverse('carry-document-participants')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        self.assertEqual(ParticipantCarryDocument.objects.count(), 0)
        self.assertEqual(ParticipantCarryDocument.include_deleted.count(), 1)

    @mock.patch('api.carry_pools.services.carry_notification.CarryEmailService.send_email')
    def test_investor_carry_documents_details(self, mock_send_email):
        document1 = self.create_carry_document()
        self.assertEqual(CarryDocument.objects.count(), 1)

        document_ids = [document1.id]
        carry_plan = self.create_carry_plan_with_carry_documents(document_ids)

        # verify if 2 documents are associated with a participant upon allocation
        self.add_allocation_in_carry_plan(carry_plan)
        self.assertEqual(ParticipantCarryDocument.objects.count(), 1)

        # release document to show up on investor side
        serializer = CarryDocumentParticipantSerializer(
            ParticipantCarryDocument.objects.first(),
            {'is_released': True},
            partial=True
        )
        if serializer.is_valid():
            serializer.save()

        self.assertEqual(ParticipantCarryDocument.objects.first().is_released, True)
        # verify notification is sent upon release
        mock_send_email.assert_called_once_with()

        self.client.force_authenticate(self.user)
        url = reverse('investor-carry-documents')
        response = self.client.get(url, HTTP_VIEW_AS_COMPANY_USER_ID=self.user.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data[0]
        self.assertEqual(data['user'], self.user.id)
        self.assertEqual(data['carry_document_name'], 'Test Carry Award Document')
        self.assertEqual(data['carry_plan_name'], carry_plan.name)
        self.assertEqual(data['bps'], '40')

        # check allocation id in participant carry document
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, carry_plan.company_id)
        allocation_id = carry_pool.allocations[0]['allocation_id']
        self.assertEqual(data['allocation_id'], allocation_id)

        # check carry participant name
        self.assertEqual(data['display_name'], self.carry_participant.get_full_name())


class CarryParticipantDocumentAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)

    def create_carry_document(self, carry_plan_ids=None):
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

    def test_participant_carry_document_create_retrieve_update(self):
        carry_document = self.create_carry_document()
        ParticipantCarryDocumentFactory(
            carry_document=carry_document,
            user=self.user,
            company=self.company
        )
        self.assertEqual(ParticipantCarryDocument.objects.count(), 1)

        # test get by id
        participant_document_id = ParticipantCarryDocument.objects.first().id

        url = reverse('carry-document-participant-get-update', kwargs={'pk': participant_document_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data['id'], participant_document_id)
        self.assertEqual(data['is_acknowledged'], False)

        # test update by id
        url = reverse('carry-document-participant-get-update', kwargs={'pk': participant_document_id})
        payload = {
            'is_acknowledged': True
        }
        response = self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['id'], participant_document_id)
        self.assertEqual(data['is_acknowledged'], True)

    def test_investor_pending_carry_documents_count(self):
        carry_document = self.create_carry_document()
        ParticipantCarryDocumentFactory(carry_document=carry_document, user=self.user, company=self.company)
        ParticipantCarryDocumentFactory(carry_document=carry_document, user=self.user, company=self.company)
        ParticipantCarryDocumentFactory(carry_document=carry_document, user=self.user, company=self.company)

        self.assertEqual(ParticipantCarryDocument.objects.count(), 3)

        url = reverse('pending-carry-documents-count')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn('count', data)
        self.assertEqual(data['count'], 3)
