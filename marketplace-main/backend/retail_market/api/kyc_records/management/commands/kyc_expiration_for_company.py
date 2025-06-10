from django.core.management.base import BaseCommand
from rest_framework.renderers import JSONRenderer

from api.companies.models import Company
from api.kyc_records.services.kyc_expiration_stats import KycExpirationStats


class Command(BaseCommand):
    help = 'Get KYC Expiration dates'

    def add_arguments(self, parser):
        parser.add_argument('--company_name', type=str, action='store', required=True)
        parser.add_argument(
            '--current_year',
            action='store_true',
            help='Store True',
        )
        parser.add_argument('--report_email', type=str, action='store', required=False,
                            help='Where do you want to send this report')

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        current_year = options.get('current_year')
        report_email = options.get('report_email')

        company = Company.objects.get(name__iexact=company_name)
        data = KycExpirationStats(
            company=company,
            current_year_expiration_only=current_year,
            report_email=report_email
        ).process(send_email=True)

        print(JSONRenderer().render(data).decode())
