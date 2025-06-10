import logging
import mimetypes

from django.core.management.base import BaseCommand

from api.applications.models import ApplicationCompanyDocument

logger = logging.getLogger(__name__)
from django.apps import apps


class Command(BaseCommand):
    help = 'Fix Application Company Documents with wrong extension and content type'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Fix extensions cards',
        )

    def handle(self, *args, **options):
        fix = options.get('fix')
        config = apps.get_app_config('documents')
        context = config.context
        document_api = config.document_api

        wet_signed_application_documents = ApplicationCompanyDocument.objects.filter(
            company_document__require_wet_signature=True,
            signed_document__isnull=False
        )
        for application_company_document in wet_signed_application_documents:
            document = application_company_document.signed_document
            document_info = document_api.get_head_info(context, document.document_path)

            content_type = document_info['ResponseMetadata']['HTTPHeaders']['content-type']
            extension = mimetypes.guess_extension(content_type).strip('.')
            if extension.lower() != document.extension.lower() or document.content_type.lower() != content_type.lower():
                print(
                    f'Document Id: {document.id}:  extension: {document.extension}, Actual Extension: {extension}, content type: {document.content_type} Actual Content Type: {content_type}'
                )
                if fix:
                    document.extension = extension
                    document.content_type = content_type
                    document.save(update_fields=['extension', 'content_type'])
            else:
                print(f'Document Id: {document.id}: Correct Info')
