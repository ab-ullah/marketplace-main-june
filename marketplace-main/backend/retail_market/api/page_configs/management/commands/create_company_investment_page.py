import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.constants.page_config_defaults import INVESTOR_DASHBOARD_CONFIG, INVESTMENT_DETAIL_PAGE_CONFIG
from api.page_configs.models import PageConfig

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Company Config'

    def add_arguments(self, parser):
        parser.add_argument('--company_name', type=str, action='store')

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        company = Company.objects.get(name__iexact=company_name)
        PageConfig.objects.update_or_create(
            company=company,
            page=PageConfig.PageTypes.INVESTOR_DASHBOARD.value,
            defaults={
                'enabled': True,
                'page_value': INVESTOR_DASHBOARD_CONFIG
            }

        )
        PageConfig.objects.update_or_create(
            company=company,
            page=PageConfig.PageTypes.INVESTMENT_DETAIL_PAGE.value,
            defaults={
                'enabled': True,
                'page_value': INVESTMENT_DETAIL_PAGE_CONFIG
            }
        )
