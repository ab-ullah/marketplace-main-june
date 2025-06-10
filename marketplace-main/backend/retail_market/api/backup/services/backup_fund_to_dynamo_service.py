import base64
from io import StringIO

from django.utils import timezone

from api.backup.services.dynamo_crm.dynamo_client import DynamoClient
from api.funds.models import Fund
from django.conf import settings
import logging

from api.libs.sendgrid.email import SendEmailService


class BackupFundToDynamoService:

    @staticmethod
    def create_in_memory_report_file(content: str):
        in_memory_csv = StringIO(content)
        return base64.b64encode(in_memory_csv.getvalue().encode()).decode()

    @staticmethod
    def sync_applications_and_documents(fund_id, report_email, plan_only=False):
        """Expect this to be called from an async task without dry-run
        Add the param here so that we can debug this by setting dry_run to true
        The dry run parameter instructs the dynamo client to report on the changes it would make
        if it made updates to the dynamo service.  This is useful for testing, since we can mock the dynamo
        service to make sure we only update or create what we expect"""

        fund = Fund.objects.get(id=fund_id)
        applications = fund.approved_applications()
        dc = DynamoClient(base_url=settings.DYNAMO_BASE_URL, api_key=settings.DYNAMO_API_KEY, plan_only=plan_only)

        current_date = timezone.now().date()
        results = dc.sync(applications, fund)
        logging.info(f"Sync applications and documents for fund id:name {fund_id}:{fund.name}")
        logging.info("Dynamo Client results")
        logging.info(results.log_output())

        attachment = BackupFundToDynamoService.create_in_memory_report_file(results.log_short_output())
        email_service = SendEmailService()
        to = report_email
        email_content = f"Attached is the result of the push to dynamo records for: {fund.name} started on: {current_date}"
        email_service.send_email_with_attachment(
            to=to,
            subject=f'Dynamo sync results for {fund.name}',
            body=email_content,
            attachment_file=attachment,
            file_type='text',
            attachment_file_name=f'dynamo-results-{fund.name}-{current_date}.txt'
        )
