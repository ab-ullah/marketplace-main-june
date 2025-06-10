from django_q.tasks import async_task

from api.applications.models import Application
from api.funds.models import Fund
from api.kyc_records.services.aml_kyc_review import AmlKycReviewService
from api.kyc_records.services.check_kyc_completion import CheckKycCompletion
from api.users.constants import FINANCIAL_ELIGIBILITY_REVIEWER
from api.workflows.models import Task


class CheckAndStartKYCReview:

    @staticmethod
    def process(fund_external_id, kyc_record):
        fund = Fund.objects.get(external_id=fund_external_id)

        if kyc_record.is_participant_record():
            return

        application = Application.objects.filter(
            fund=fund,
            user=kyc_record.user,
            kyc_record=kyc_record
        ).latest('created_at')

        if application.status != Application.Status.APPROVED.value:
            return

        review_service = AmlKycReviewService(
            kyc_record=kyc_record,
            fund=fund,
            user=application.user
        )

        workflow = review_service.get_workflow()

        if workflow:
            task_exists = Task.objects.filter(
                workflow=workflow,
                assigned_to_group__name=FINANCIAL_ELIGIBILITY_REVIEWER
            ).exists()
            if task_exists:
                return

        kyc_status = CheckKycCompletion(kyc_record=kyc_record, fund=fund).process()
        if not kyc_status['is_completed']:
            return

        review_service.start_review(force_mark_completed=kyc_record.is_auto_approved())

    @staticmethod
    def async_check_and_start_review(fund_external_id, kyc_record):
        async_task(CheckAndStartKYCReview.process, fund_external_id, kyc_record)
