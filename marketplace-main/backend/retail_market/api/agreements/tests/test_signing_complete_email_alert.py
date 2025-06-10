import uuid
from unittest import mock

from api.admin_users.tests.factories import AdminUserFactory
from api.agreements.models import ApplicantAgreementDocument
from api.agreements.services.agreement_review_service import AgreementReview
from api.applications.tests.factories import ApplicationFactory
from api.documents.models import FundDocument
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import WorkFlowFactory, CompanyProfileFactory
from core.base_tests import BaseTestCase


class TestSigningCompletionTask(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.setup_fund(company=self.company)
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)
        self.workflow = WorkFlowFactory(company=self.company)
        self.application = self.get_application()
        CompanyProfileFactory(company=self.company)

    def get_application(self):
        return ApplicationFactory(company=self.company, user=self.user, fund=self.fund)

    def create_fund_document(self, require_gp_sign=False, signer=None):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund,
            require_signature=True,
            require_gp_signature=require_gp_sign,
            gp_signer=signer
        )
        return fund_document

    def create_applicant_document(self, fund_document):
        return ApplicantAgreementDocument.objects.create(
            agreement_document=fund_document,
            application=self.application,
            envelope_id=uuid.uuid4().hex
        )

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_agreement_email_triggered_on_completion(self, mock_email):
        fund_document_1 = self.create_fund_document()
        fund_document_2 = self.create_fund_document()
        applicant_document_1 = self.create_applicant_document(fund_document=fund_document_1)
        applicant_document_2 = self.create_applicant_document(fund_document=fund_document_2)

        applicant_document_1.completed = True
        applicant_document_1.save()

        AgreementReview(application=applicant_document_1.application).send_signing_completion_email()
        self.assertEqual(mock_email.call_count, 0)

        applicant_document_2.completed = True
        applicant_document_2.save()

        AgreementReview(application=applicant_document_2.application).send_signing_completion_email()
        self.assertEqual(mock_email.call_count, 1)
