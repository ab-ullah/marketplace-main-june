import uuid

from rest_framework.reverse import reverse

from api.applications.services.pin_kyc_version import PinKYCVersion
from api.applications.tests.factories import ApplicationFactory, FundFactory
from api.cards.config.company_specific_workflows import get_workflow_creator_for_company
from api.cards.models import Workflow as CardWorkFlow
from api.companies.models import Company, CompanyUser
from api.constants.kyc_investor_types import KYCInvestorType
from api.documents.models import KYCDocument
from api.documents.tests.factories import DocumentFactory
from api.kyc_records.models import KYCRecord
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class KYCPinningUnitTestCase(BaseTestCase):
    def setUp(self) -> None:
        self.company = Company.objects.get(name='sidecar')
        self.create_countries()
        kyc_workflow_creator = get_workflow_creator_for_company(company=self.company)
        kyc_workflow_creator(company=self.company)
        self.user = UserFactory()
        self.client.force_authenticate(self.user)

    def test_kyc_pinning(self):
        company = self.company
        company_user = CompanyUser.objects.create(company=company, user=self.user, partner_id=uuid.uuid4().hex)
        workflow = CardWorkFlow.objects.get(company=company, slug__icontains='kyc-aml-corporate-entity')
        kyc = KYCRecordFactory(
            company=company,
            workflow=workflow,
            user=self.user,
            first_name='original_first_name',
            last_name='original_last_name',
            company_user=company_user,
            kyc_investor_type=KYCInvestorType.PRIVATE_COMPANY.value
        )  # type: KYCRecord

        participant = KYCRecordFactory(
            kyc_investor_type=KYCInvestorType.PARTICIPANT.value,
            first_name='participant_first_name',
            last_name='participant_last_name',
            kyc_entity=kyc,
            company=company,
            workflow=workflow,
        )

        KYCDocument.objects.create(
            kyc_record=participant,
            document=DocumentFactory(),
            partner_id=uuid.uuid4().hex,
            kyc_record_file_id='id_doc_image'
        )

        KYCDocument.objects.create(
            kyc_record=kyc,
            document=DocumentFactory(),
            partner_id=uuid.uuid4().hex,
            kyc_record_file_id='id_doc_image'
        )

        application = ApplicationFactory(
            company=self.company,
            user=self.user,
            kyc_record=kyc,
            fund=FundFactory(company=self.company)
        )

        PinKYCVersion(
            application=application
        ).pin()

        KYCDocument.objects.create(
            kyc_record=kyc,
            document=DocumentFactory(),
            partner_id=uuid.uuid4().hex,
            kyc_record_file_id='id_doc_image'
        )

        participant_2 = KYCRecordFactory(
            kyc_investor_type=KYCInvestorType.PARTICIPANT.value,
            first_name='participant_first_2',
            last_name='participant_last_2',
            kyc_entity=kyc,
            company=company,
            workflow=workflow,
        )

        KYCDocument.objects.create(
            kyc_record=participant,
            document=DocumentFactory(),
            partner_id=uuid.uuid4().hex,
            kyc_record_file_id='id_doc_image'
        )

        participant.first_name = 'first_update'
        participant.last_name = 'last_update'
        participant.save()

        kyc.first_name = 'john'
        kyc.last_name = 'smith'
        kyc.save()

        url = reverse('kyc-records-get-uuid', kwargs={'uuid': kyc.uuid}, )
        url = f'{url}?application_id={application.id}'
        response = self.client.get(url)
        data = response.data

        self.assertEqual(data['first_name'], 'original_first_name')
        self.assertEqual(data['last_name'], 'original_last_name')
        self.assertEqual(len(data['kyc_participants']), 1)
        self.assertEqual(data['kyc_participants'][0]['first_name'], 'participant_first_name')
        self.assertEqual(data['kyc_participants'][0]['last_name'], 'participant_last_name')

        url = reverse('kyc-document-list-view', kwargs={'kyc_record_id': kyc.id}, )
        url = f'{url}?application_id={application.id}'
        response = self.client.get(url)
        documents_data = response.data
        self.assertEqual(len(documents_data), 1)

        url = reverse('kyc-record-create-participant-view', kwargs={
            'wf_slug': workflow.slug,
            'kyc_entity_id': kyc.id,
            'kyc_record_id': participant.id,
        }, )
        url = f'{url}?application_id={application.id}'
        response = self.client.get(url)
        documents_data = response.data
        self.assertEqual(len(documents_data), 1)
