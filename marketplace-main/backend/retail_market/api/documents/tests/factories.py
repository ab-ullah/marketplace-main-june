from uuid import uuid4

import factory
from faker import Faker

from api.admin_users.tests.factories import AdminUserFactory
from api.applications.tests.factories import ApplicationFactory
from api.documents.models import (ApplicationSupportingDocument, Document,
                                  FundDocument)
from api.partners.tests.factories import (CompanyFactory, CompanyUserFactory,
                                          FundFactory)

fake = Faker()


class DocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Document

    title = factory.LazyAttribute(lambda x: fake.company())
    company = factory.SubFactory(CompanyFactory)
    partner_id = factory.Sequence(lambda n: 'document_partner{0}'.format(n))
    content_type = 'application/pdf'
    extension = 'pdf'
    document_path = factory.Sequence(lambda n: 'document_path{0}'.format(n))
    document_id = factory.Sequence(lambda n: uuid4().hex)
    uploaded_by_user = factory.SubFactory(CompanyUserFactory, company=factory.SelfAttribute('..company'))


class ApplicationSupportingDocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ApplicationSupportingDocument

    application = factory.SubFactory(ApplicationFactory)
    document_name = factory.LazyAttribute(lambda x: fake.file_name(extension='pdf'))
    document_description = factory.LazyAttribute(lambda x: fake.paragraph())
    document = factory.SubFactory(DocumentFactory)


class FundDocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundDocument

    fund = factory.SubFactory(FundFactory)
    document = factory.SubFactory(DocumentFactory)
    gp_signer = factory.SubFactory(AdminUserFactory)