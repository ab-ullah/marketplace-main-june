import factory
from faker import Faker

from api.partners.tests.factories import CompanyFactory, UserFactory, CompanyUserFactory

from api.tax_records.models import TaxForm, TaxRecord
from api.documents.models import Document, TaxDocument

fake = Faker()


class TaxFormFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TaxForm

    form_id = "W8-BEN"
    company = factory.SubFactory(CompanyFactory)


class TaxRecordFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TaxRecord

    user = factory.SubFactory(UserFactory)
    company = factory.SubFactory(CompanyFactory)


class DocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Document

    document_id = fake.uuid4()
    uploaded_by_user = factory.SubFactory(CompanyUserFactory)


class TaxDocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TaxDocument

    document = factory.SubFactory(DocumentFactory)
    form = factory.SubFactory(TaxFormFactory)
