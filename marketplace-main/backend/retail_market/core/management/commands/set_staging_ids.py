# core/management/commands/set_staging_ids.py

from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import transaction, models

class Command(BaseCommand):
    help = "Set staging_id to pk for all models that have a staging_id field."

    def handle(self, *args, **options):
        for model in apps.get_models():
            # Skip proxy or unmanaged models
            if not model._meta.managed:
                continue

            # Only proceed if model has a 'staging_id' field
            if not hasattr(model, 'staging_id'):
                continue

            self.stdout.write(f"Processing model: {model.__name__}")
            updated_count = 0

            with transaction.atomic():
                for obj in model.objects.all():
                    if not obj.staging_id:
                        obj.staging_id = obj.pk
                        obj.save(update_fields=['staging_id'])
                        updated_count += 1

            self.stdout.write(self.style.SUCCESS(
                f"Updated {updated_count} instances of {model.__name__}"
            ))
