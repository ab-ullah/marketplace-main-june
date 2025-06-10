from django.template.loader import render_to_string
from django.utils import timezone
from django_q.tasks import async_task

from api.agreements.services.agreement_review_service import AgreementReview
from api.applications.models import Application, UserApplicationState
from api.applications.services.allocation_review_service import \
    AllocationReviewService
from api.applications.utils import update_or_create_user_application_state
from api.capital_calls.models import FundCapitalCall
from api.capital_calls.services.create_notifications import \
    CreateCapitalCallNotification
from api.carry_pools.models import CarryPlan
from api.carry_pools.services.workflow import CarryWorkflowService
from api.comments.models import ModuleChoices
from api.distribution_notices.models import DistributionNotice
from api.distribution_notices.services.create_distribution_notice_notifications import \
    CreateDistributionNoticeNotification
from api.eligibility_criteria.models import FundEligibilityCriteria
from api.funds.services.all_eligibility_decision_taken import \
    AllEligibilityDecisionTaken
from api.kyc_records.models import KYCStatuses
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import (get_agreements_url,
                                 get_aml_kyc_url, get_bank_details_url,
                                 get_fund_application_url, get_logo_url, get_start_page_url)
from api.libs.utils.user_name import get_display_name
from api.workflows.models import Task, WorkFlow


