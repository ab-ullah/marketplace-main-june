import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.page_configs.data.carry import CARRY_PAGE_CONFIG_DEFAULT
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
            page=PageConfig.PageTypes.CARRY_CONFIG.value,
            defaults={
                'enabled': True,
                'page_value': CARRY_PAGE_CONFIG_DEFAULT
            }

        )
