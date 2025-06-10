from api.agreements.models import ApplicantAgreementDocument
from api.funds.models import DocumentFilter
from api.libs.docusign.services import DocumentSigningService
from api.tax_records.tests.factories import TaxRecordFactory, TaxFormFactory
from core.base_tests import BaseTestCase
from slugify import slugify

from api.admin_users.tests.factories import AdminUserFactory
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import WorkFlowFactory, UserFactory
from api.kyc_records.tests.factories import KYCRecordFactory, CardWorkFlowFactory
from api.kyc_records.models import KYCRecord
from api.workflows.models import Task
from api.cards.default.workflow_types import WorkflowTypes
from api.workflows.models import WorkFlow
from api.cards.models import Workflow as CardWorkFlow
from api.documents.models import FundDocument
from api.agreements.services.create_applicant_agreement_documents import CreateApplicantAgreementDocument
from api.agreements.services.application_data.get_application_values import GetApplicationValuesService
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService
from api.funds.services.gp_signing_service import GPSigningService


class TestGpSigningTasks(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.create_card_workflow(company=self.company)
        self.setup_fund(company=self.company)
        self.client.force_authenticate(self.user)
        self.create_currency()
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)

    def setup_application(self, kyc_record, tax_record=None):
        application = self.create_application(
            fund=self.fund,
            company_user=self.company_user,
            kyc_record=kyc_record,
            tax_record=tax_record
        )
        return application

    def create_fund_document(self, require_signature=True, require_gp_sign=False, signer=None):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund,
            require_signature=require_signature,
            require_gp_signature=require_gp_sign,
            gp_signer=signer
        )
        return fund_document

    def setup_kyc_record(self, user):
        name = "{} {}".format(WorkflowTypes.TRUST.value, self.company.name)
        workflow = CardWorkFlow.objects.get(
            slug=slugify(name),
            company=self.company,
        )
        kyc_record = KYCRecordFactory(company=self.company, user=user, workflow=workflow, company_user=self.company_user)
        return kyc_record

    def setup_tax_record(self, user):
        tax_record = TaxRecordFactory.create(company=self.company, user=user, us_holder=True)
        return tax_record

    def get_field(self, fields, field_id):
        for field in fields:
            if field['id'] == field_id:
                return field

        return {}

    def test_docu_sign_envelop_without_gp_signer(self):
        kyc_record = self.setup_kyc_record(user=self.user)
        application = self.setup_application(kyc_record=kyc_record)
        fund_document = self.create_fund_document()

        subscription_document_service = CreateApplicantAgreementDocument(application=application)
        subscription_document_service.create()
        envelop = subscription_document_service.get_envelope_payload(fund_agreement_document=fund_document)
        tabs = envelop['signers'][0]['data_tabs']["text_tabs"]

        # assert signer details
        self.assertEqual(len(envelop['signers']), 1)
        self.assertEqual(envelop['signers'][0]['role_name'], 'applicant')
        self.assertEqual(envelop['signers'][0]['signer_email'], application.user.email)
        # assert task details
        self.assertEqual(self.get_field(tabs, 'aml-kyc-first_name')['value'], kyc_record.first_name)
        self.assertEqual(self.get_field(tabs, 'aml-kyc-last_name')['value'], kyc_record.last_name)

    def test_docu_sign_envelop_with_gp_signer(self):
        kyc_record = self.setup_kyc_record(user=self.user)
        application = self.setup_application(kyc_record=kyc_record)
        fund_document = self.create_fund_document(require_gp_sign=True, signer=self.admin_user)

        subscription_document_service = CreateApplicantAgreementDocument(application=application)
        subscription_document_service.create()
        envelop = subscription_document_service.get_envelope_payload(fund_agreement_document=fund_document)
        tabs = envelop['signers'][0]['data_tabs']["text_tabs"]

        application_document = ApplicantAgreementDocument.objects.get(
            application=application,
            agreement_document=fund_document
        )
        # assert signer details
        self.assertEqual(len(envelop['signers']), 2)
        self.assertEqual(envelop['signers'][0]['role_name'], 'applicant')
        self.assertEqual(envelop['signers'][0]['signer_email'], application.user.email)
        self.assertEqual(envelop['signers'][1]['role_name'], 'gp_signer')
        self.assertEqual(envelop['signers'][1]['signer_email'], f'gp-signers+{application_document.id}@navable.com')
        # assert tab details
        self.assertEqual(self.get_field(tabs, 'aml-kyc-first_name')['value'], kyc_record.first_name)
        self.assertEqual(self.get_field(tabs, 'aml-kyc-last_name')['value'], kyc_record.last_name)
        self.assertEqual(self.get_field(tabs, 'fund-gp_signer_name')['value'],
                         f'{self.admin_user.user.first_name} {self.admin_user.user.last_name}'.strip())
        self.assertEqual(self.get_field(tabs, 'fund-gp_signer_title')['value'], self.admin_user.title)

    def test_create_envelope_with_gp_signer(self):
        kyc_record = self.setup_kyc_record(user=self.user)
        tax_record = self.setup_tax_record(user=self.user)
        application = self.setup_application(kyc_record=kyc_record, tax_record=tax_record)
        fund_document = self.create_fund_document(require_gp_sign=True, signer=self.admin_user)

        code = """
            set aml-kyc-citizenship_country = "United Kingdom"
            if aml-kyc-citizenship_country == "United Kingdom" {
              set uk-aml-kyc-full_name = fields[aml-kyc-full_name]
              set uk-application-share_class = fields[application-share_class]
              set uk-application-vehicle = fields[application-vehicle]
              set uk-applicant-investor_signing_date = fields[applicant-investor_signing_date]
              set uk-aml-kyc-us_person_sign = fields[aml-kyc-us_person_sign]
              set fund-gp_signer_date-uk = fields[fund-gp_signer_date]
              require fund-gp_signer_sign-uk
              require fund-gp_signer_date-uk
            }
        """
        fund = application.fund
        fund.document_filter = DocumentFilter.objects.create(code=code, fund=fund)
        fund.save()

        subscription_document_service = CreateApplicantAgreementDocument(application=application)
        subscription_document_service.create()
        envelope_args = subscription_document_service.get_envelope_payload(fund_agreement_document=fund_document)
        recipients = DocumentSigningService.get_recipients(envelope_args=envelope_args)
        self.assertIsNotNone(recipients)
