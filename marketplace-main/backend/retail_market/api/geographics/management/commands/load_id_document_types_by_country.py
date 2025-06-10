from django.core.management.base import BaseCommand

from api.geographics.services.create_id_document_types_by_country import CreateIdDocumentTypesService


class Command(BaseCommand):
    help = 'Load valid ID documents by country'

    def handle(self, *args, **options):
        CreateIdDocumentTypesService.create()
