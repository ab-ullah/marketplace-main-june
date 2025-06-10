import factory
from faker import Faker

from api.partners.tests.factories import CompanyFactory
from api.applications.models import Application
from api.funds.models import Fund
fake = Faker()


class ApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Application
    company = factory.SubFactory(CompanyFactory)

class FundFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Fund
    company = factory.SubFactory(CompanyFactory)

    


    
