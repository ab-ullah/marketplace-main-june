from api.constants.id_documents import IdDocuments
from api.geographics.models import Country, CountryIdDocumentType

VALID_ID_DOCUMENT_TYPES_BY_COUNTRY = [
    {'country_code': 'AS',
     'id_document_types': [IdDocuments.PASSPORT, IdDocuments.DRIVERS_LICENSE]},
    {'country_code': 'GU',
     'id_document_types': [IdDocuments.PASSPORT, IdDocuments.DRIVERS_LICENSE]},
    {'country_code': 'MP',
     'id_document_types': [IdDocuments.PASSPORT, IdDocuments.DRIVERS_LICENSE]},
    {'country_code': 'PR',
     'id_document_types': [IdDocuments.PASSPORT, IdDocuments.DRIVERS_LICENSE]},
    {'country_code': 'UM',
     'id_document_types': [IdDocuments.PASSPORT, IdDocuments.DRIVERS_LICENSE]},
    {'country_code': 'US',
     'id_document_types': [IdDocuments.PASSPORT, IdDocuments.DRIVERS_LICENSE]},
]


class CreateIdDocumentTypesService:

    @staticmethod
    def create():
        for id_docs_by_country in VALID_ID_DOCUMENT_TYPES_BY_COUNTRY:
            country = Country.objects.filter(iso_code=id_docs_by_country['country_code']).get()
            CountryIdDocumentType.objects.filter(country=country).delete()
            for id_document in id_docs_by_country['id_document_types']:
                CountryIdDocumentType.objects.get_or_create(
                    country=country,
                    id_document_type=id_document,
                )
