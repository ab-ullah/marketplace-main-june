from django.core.management.base import BaseCommand
from django.db.transaction import atomic

from api.applications.models import Application
from api.documents.models import TaxDocument
from api.tax_records.serializers import SaveFormSerializer


class Command(BaseCommand):
    help = 'Fix Tax Envelope'

    def add_arguments(self, parser):
        parser.add_argument('--envelope_id', type=str, action='store')
        parser.add_argument('--fund_external_id', type=str, action='store')

    def handle(self, *args, **options):
        envelope_id = options.get('envelope_id')
        fund_external_id = options.get('fund_external_id')
        tax_document = TaxDocument.objects.get(envelope_id=envelope_id)
        tax_record = tax_document.tax_record

        application = Application.objects.get(tax_record=tax_record, fund__external_id=fund_external_id)
        with atomic():
            save_form_serializer = SaveFormSerializer(
                tax_document, data={}, context={'application': application}
            )
            save_form_serializer.is_valid(raise_exception=True)
            save_form_serializer.save()
