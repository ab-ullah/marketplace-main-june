import json
from datetime import timedelta
from io import StringIO

from django.contrib.auth.models import Group
from django.core.management import call_command
from django.utils.timezone import now

from api.agreements.models import ApplicantAgreementDocument
from api.applications.models import ApplicationCompanyDocument, Application
from api.applications.tests.factories import ApplicationFactory
from api.applications.tests.services.test_applicant_company_document_query import create_document_path
from api.backup.tests.constants import COMPANY_DOCUMENT_CONTENT, SUPPORTING_DOCUMENT_CONTENT, KYC_DOCUMENT_CONTENT, \
    TAX_DOCUMENT_CONTENT, CERTIFICATE_CONTENT, SIGNED_COMPANY_DOCUMENT_CONTENT, SIGNED_POWER_OF_ATTORNEY_CONTENT, \
    FUND_DOCUMENT_CONTENT, SIGNED_FUND_DOCUMENT_CONTENT, FUND_CERTIFICATE_DOCUMENT_CONTENT
from api.comments.models import ApplicationComment, ModuleChoices
from api.companies.models import CompanyDocument, CompanyUser
from api.documents.models import ApplicationSupportingDocument, KYCDocument, FundDocument
from api.documents.tests.factories import DocumentFactory
from api.eligibility_criteria.tests.factories import InvestmentAmountFactory, EligibilityCriteriaBlockResponseFactory, \
    FundEligibilityCriteriaResponseFactory
from api.geographics.models import Country
from api.investors.models import Investor
from api.kyc_records.models import KYCRiskEvaluation
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.constants import KycTaxDocumentTypeEnum
from api.partners.tests.factories import InvestorFactory, WorkFlowFactory
from api.payments.tests.factories import PaymentDetailFactory
from api.tax_records.tests.factories import TaxRecordFactory, TaxDocumentFactory
from api.users.constants import ALLOCATION_REVIEWER, AGREEMENT_REVIEWER, EXTERNAL_REVIEWER, \
    FINANCIAL_ELIGIBILITY_REVIEWER
from api.workflows.models import WorkFlow, Task
from api.workflows.tests.factories import CompanyUserTaskFactory
from core.base_tests import BaseTestCase


