from django.core.management.base import BaseCommand
from django.db.transaction import atomic
from django.shortcuts import get_object_or_404

from api.applications.utils import get_application_or_404
from api.documents.models import TaxDocument
from api.tax_records.services.tax_review import TaxReviewService
from api.users.models import RetailUser


class Command(BaseCommand):
    help = 'Start Tax Review'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, action='store')
        parser.add_argument('--fund_external_id', type=str, action='store')

    def handle(self, *args, **options):
        email = options.get('email')
        fund_external_id = options.get('fund_external_id')

        user = get_object_or_404(
            RetailUser,
            email=email
        )

        application = get_application_or_404({
            'user_id': user.id,
            'fund__external_id': fund_external_id
        })
        tax_record = application.tax_record

        tax_documents_count = TaxDocument.objects.filter(tax_record=tax_record, deleted=False).count()
        if not tax_documents_count:
            return

        completed_documents_count = TaxDocument.objects.filter(
            tax_record=tax_record,
            completed=True,
            deleted=False
        ).count()

        if tax_documents_count == completed_documents_count:
            with atomic():
                TaxReviewService(tax_record=tax_record, fund=application.fund, user=application.user).start_review()
