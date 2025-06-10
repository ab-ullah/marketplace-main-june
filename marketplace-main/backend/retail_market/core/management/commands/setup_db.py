from django.core.management import call_command
from django.core.management.base import BaseCommand
from django_pglocks import advisory_lock

COMMANDS_TO_RUN = (
    'create_company_roles',
    'create_currencies',
    'load_countries',
    'load_regions',
    'create_block_categories',
    'create_blocks',
    'create_icon_options',
    'create_kyc_workflows',
    'load_id_document_types_by_country',
    'load_tax_forms',
)

LOCK_ID = 'SIDECAR_DB_SETUP_LOCK'


class Command(BaseCommand):
    help = 'Setup Database with pre-requisite data'

    def handle(self, *args, **options):
        with advisory_lock(LOCK_ID, wait=False) as acquired:
            if acquired:
                self.stdout.write(self.style.SUCCESS('Lock Acquired Running DB Setup'))
                for command_name in COMMANDS_TO_RUN:
                    self.stdout.write(self.style.SUCCESS(f'Running Command: {command_name}'))
                    call_command(command_name)
                    self.stdout.write(self.style.SUCCESS(f'Finished Running Command: {command_name}'))
            else:
                self.stdout.write(self.style.WARNING('Unable to Acquire Lock. Skipping DB Setup'))
