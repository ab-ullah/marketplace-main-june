import json
import logging

from django.core.management.base import BaseCommand
from django.apps import apps

from api.backup.serializers import LasalleApplicationReport, LasalleDocumentBackup
from api.funds.models import Fund

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Backup everything regarding a fund'

    def add_arguments(self, parser):
        parser.add_argument('fund_id', type=int)

    def handle(self, *args, **options):
        fund_id = options.get('fund_id')
        backup_storage = apps.get_app_config('backup').backup_storage
        fund = Fund.objects.get(pk=fund_id)
        output = fund.backup_serialized_to(LasalleApplicationReport, backup_storage)
        fund.backup_serialized_documents_to(LasalleDocumentBackup, backup_storage)
        fund.backup_documents_to(backup_storage)
        self.stdout.write(json.dumps({**output, **{'message': "Successful"}}), ending='\n')
