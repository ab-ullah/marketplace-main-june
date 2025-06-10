import logging

from django.core.management.base import BaseCommand

from api.applications.models import Application
from api.documents.models import KYCDocument

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Pin KYC Versions'

    def handle(self, *args, **options):
        for kyc_document in KYCDocument.include_deleted.all():
            kyc_document.save()

        for application in Application.objects.filter(status=Application.Status.APPROVED.value):
            if not application.is_gp_signed():
                continue
            application.gp_signing_completed_at = application.acceptance_date()
            application.save(update_fields=['gp_signing_completed_at'])
