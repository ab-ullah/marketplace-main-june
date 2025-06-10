from django.test import TestCase

from api.applications.tests.factories import FundFactory, ApplicationFactory
from api.applications.utils import get_user_latest_application_ids
from api.partners.tests.factories import UserFactory, CompanyFactory


class CompanyResetServiceTestCase(TestCase):
    def test_latest_application(self):
        user = UserFactory()
        user_2 = UserFactory()
        company = CompanyFactory()
        fund_1 = FundFactory(company=company)
        fund_2 = FundFactory(company=company)
        non_transferred_application = ApplicationFactory(
            user=user,
            fund=fund_1,
            company=company
        )
        latest_application_ids = get_user_latest_application_ids(user=user)
        self.assertEqual({non_transferred_application.id}, set(latest_application_ids))

        transferred_application = ApplicationFactory(
            user=user,
            fund=fund_1,
            company=company,
            is_transferred=True
        )

        ApplicationFactory(
            user=user_2,
            fund=fund_1,
            company=company,
            is_transferred=True
        )

        latest_application_ids = get_user_latest_application_ids(user=user)
        self.assertEqual({transferred_application.id}, set(latest_application_ids))

        non_transferred_application_fund_2 = ApplicationFactory(
            user=user,
            fund=fund_2,
            company=company
        )
        latest_application_ids = get_user_latest_application_ids(user=user)
        self.assertEqual({transferred_application.id, non_transferred_application_fund_2.id }, set(latest_application_ids))

        transferred_application_fund_2 = ApplicationFactory(
            user=user,
            fund=fund_2,
            company=company,
            is_transferred=True
        )

        ApplicationFactory(
            user=user_2,
            fund=fund_2,
            company=company,
            is_transferred=True
        )

        latest_application_ids = get_user_latest_application_ids(user=user)
        self.assertEqual({transferred_application.id, transferred_application_fund_2.id},
                         set(latest_application_ids))
