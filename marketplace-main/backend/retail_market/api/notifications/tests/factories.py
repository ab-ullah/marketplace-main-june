import factory
from faker import Faker

from api.notifications.models import UserNotification
from api.partners.tests.factories import CompanyFactory, CurrencyFactory, FundFactory, CompanyUserFactory, UserFactory

fake = Faker()


class NotificationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserNotification

    notification_type = UserNotification.NotificationTypeChoice.NEW_INVESTMENT.value
    is_read = False
    company = factory.SubFactory(CompanyFactory)
    fund = factory.SubFactory(
        FundFactory,
        company=factory.SubFactory(CompanyFactory),
        fund_currency=factory.SubFactory(CurrencyFactory, company=factory.SubFactory(CompanyFactory)),
    )
    user = factory.SubFactory(
        CompanyUserFactory,
        company=factory.SubFactory(CompanyFactory),
        user=factory.SubFactory(UserFactory),
    )
