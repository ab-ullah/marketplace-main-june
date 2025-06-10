import base64
import csv
from datetime import date
from io import StringIO

from django.conf import settings
from django.utils import timezone

from api.companies.models import Company
from api.kyc_records.models import KYCRecord
from api.kyc_records.serializers import KYCExpirationSerializer
from api.libs.sendgrid.email import SendEmailService


class KycExpirationStats:
    def __init__(self, company: Company, current_year_expiration_only=False, report_email=None):
        self.company = company
        self.current_year_expiration_only = current_year_expiration_only
        self.report_email = report_email

    @staticmethod
    def filter_for_current_year_only(qs):
        current_date = timezone.now().date()
        end_date = date(current_date.year + 1, 1, 1)
        return qs.filter(id_expiration_date__lt=end_date)

    def create_in_memory_csv(self, expiration_details):
        field_names = []
        if expiration_details:
            field_names = list(expiration_details[0].keys())
        in_memory_csv = StringIO()
        writer = csv.DictWriter(in_memory_csv, fieldnames=field_names)
        writer.writeheader()
        writer.writerows(expiration_details)
        return base64.b64encode(in_memory_csv.getvalue().encode()).decode()

    def send_email(self, expiration_details):
        attachment = self.create_in_memory_csv(expiration_details=expiration_details)
        email_service = SendEmailService()
        current_date = timezone.now().date()
        company_name = self.company.name
        to = self.report_email or settings.KYC_EXPIRATION_EMAIL_RECIPIENT
        email_content = f"Attached are the kyc expiration stats for: {company_name} compiled on: {current_date}"
        to = [email.strip() for email in to.split(',')]
        email_service.send_email_with_attachment(
            to=to,
            subject=f'{self.company} KYC Expiration Details: {current_date}',
            body=email_content,
            attachment_file=attachment,
            file_type='text/csv',
            attachment_file_name=f'kyc-expiration-{company_name}-{current_date}.csv'
        )

    def process(self, send_email=False):
        qs = KYCRecord.objects.filter(company=self.company, id_expiration_date__isnull=False)
        if self.current_year_expiration_only:
            qs = self.filter_for_current_year_only(qs=qs)

        data = KYCExpirationSerializer(qs, many=True).data
        if send_email:
            self.send_email(expiration_details=data)

        return data
