from http import HTTPStatus

from rest_framework.reverse import reverse

from api.partners.tests.factories import CurrencyFactory
from core.base_tests import BaseTestCase


class TestCurrencyRetrieval(BaseTestCase):

    def setUp(self):
        self.create_user()
        CurrencyFactory(company=self.company)
        self.client.force_authenticate(self.admin_user.user)

    def test_currency_list_view(self):
        url = reverse('company-currency-list-api-view')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data[0]['company'], self.admin_user.company.id)
