import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.page_configs.data.riverside import RIVERSIDE_INVESTOR_DASHBOARD, RIVERSIDE_INVESTMENT_DETAIL_PAGE
from api.page_configs.models import PageConfig

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Riverside Company Config'


    def handle(self, *args, **options):
        company_name = 'riverside'
        company = Company.objects.get(name__iexact=company_name)
        PageConfig.objects.update_or_create(
            company=company,
            page=PageConfig.PageTypes.INVESTOR_DASHBOARD.value,
            defaults={
                'enabled': True,
                'page_value': RIVERSIDE_INVESTOR_DASHBOARD
            }

        )
        PageConfig.objects.update_or_create(
            company=company,
            page=PageConfig.PageTypes.INVESTMENT_DETAIL_PAGE.value,
            defaults={
                'enabled': True,
                'page_value': RIVERSIDE_INVESTMENT_DETAIL_PAGE
            }
        )
