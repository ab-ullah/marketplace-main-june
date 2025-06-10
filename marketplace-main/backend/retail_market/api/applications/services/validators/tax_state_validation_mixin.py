import logging

from api.applications.models import Application
from api.applications.services.validators.schema import ApplicationModuleState
from api.documents.models import TaxDocument
from api.tax_records.models import TaxRecord
from api.tax_records.services.tax_review import TaxReviewService
from api.workflows.models import WorkFlow, Task
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService

TAX_MODULE_NAME = 'Tax'

logger = logging.getLogger(__name__)


class TaxRecordValidatorMixin:

    @staticmethod
    def has_documents(tax_record: TaxRecord):
        return TaxDocument.objects.filter(
            tax_record=tax_record,
            deleted=False
        ).exists()

    @staticmethod
    def has_pending_signature(tax_record: TaxRecord):
        return TaxDocument.objects.filter(
            tax_record=tax_record,
            deleted=False,
            completed=False
        ).exists()

    @staticmethod
    def return_state(is_valid_state, message):
        return ApplicationModuleState(
            module=TAX_MODULE_NAME,
            is_valid_state=is_valid_state,
            message=message
        ).get_state()

    def tax_review_task_created(self, application: Application):
        workflow = application.workflow
        if not workflow:
            return self.return_state(
                is_valid_state=False,
                message=f'No Parent Workflow associated Application with id: {application.id}'
            )

        try:
            tax_workflow = workflow.child_workflows.filter(
                module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
            ).get()
        except WorkFlow.DoesNotExist:
            tax_workflow = None

        if not tax_workflow:
            return self.return_state(
                is_valid_state=False,
                message=f'No Tax Module Workflow in Application with id: {application.id}'
            )

        task_created = tax_workflow.workflow_tasks.filter(
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST,
            assigned_to__isnull=False
        ).exists()
        if not task_created:
            return self.return_state(
                is_valid_state=False,
                message=f'No tax review task created in Application with id: {application.id}'
            )

        return self.return_state(
            is_valid_state=True,
            message='Tasks are in valid condition'
        )
    @staticmethod
    def create_tax_task(application: Application):
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=application.fund,
            company_user=application.get_company_user()
        )
        on_boarding_workflow_service.get_or_create_tax_workflow()
        TaxReviewService(
            tax_record=application.tax_record,
            fund=application.fund,
            user=application.user
        ).start_review()

    def has_valid_tax_state(self, application: Application):
        if not application.tax_record:
            return self.return_state(
                is_valid_state=False,
                message=f'No Tax Record Found for Application with id: {application.id}'
            )

        tax_record = application.tax_record

        if not self.has_documents(tax_record=tax_record):
            return self.return_state(
                is_valid_state=False,
                message=f'No Tax Form Added in Application with id: {application.id}'
            )

        if self.has_pending_signature(tax_record=tax_record):
            return self.return_state(
                is_valid_state=False,
                message=f'Pending Tax Signatures Application with id: {application.id}'
            )

        task_status = self.tax_review_task_created(application=application)
        if not task_status['is_valid_state']:
            if getattr(self, 'perform_fix'):
                logger.warning(f'Fixing the issue of missing task for application with id: {application.id}')
                self.create_tax_task(application=application)
                return self.return_state(
                    is_valid_state=False,
                    message=f'Missing Tax Review Task for Application with id: {application.id}, Task Created'
                )
            else:
                return self.return_state(
                    is_valid_state=False,
                    message=f'Missing Tax Review Task for Application with id: {application.id}'
                )

        return self.return_state(
            is_valid_state=True,
            message=f'Tax State is healthy for Application with id: {application.id}'
        )
