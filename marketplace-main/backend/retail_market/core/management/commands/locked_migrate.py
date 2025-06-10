from django.core.management import call_command
from django.core.management.base import BaseCommand
from django_pglocks import advisory_lock

MIGRATION_LOCK_ID = 'SIDE_CAR_MIGRATE_LOCK'


class Command(BaseCommand):
    help = 'Run migrate command with PG Advisory Lock'

    def handle(self, *args, **options):
        with advisory_lock(MIGRATION_LOCK_ID, wait=False) as acquired:
            if acquired:
                self.stdout.write(self.style.SUCCESS('Lock Acquired Running Migrations'))
                call_command('migrate')
            else:
                self.stdout.write(self.style.WARNING('Unable to Acquire Lock. Skipping Migration'))
