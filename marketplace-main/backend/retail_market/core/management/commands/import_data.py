import json

from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import transaction

from core.services.importer import ImportService

class Command(BaseCommand):
    help = "Generic recursive data import script for nested model data"

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the JSON data file')
        parser.add_argument('env', type=str, default='staging', choices=['staging', 'production'],
                            help='Environment to import data into (default: staging)')
    @transaction.atomic
    def handle(self, *args, **options):
        file_path = options['file_path']
        with open(file_path, 'r') as f:
            data = json.load(f)
        service = ImportService(env=options['env'])
        results = service.import_data(data)

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {len(results)} objects."))
        if service.errors:
            self.stdout.write(self.style.ERROR(f"Encountered {len(service.errors)} errors:"))
            for error in service.errors:
                self.stdout.write(self.style.ERROR(f"• {str(error)}"))

