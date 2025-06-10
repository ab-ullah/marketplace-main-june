from django.conf import settings
from django.db.transaction import atomic
from rest_framework.exceptions import PermissionDenied

from api.applications.models import Application, UserApplicationState
from api.funds.models import FundDocumentResponse
from api.kyc_records.models import KYCRecord
from api.users.models import RetailUser
from api.workflows.models import WorkFlow


class ApplicationResetService:
    def __init__(self, application: Application, user: RetailUser):
        self.application = application
        self.user = user
        self.check_for_permission()

    def check_for_permission(self):
        if settings.APP_ENVIRONMENT not in settings.APPLICATION_RESET_ENVIRONMENTS:
            raise PermissionDenied

        user = self.user
        if not user.has_full_access():
            raise PermissionDenied

    def delete_eligibility_response(self):
        eligibility_response = self.application.eligibility_response
        if not eligibility_response:
            return

        eligibility_response.deleted = True
        eligibility_response.save(update_fields=['deleted'])

    def delete_investment_amount(self):
        investment_amount = None
        if self.application.investment_amount:
            investment_amount = self.application.investment_amount
        elif self.application.eligibility_response:
            investment_amount = self.application.eligibility_response.investment_amount

        if investment_amount:
            investment_amount.deleted = True
            investment_amount.save(update_fields=['deleted'])

    def delete_banking_details(self):
        payment_detail = self.application.payment_detail
        if not payment_detail:
            return
        payment_detail.deleted = True
        payment_detail.save(update_fields=['deleted'])

    @staticmethod
    def delete_workflow(workflow: WorkFlow):
        workflow.workflow_tasks.update(deleted=True)
        workflow.deleted = True
        workflow.save(update_fields=['deleted'])

    def delete_application_workflow(self):
        if not self.application.workflow:
            return
        parent_workflow = self.application.workflow
        for workflow in parent_workflow.child_workflows.all():
            self.delete_workflow(workflow=workflow)
        self.delete_workflow(workflow=parent_workflow)

    def delete_application_company_documents(self):
        self.application.application_company_documents.update(deleted=True)

    def delete_agreements(self):
        self.application.application_agreements.update(deleted=True)

    def reset_position(self):
        UserApplicationState.objects.filter(
            user=self.application.user,
            fund=self.application.fund
        ).delete()

    def delete_kyc_record(self):
        application = self.application
        KYCRecord.objects.filter(
            user=application.user,
            company=application.company,
            id=application.kyc_record_id
        ).update(deleted=True)

    def reset_fund_documents(self):
        company_user = self.application.get_company_user()
        FundDocumentResponse.objects.filter(
            fund=self.application.fund,
            user=company_user
        ).update(deleted=True)

    def delete_tax_record(self):
        tax_record = self.application.tax_record
        if tax_record:
            tax_record.deleted = True
            tax_record.save(update_fields=['deleted'])

    def update_application_fields(self):
        application_defaults = {
            'tax_record': None,
            'kyc_record': None,
            'eligibility_response': None,
            'investment_amount': None,
            'status': Application.Status.CREATED.value,
            'max_leverage_ratio': None,
            'payment_detail': None,
            'workflow': None,
            'share_class': None,
            'vehicle': None,
            'investor': None,
            'is_application_updated': False,
            'has_custom_equity': False,
            'has_custom_leverage': False,
            'has_custom_total_investment': False,
            'update_comment': None,
            'withdrawn_comment': None,
            'is_data_protection_policy_agreed': False,
            'defaults_from_fund_file': {},
            'allocation_approval_email_sent': False,
            'has_submitted_banking_details': False,
            'restricted_time_period': None,
            'restricted_geographic_area': None,
            'gp_signing_completed_at': None,
            'region': None,
            'state': None,
            'aml_kyc_tax_email_sent': False
        }
        for attr, value in application_defaults.items():
            setattr(self.application, attr, value)
        self.application.save()

    def reset(self):
        self.check_for_permission()
        self.application.state = None
        self.application.save()
        with atomic():
            self.delete_application_workflow()
            self.delete_investment_amount()
            self.delete_eligibility_response()
            self.delete_banking_details()
            self.delete_application_company_documents()
            self.delete_agreements()
            self.reset_position()
            self.delete_kyc_record()
            self.delete_tax_record()
            self.reset_fund_documents()
            self.update_application_fields()
