import json
import logging

import boto3
from dateutil.utils import today
from django.core.management.base import BaseCommand
from django.core.serializers.json import DjangoJSONEncoder

from api.applications.models import Application
from django.conf import settings

from api.backup.models import ApplicationBackup
from django.apps import apps

from api.backup.serializers import CompleteApplicationBackup

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Backup everything regarding an investor application'

    def add_arguments(self, parser):
        parser.add_argument('application_id', type=int)

    def handle(self, *args, **options):
        application_id = options.get('application_id')
        backup_storage = apps.get_app_config('backup').backup_storage
        application = Application.objects.get(pk=application_id)
        output = application.backup_to(CompleteApplicationBackup, backup_storage)
        self.stdout.write(json.dumps(output.__dict__), ending='\n')
