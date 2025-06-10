import factory
from faker import Faker

from api.partners.tests.factories import CurrencyFactory
from api.payments.models import PaymentDetail

fake = Faker()


class PaymentDetailFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PaymentDetail

    bank_name = factory.LazyAttribute(lambda x: fake.unique.company())
    street_address = factory.LazyAttribute(lambda x: fake.address())
    city = factory.LazyAttribute(lambda x: fake.city())
    postal_code = factory.LazyAttribute(lambda x: fake.postcode())
    account_name = factory.LazyAttribute(lambda x: fake.unique.name())
    account_number = factory.LazyAttribute(lambda x: fake.unique.name())
    credit_account_name = factory.LazyAttribute(lambda x: fake.unique.name())
    credit_account_number = factory.LazyAttribute(lambda x: fake.unique.name())
    reference = factory.LazyAttribute(lambda x: fake.unique.name())
    currency = factory.SubFactory(CurrencyFactory)
