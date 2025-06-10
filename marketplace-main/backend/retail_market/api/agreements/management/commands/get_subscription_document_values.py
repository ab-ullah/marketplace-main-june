import json
import logging

from django.core.management.base import BaseCommand

from api.agreements.services.application_data.get_application_values import GetApplicationValuesService
from api.applications.models import Application
from api.documents.models import FundDocument

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Get list of subscription document values'

    def handle(self, *args, **options):
        application = Application.objects.latest('created_at')
        fund_documents = FundDocument.objects.filter(
            fund=application.fund,
            require_signature=True
        )
        for document in fund_documents:
            print(f'Document Name: {document.document.title}')
            print(json.dumps(GetApplicationValuesService(application=application, document=document).get()))
        return
