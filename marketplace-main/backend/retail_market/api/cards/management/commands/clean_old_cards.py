from django.core.management.base import BaseCommand

from api.cards.default.workflows import WorkflowTypes, create_workflow_for_company
from api.cards.services.delete_stalled_cards import CardCleaningService
from api.companies.models import Company
from api.kyc_records.models import KYCRecord


class Command(BaseCommand):
    help = 'Clean old cards for AML/KYC workflow'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Delete the old cards',
        )

    def handle(self, *args, **options):
        print(f"Delete: {options['delete']}")
        CardCleaningService(do_delete=options['delete']).clean()
