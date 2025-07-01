import json

from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import transaction

from core.services.importer import CompanyImportService, ImportService

class Command(BaseCommand):
    help = "Generic recursive data import script for nested model data"

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the JSON data file')
        parser.add_argument('env', type=str, default='staging', choices=['staging', 'production'],
                            help='Environment to import data into (default: staging)')
        parser.add_argument('--company_id', type=int, help='Company ID to assign to imported data')

    @transaction.atomic
    def handle(self, *args, **options):
        file_path = options['file_path']
        env = options['env']
        company_id = options.get('company_id')

        with open(file_path, 'r') as f:
            data = json.load(f)

        if company_id:
            service = CompanyImportService(company_id, env)
        else:
            service = ImportService(env=options['env'])
        results = service.import_data(data)

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {len(results)} objects."))
