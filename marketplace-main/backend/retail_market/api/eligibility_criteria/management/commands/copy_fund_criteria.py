import logging

from django.core.management.base import BaseCommand

from api.eligibility_criteria.services.admin.copy_fund_criteria import CopyFundCriteriaService
from api.funds.models import Fund

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Copy fund criteria'

    def add_arguments(self, parser):
        parser.add_argument('--source_external_id', type=str, action='store')
        parser.add_argument('--dest_external_id', type=str, action='store')

    def handle(self, *args, **options):
        source_external_id = options.get('source_external_id')
        dest_external_id = options.get('dest_external_id')

        source_fund = Fund.objects.get(external_id=source_external_id)
        dest_fund = Fund.objects.get(external_id=dest_external_id)

        CopyFundCriteriaService(source_fund=source_fund, dest_fund=dest_fund).process()
