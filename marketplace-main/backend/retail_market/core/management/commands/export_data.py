
from api.feature_flags.provider import ID

from django.core.management.base import BaseCommand
from django.apps import apps
from core.services.exporter import ExporterService

class Command(BaseCommand):
    help = "Export model data with relations"

    def add_arguments(self, parser):
        # parser.add_argument('--company_id', type=ID, required=True, help='Company name')
        parser.add_argument('--model', type=str, required=True, help='Model label: app.Model')
        parser.add_argument('--depth', type=int, required=True, help='depth of relations to export (e.g. 1, 2, 3)')
        parser.add_argument('--env', type=str, default='staging', choices=['staging', 'production'])
        parser.add_argument('--output', type=str, required=True)

    def handle(self, *args, **options):
        model = apps.get_model(options['model'])
        print('model: ', model)
        queryset = model.objects.all()
        exporter = ExporterService(depth=options['depth'])
        data = exporter.export_queryset(queryset, env=options['env'])
        exporter.save_export_to_file(data, options['output'])
        self.stdout.write(self.style.SUCCESS(f"Exported {len(data)} total objects to {options['output']}"))