from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.partners.tests.factories import UserFactory, CompanyUserFactory, CompanyFactory, FundFactory
from api.tax_records.services.load_tax_forms import CreateCompanyTaxFormsService


class TaxFormListAPITestCase(APITestCase):
    def setUp(self) -> None:
        self.user = UserFactory()
        self.client.force_authenticate(self.user)

    def test_fetch_tax_forms(self):
        """
        We have tax forms only for the middle company and if we had
        only been doing the tax form fetching by company_user[0]
        then we would have got not tax forms
        """

        company_1 = CompanyFactory()
        CompanyUserFactory(company=company_1, user=self.user)

        company_2 = CompanyFactory()
        company_user_2 = CompanyUserFactory(company=company_2, user=self.user)

        company_3 = CompanyFactory()
        CompanyUserFactory(company=company_3, user=self.user)

        fund = FundFactory(company=company_2)
        CreateCompanyTaxFormsService(company=company_2).create()

        url = reverse('list-tax-form-view', kwargs={'fund_external_id': fund.external_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
