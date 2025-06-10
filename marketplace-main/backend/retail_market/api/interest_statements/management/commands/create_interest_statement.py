import logging

from dateutil.parser import parse as dt_parse
from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.interest_statements.services.process_investor import ProcessInvestorService
from api.investors.models import Investor

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Interest Statement for Investor'

    def add_arguments(self, parser):
        parser.add_argument('--investor_name', type=str, action='store')
        parser.add_argument('--quarter_end_date', type=str, action='store')
        parser.add_argument('--company_name', type=str, action='store')

    def handle(self, *args, **options):
        investor_name = options.get('investor_name')
        quarter_end_date = options.get('quarter_end_date')
        company_name = options.get('company_name')
        company = Company.objects.get(name__iexact=company_name)
        investor = Investor.objects.filter(
            associated_users__company_user__company=company,
            name__iexact=investor_name
        ).first()
        quarter_date = dt_parse(quarter_end_date).date()
        ProcessInvestorService(
            investor_id=investor.id,
            quarter_end_date=quarter_date,
            company=company
        ).process()