class CompleteApplication(BaseTestCase):

    def setup_complete_application(self):
        # document paths
        self.company_document_path = create_document_path(COMPANY_DOCUMENT_CONTENT)
        self.supporting_document_path = create_document_path(SUPPORTING_DOCUMENT_CONTENT)
        self.kyc_document_path = create_document_path(KYC_DOCUMENT_CONTENT)
        self.tax_document_path = create_document_path(TAX_DOCUMENT_CONTENT)
        self.signed_document_path = create_document_path(SIGNED_COMPANY_DOCUMENT_CONTENT)
        self.certificate_path = create_document_path(CERTIFICATE_CONTENT)
        self.signed_power_of_attorney_path = create_document_path(SIGNED_POWER_OF_ATTORNEY_CONTENT)
        self.fund_document_path = create_document_path(FUND_DOCUMENT_CONTENT)
        self.signed_fund_document_path = create_document_path(SIGNED_FUND_DOCUMENT_CONTENT)
        self.fund_certificate_document_path = create_document_path(FUND_CERTIFICATE_DOCUMENT_CONTENT)

        # document entities
        company_document = DocumentFactory(document_path=self.company_document_path, title="my_company_document",
                                           extension="pdf")
        self.supporting_document = DocumentFactory(document_path=self.supporting_document_path,
                                                   title="my_supporting_document", extension="pdf")
        kyc_document = DocumentFactory(document_path=self.kyc_document_path, title="my_kyc_document", extension="pdf")
        tax_document = DocumentFactory(document_path=self.tax_document_path, title="my_tax_document", extension="pdf")
        fund_document = DocumentFactory(document_path=self.fund_document_path, title="my_fund_document",
                                        extension="pdf")
        self.fund_document = FundDocument.objects.create(document=fund_document, fund=self.fund, require_signature=True,
                                                         require_gp_signature=True)

        self.signed_company_document = DocumentFactory(document_path=self.signed_document_path,
                                                       title="my_signed_company_document", extension="pdf")
        self.signed_power_of_attorney = DocumentFactory(document_path=self.signed_power_of_attorney_path,
                                                        title="my_signed_power_of_attorney", extension="pdf")
        self.certificate = DocumentFactory(document_path=self.certificate_path, title="my_certificate", extension="pdf")
        self.company_document = CompanyDocument.objects.create(
            company=self.company,
            document=company_document,
            name='Dummy Company Document',
            description='Dummy Company Document',
            required_once=True,
            require_wet_signature=True,
            require_gp_signature=True,
        )
        self.signed_applicant_agreement_document = DocumentFactory(document_path=self.signed_fund_document_path, title="my_signed_fund_document", extension="pdf")
        self.applicant_agreement_certificate_document = DocumentFactory(document_path=self.fund_certificate_document_path, title="my_fund_certificate_document", extension="pdf")

        self.tax_record = TaxRecordFactory.create(user=self.user, company=self.company)
        company_user = CompanyUser.objects.filter(company=self.company, user=self.user).first()
        self.country = Country.objects.get(iso_code='US')

        self.kyc_record = KYCRecordFactory.create(user=self.user, company=self.company, company_user=company_user,
                                                  investor_location=self.country)
        self.kyc_risk = KYCRiskEvaluation.objects.create(risk_value=1, kyc_record=self.kyc_record,
                                                         reviewer=self.admin_user)
        self.tax_document = TaxDocumentFactory.create(document=tax_document, tax_record=self.tax_record,
                                                      owner=self.user)
        self.kyc_document = KYCDocument.objects.create(
            document=kyc_document,
            kyc_record=self.kyc_record,
            kyc_record_file_id=KycTaxDocumentTypeEnum.LIST_OF_AUTHORIZED_SIGNATORIES.value
        )
        self.investor = InvestorFactory(vehicle_type=Investor.VehicleTypeChoice.ENTITY)
        self.investment_amount = InvestmentAmountFactory()
        self.payment_detail_1 = PaymentDetailFactory(
            currency=self.currency,
            user=self.user,
            bank_country=self.country
        )
        self.application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user,
            tax_record=self.tax_record,
            kyc_record=self.kyc_record,
            investor=self.investor,
            investment_amount=self.investment_amount,
            payment_detail=self.payment_detail_1,
            status=Application.Status.SUBMITTED,
            created_at=now() - timedelta(hours=1)
        )
        self.application.status = Application.Status.APPROVED
        self.application.save()

        self.comment_1 = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail_1.id,
            question_identifier='postal_code',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

        self.payment_detail_2 = PaymentDetailFactory(
            currency=self.currency,
            user=self.user,
            bank_country=self.country
        )
        self.comment_2 = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail_2.id,
            question_identifier='postal_code',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

        self.application_company_document = ApplicationCompanyDocument.objects.create(
            application=self.application,
            company_document=self.company_document,
            completed=True,
            gp_signing_complete=True,
            signed_document=self.signed_company_document,
            certificate=self.certificate
        )

        self.application_supporting_document = ApplicationSupportingDocument.objects.create(
            application=self.application,
            document=self.supporting_document
        )
        self.company_user, _ = CompanyUser.objects.get_or_create(company=self.company, user=self.user,
                                                                 defaults={'partner_id': self.fund.partner_id})
        self.company_user.power_of_attorney_document = self.signed_power_of_attorney
        self.company_user.save()
        self.applicant_agreement_document = ApplicantAgreementDocument.objects.create(agreement_document=self.fund_document, application=self.application, signed_document=self.signed_applicant_agreement_document, certificate=self.applicant_agreement_certificate_document, gp_signing_complete=True)

        parent_workflow = WorkFlowFactory(
            fund=self.fund,
            company=self.company,
            module=WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        self.application.workflow = parent_workflow

        self.create_eligibility_criteria_user_response(self.company_user)
        self.fund_eligibility_criteria_response.is_approved = True
        self.fund_eligibility_criteria_response.save()
        self.application.eligibility_response = self.fund_eligibility_criteria_response
        self.application.save()
        aml_kyc_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        aml_kyc_group = Group.objects.filter(name=FINANCIAL_ELIGIBILITY_REVIEWER).first()
        aml_kyc_task = CompanyUserTaskFactory(
            workflow=aml_kyc_workflow,
            assigned_to_group=aml_kyc_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        eligibility_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )

        aml_kyc_group = Group.objects.filter(name=FINANCIAL_ELIGIBILITY_REVIEWER).first()
        eligibility_task = CompanyUserTaskFactory(
            workflow=eligibility_workflow,
            assigned_to_group=aml_kyc_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        tax_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        tax_record_group = Group.objects.filter(name=EXTERNAL_REVIEWER).first()
        tax_task = CompanyUserTaskFactory(
            workflow=tax_workflow,
            assigned_to_group=tax_record_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        agreement_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        agreements_group = Group.objects.filter(name=AGREEMENT_REVIEWER).first()
        agreement_task = CompanyUserTaskFactory(
            workflow=agreement_workflow,
            assigned_to_group=agreements_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        allocation_parent_workflow = WorkFlowFactory(
            company=self.company,
            fund=self.fund,
            module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value,
        )

        allocation_workflow = WorkFlowFactory(
            company=self.company,
            parent=allocation_parent_workflow,
            fund=self.fund,
            module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value,
        )
        allocation_group = Group.objects.filter(name=ALLOCATION_REVIEWER).first()
        allocation_task = CompanyUserTaskFactory(
            workflow=allocation_workflow,
            assigned_to_group=allocation_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        aml_kyc_workflow.is_completed = True
        aml_kyc_workflow.save()

        tax_workflow.is_completed = True
        tax_workflow.save()

        agreement_workflow.is_completed = True
        agreement_workflow.save()

        self.application.status = Application.Status.APPROVED.value
        self.application.save()


class BackupInvestorApplicationTest(CompleteApplication):

    def setUp(self):
        self.create_user()
        self.create_currency()
        self.create_countries()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.create_card_workflow(self.company)
        self.create_eligibility_criteria_for_fund()
        self.setup_complete_application()

    def call_command(self, *args, **kwargs):
        out = StringIO()
        call_command(
            "backup_fund_applications",
            *args,
            stdout=out,
            stderr=StringIO(),
            **kwargs,
        )
        return out.getvalue()

    def test_regular_backup_run(self):
        out = self.call_command(self.fund.id)
        decoded = json.loads(out)
        self.assertEqual(decoded['message'], "Successful")
