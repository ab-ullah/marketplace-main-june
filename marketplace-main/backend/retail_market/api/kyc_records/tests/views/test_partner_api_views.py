import json
import uuid

from django.urls import reverse
from rest_framework import status
from slugify import slugify

from api.cards.default.workflow_types import WorkflowTypes
from api.cards.models import Workflow as CardWorkFlow
from api.constants.kyc_investor_types import KYCInvestorType
from api.documents.models import KYCDocument
from api.documents.tests.factories import DocumentFactory
from api.kyc_records.models import KYCRecord
from api.kyc_records.tests.factories import KYCRecordFactory, CardWorkFlowFactory
from api.partners.tests.factories import UserFactory, CompanyUserFactory
from core.base_tests import BaseTestCase


class KYCRecordsPartnerAPITestCase(BaseTestCase):
    def setUp(self) -> None:
        self.create_user()
        self.create_card_workflow(self.company)
        self.client.force_authenticate(self.admin_user.user)
        self.setup_fund(company=self.company)

    def test_kyc_record_list_api(self):
        user = UserFactory()
        company_user = CompanyUserFactory(company=self.company, user=user)
        name = "{} {}".format(WorkflowTypes.PRIVATE_COMPANY.value, self.company.name)
        workflow = CardWorkFlowFactory(
            name=name,
            slug=slugify(name),
            company=self.company,
            type=CardWorkFlow.FLOW_TYPES.KYC.value
        )
        kyc_record_company = KYCRecordFactory(
            company=self.company,
            user=user,
            workflow=workflow,
            kyc_investor_type=KYCInvestorType.PRIVATE_COMPANY.value,
            company_user=company_user
        )
        kyc_record_individual = KYCRecordFactory(
            company=self.company,
            user=user,
            workflow=workflow,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
            company_user=company_user
        )

        kyc_document = KYCDocument.objects.create(
            kyc_record=kyc_record_individual,
            document=DocumentFactory(),
            partner_id=uuid.uuid4().hex,
            kyc_record_file_id='id_doc_image'
        )
        kyc_record_participant = KYCRecordFactory(
            company=self.company,
            user=user,
            workflow=workflow,
            kyc_entity=kyc_record_company,
            kyc_investor_type=KYCInvestorType.PARTICIPANT.value,
            company_user=company_user
        )

        url = reverse('user-kyc-records-list-api-view', kwargs={'user_id': user.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['id'], kyc_record_individual.id)
        self.assertEqual(len(data[0]['kyc_participants']), 0)
        self.assertEqual(len(data[0]['kyc_documents']), 1)
        self.assertEqual(data[0]['kyc_documents'][0]['id'], kyc_document.id)
        self.assertEqual(data[1]['id'], kyc_record_company.id)
        self.assertEqual(len(data[1]['kyc_participants']), 1)
        self.assertEqual(data[1]['kyc_participants'][0]['id'], kyc_record_participant.id)
        self.assertEqual(len(data[1]['kyc_documents']), 0)

    def test_kyc_record_create_view(self):
        user = UserFactory()
        CompanyUserFactory(user=user, company=self.company)

        url = reverse('user-kyc-records-create-api-view')
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "home_address": "House 17A Street 7 khan village",
            "home_city": "Multan",
            "home_region": "Pun",
            "job_title": "SE",
            "job_band": "Portfolio and Fund Investment 1",
            "pollitically_exposed_person": False,
            "user": user.id
        }
        response = self.client.post(url, data=payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(KYCRecord.objects.count(), 1)
        kyc_record = KYCRecord.objects.get()
        for k, v in payload.items():
            if k == 'user':
                self.assertEqual(v, getattr(kyc_record, k).id)
            else:
                self.assertEqual(v, getattr(kyc_record, k))

