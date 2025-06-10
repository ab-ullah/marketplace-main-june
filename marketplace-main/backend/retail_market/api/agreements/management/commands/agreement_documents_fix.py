import csv
import json
import logging

from django.core.management.base import BaseCommand
from django.db.transaction import atomic
from django_pglocks import advisory_lock

from api.agreements.models import ApplicantAgreementDocument
from api.agreements.services.agreement_review_service import AgreementReview
from api.agreements.services.singed_response import SignedAgreementResponseService
from api.applications.models import Application
from api.documents.models import FundDocument

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Resync and Reconnect agreement files from docusign'

    def add_arguments(self, parser):
        parser.add_argument('--csv_path', type=str, action='store')

    @staticmethod
    def fix_agreement_documents(application_id, email, envelope_id, agreement_document_id):
        application = Application.objects.get(
            id=application_id,
            user__email__iexact=email
        )
        agreement_document = FundDocument.objects.get(
            id=agreement_document_id,
            fund__company=application.company
        )

        applicant_agreement_document_exists = ApplicantAgreementDocument.objects.filter(
            application=application,
            agreement_document=agreement_document,
            completed=True
        ).exists()
        if applicant_agreement_document_exists:
            print(
                f'Applicant Agreement Document already exists for user with email: {email} and agreement_document_id: {agreement_document_id}'
            )
            return

        applicant_agreement_document, _ = ApplicantAgreementDocument.objects.update_or_create(
            agreement_document=agreement_document,
            application=application,
            defaults={
                'envelope_id': envelope_id,
            }
        )
        company = application.company
        with advisory_lock(envelope_id, wait=False) as acquired:
            if acquired:
                signed_response_service = SignedAgreementResponseService(
                    envelope_id=envelope_id,
                    instance=applicant_agreement_document,
                    document_title=applicant_agreement_document.agreement_document.document.title,
                    company=company,
                    application=application
                )
                signed_response_service.process()
            else:
                print('Another request in process')
                return

        applicant_agreement_document.completed = True
        applicant_agreement_document.save()
        AgreementReview(application=applicant_agreement_document.application).process()

    def handle(self, *args, **options):
        csv_path = options['csv_path']
        with atomic():
            with open(csv_path) as f:
                rows = csv.DictReader(f)
                for row in rows:
                    print(f"Processing Row: {json.dumps(row)}")
                    self.fix_agreement_documents(
                        application_id=row['Application ID'],
                        email=row['email'],
                        envelope_id=row['envelope_id'],
                        agreement_document_id=row['agreement_document_id']
                    )