class WorkFlowApprovalService:
    @staticmethod
    def are_workflow_tasks_approved(workflow: WorkFlow):
        if workflow.workflow_tasks.count() == 0:
            return False

        has_non_approved_review_tasks = workflow.workflow_tasks.filter(
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value,
        ).exclude(
            status=Task.StatusChoice.APPROVED.value
        ).exists()
        return not has_non_approved_review_tasks

    @staticmethod
    def are_child_workflows_completed(workflow: WorkFlow):
        return not workflow.child_workflows.filter(is_completed=False).exists()

    @staticmethod
    def create_publish_task(workflow):
        Task.objects.get_or_create(
            workflow_id=workflow.id,
            assigned_to=workflow.created_by,
            requestor=workflow.created_by,
            task_type=Task.TaskTypeChoice.PUBLISH.value
        )

    @staticmethod
    def approve_eligibility_response(workflow):
        workflow.eligibility_response.is_approved = True
        workflow.eligibility_response.save()

    @staticmethod
    def approve_aml_kyc(workflow):
        workflow.workflow_kyc_record.status = KYCStatuses.APPROVED.value
        workflow.workflow_kyc_record.save()

    def get_post_approval_function(self, workflow):
        if workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY:
            if workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.REVIEW:
                if hasattr(workflow, 'workflow_eligibility_criteria'):
                    eligibility_criteria = workflow.workflow_eligibility_criteria
                    eligibility_criteria.status = FundEligibilityCriteria.CriteriaStatusChoice.APPROVED.value
                    eligibility_criteria.save()

            if workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE:
                return self.approve_eligibility_response

        # TODO: We have decoupled kyc from workflows, since one kyc can be used with multiple
        #  application should we add appove/decline in KYC?
        # if workflow.module == WorkFlow.WorkFlowModuleChoices.AML_KYC:
        #     return self.approve_aml_kyc

    def check_parent_workflow_completion(self, workflow: WorkFlow):
        if not workflow.parent:
            return

        if self.are_child_workflows_completed(workflow=workflow.parent):
            self.mark_workflow_as_completed(workflow=workflow.parent)

    def mark_workflow_as_completed(self, workflow):
        if not workflow.is_completed:
            workflow.is_completed = True
            workflow.save()

        self.check_parent_workflow_completion(workflow=workflow)

    @staticmethod
    def get_next_step_url(workflow: WorkFlow):
        if not (workflow.parent and workflow.parent.fund):
            return None

        fund = workflow.parent.fund
        if fund.skip_tax:
            is_aml_kyc_tax_complete = WorkFlowApprovalService.aml_kyc_approved(parent_workflow=workflow.parent)
        else:
            is_aml_kyc_tax_complete = WorkFlowApprovalService.aml_kyc_approved(parent_workflow=workflow.parent) and \
                                      WorkFlowApprovalService.tax_approved(parent_workflow=workflow.parent)
        is_bank_detail_added = WorkFlowApprovalService.banking_details_added(parent_workflow=workflow.parent)
        if workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value:
            return get_aml_kyc_url(fund_external_id=fund.external_id)

        if is_aml_kyc_tax_complete and is_bank_detail_added:
            return get_agreements_url(fund_external_id=fund.external_id)
        elif is_aml_kyc_tax_complete and not is_bank_detail_added:
            return get_bank_details_url(fund_external_id=fund.external_id)

    @staticmethod
    def aml_kyc_approved(parent_workflow: WorkFlow):
        # if hasattr(parent_workflow, 'application'):
        #     if parent_workflow.application.kyc_record.is_auto_approved():
        #         return True
        return parent_workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            is_completed=True
        ).exists()

    @staticmethod
    def pre_document_approved(parent_workflow: WorkFlow):
        return parent_workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value,
            is_completed=True
        ).exists()

    @staticmethod
    def tax_approved(parent_workflow: WorkFlow):
        if parent_workflow.fund and parent_workflow.fund.skip_tax:
            return True

        return hasattr(
            parent_workflow,
            'application'
        ) and parent_workflow.application.tax_record is not None and parent_workflow.application.tax_record.is_approved

    @staticmethod
    def banking_details_added(parent_workflow: WorkFlow):
        return hasattr(
            parent_workflow,
            'application'
        ) and parent_workflow.application.payment_detail

    def process(self, workflow: WorkFlow):
        if self.are_workflow_tasks_approved(workflow=workflow):
            self.mark_workflow_as_completed(workflow=workflow)
            post_approval_function = self.get_post_approval_function(workflow=workflow)
            workflow.is_completed = True
            workflow.save()
            if post_approval_function:
                post_approval_function(workflow=workflow)

            if workflow.module == WorkFlow.WorkFlowModuleChoices.CAPITAL_CALL:
                capital_call = FundCapitalCall.objects.get(workflow=workflow)
                capital_call.approved_at = timezone.now()
                capital_call.save()

                CreateCapitalCallNotification(capital_call=capital_call).process()

            if workflow.module == WorkFlow.WorkFlowModuleChoices.DISTRIBUTION_NOTICE:
                distribution_notice = DistributionNotice.objects.get(workflow=workflow)
                distribution_notice.approved_at = timezone.now()
                distribution_notice.save()

                CreateDistributionNoticeNotification(distribution_notice=distribution_notice).process()

            if workflow.module == WorkFlow.WorkFlowModuleChoices.CARRY_PLAN:
                carry_plan = CarryPlan.objects.get(workflow=workflow)
                CarryWorkflowService(carry_plan=carry_plan).process()


            if workflow.parent is not None:
                if workflow.parent and hasattr(workflow.parent, 'application'):
                    if workflow.module == WorkFlow.WorkFlowModuleChoices.AML_KYC.value:
                        kyc_record = workflow.parent.application.kyc_record
                        kyc_record.approved = True
                        kyc_record.save()

                if workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value:
                    self.start_allocation_review(workflow)
                elif workflow.module in [
                    WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
                    WorkFlow.WorkFlowModuleChoices.AML_KYC.value
                ] and self.aml_kyc_approved(parent_workflow=workflow.parent) \
                        and self.tax_approved(parent_workflow=workflow.parent):
                    if workflow.parent and hasattr(workflow.parent, 'application'):
                        fund = workflow.parent.application.fund
                        if not fund.has_pre_document_signing_approval():
                            self.async_send_aml_kyc_tax_approval_email(workflow.parent.application.id)
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.INTERNAL_TAX_REVIEW.value and hasattr(
                        workflow.parent, 'application'):
                    AgreementReview(application=workflow.parent.application).process()

                if workflow.module in [
                    WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
                    WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value,
                ]:
                    if workflow.parent and hasattr(workflow.parent, 'application'):
                        fund = workflow.parent.application.fund
                        if fund.has_pre_document_signing_approval():
                            if self.aml_kyc_approved(parent_workflow=workflow.parent) and self.pre_document_approved(parent_workflow=workflow.parent):
                                self.send_aml_kyc_pre_document_approved(workflow.parent.application.id)



    def process_gp_signing_workflow(self, workflow: WorkFlow, skip_email=False):
        if self.are_workflow_tasks_approved(workflow=workflow):
            self.mark_workflow_as_completed(workflow=workflow)
            workflow.is_completed = True
            workflow.save(update_fields=["is_completed"])

            if workflow.parent and not skip_email:
                self.async_gp_signing_approval_email(workflow.parent.application.id)

    @staticmethod
    def update_application_state(workflow: WorkFlow):
        if not (workflow.parent and workflow.parent.fund):
            return
        user = workflow.associated_user.user
        fund = workflow.parent.fund
        next_module = None
        if workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value:
            next_module = ModuleChoices.KYC_RECORD.value

        if workflow.module == WorkFlow.WorkFlowModuleChoices.AML_KYC.value:
            next_module = ModuleChoices.AGREEMENT.value

        if next_module:
            update_or_create_user_application_state(
                user=user,
                fund=fund,
                values={
                    'module': next_module,
                    'last_position': ''
                }
            )

    @staticmethod
    def send_approval_email(workflow_id: int):
        workflow = WorkFlow.objects.get(id=workflow_id)
        fund = None
        subject = "Action Required"
        program_name = ""
        email_service = SendEmailService()
        next_step_url = WorkFlowApprovalService.get_next_step_url(workflow=workflow)
        WorkFlowApprovalService.update_application_state(workflow=workflow)
        if workflow.parent:
            fund = workflow.parent.fund

        if fund:
            subject = "{} Action Required".format(fund.name)

            if fund.company and fund.company.company_profile:
                program_name = fund.company.company_profile.program_name

        body = render_to_string('email/workflow_approval_email.html', {
            'next_step_url': next_step_url,
            'logo_url': get_logo_url(company=fund.company),
            'program_name': program_name,
            'fund_name': fund.name if fund else None
        }).strip()
        email_service.send_html_email(
            to=workflow.associated_user.user.email,
            subject=subject,
            body=body
        )

    @staticmethod
    def send_application_approved(application_id: int):
        application = Application.objects.get(id=application_id)
        fund = application.fund
        subject = f"{fund.name} Application Approved"

        start_page_url = get_start_page_url(company=application.company)
        body = render_to_string('email/application_approval_email.html', {
            'logo_url': get_logo_url(company=fund.company),
            'user_name': get_display_name(application.user),
            'fund_name': fund.name,
            'next_step_url': start_page_url,
            'program_name': application.company.company_profile.program_name
        }).strip()
        email_service = SendEmailService()
        email_service.send_html_email(
            to=application.user.email,
            subject=subject,
            body=body
        )

    @staticmethod
    def send_aml_kyc_tax_approved(application_id: int):
        application = Application.objects.get(id=application_id)
        if application.aml_kyc_tax_email_sent:
            return
        fund = application.fund
        if fund.skip_tax:
            subject = f"{fund.name} AML/KYC Approved"
        else:
            subject = f"{fund.name} AML/KYC and Tax Approved"

        start_page_url = get_start_page_url(company=application.company)
        body = render_to_string('email/aml_kyc_tax_approval_email.html', {
            'logo_url': get_logo_url(company=fund.company),
            'user_name': get_display_name(application.user),
            'fund_name': fund.name,
            'next_step_url': start_page_url,
            'program_name': application.company.company_profile.program_name,
            'skip_tax': fund.skip_tax
        }).strip()
        email_service = SendEmailService()
        email_service.send_html_email(
            to=application.user.email,
            subject=subject,
            body=body
        )
        application.aml_kyc_tax_email_sent = True
        application.save()

    @staticmethod
    def send_aml_kyc_pre_document_approved(application_id: int):
        application = Application.objects.get(id=application_id)
        if application.aml_kyc_pre_document_email_sent:
            return
        fund = application.fund
        subject = f"{fund.name} AML/KYC and Application Approved"

        start_page_url = get_start_page_url(company=application.company)
        body = render_to_string('email/aml_kyc_pre_document_approval_email.html', {
            'logo_url': get_logo_url(company=fund.company),
            'user_name': get_display_name(application.user),
            'fund_name': fund.name,
            'next_step_url': start_page_url,
            'program_name': application.company.company_profile.program_name,
            'skip_tax': fund.skip_tax
        }).strip()
        email_service = SendEmailService()
        email_service.send_html_email(
            to=application.user.email,
            subject=subject,
            body=body
        )
        application.aml_kyc_pre_document_email_sent = True
        application.save()

    @staticmethod
    def send_gp_signing_approved(application_id: int):
        application = Application.objects.get(id=application_id)
        fund = application.fund
        subject = f"{fund.name} Documents Completed"
        application_url = get_fund_application_url(fund_external_id=fund.external_id)
        url = f'{application_url}?view=documents'

        body = render_to_string('email/gp_signing_complete_email_message.html', {
            'investor_name': get_display_name(application.user),
            'fund_name': fund.name,
            'logo_url': get_logo_url(company=fund.company),
            'investor_url': url,
            'program_name': application.company.company_profile.program_name
        }).strip()
        email_service = SendEmailService()
        email_service.send_html_email(
            to=application.user.email,
            subject=subject,
            body=body
        )

    def async_send_approval_email(self, workflow_id: int):
        async_task(self.send_approval_email, workflow_id)

    def async_send_application_approval_email(self, application_id: int):
        async_task(self.send_application_approved, application_id)

    def async_send_aml_kyc_tax_approval_email(self, application_id: int):
        async_task(self.send_aml_kyc_tax_approved, application_id)

    def async_gp_signing_approval_email(self, application_id: int):
        async_task(self.send_gp_signing_approved, application_id)

    @staticmethod
    def start_allocation_review(workflow: WorkFlow):
        fund = workflow.parent.fund
        all_eligibility_decisions_done = AllEligibilityDecisionTaken(fund=fund).process()
        if all_eligibility_decisions_done:
            AllocationReviewService(fund=fund).start_review()
