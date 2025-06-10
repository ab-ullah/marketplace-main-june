from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.currencies.models import Currency

from api.companies.models import Company, CompanyProfile, CompanyFAQ
from api.users.services.create_company_user import CreateCompanyUserService
from api.users.models import RetailUser


class CompanyViewsTestCase(APITestCase):

    def setUp(self):
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )

        username = 'test-user'
        email = 'test-user@test.com'
        self.user, _ = RetailUser.objects.update_or_create(
            email__iexact=email,
            defaults={
                'username': username,
                'email': email
            }
        )

        if not hasattr(self.user, 'company_user'):
            CreateCompanyUserService(self.user).create_company_user(self.company)

    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            "HTTP_AUTHORIZATION": "Bearer Test-123",
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def test_get_company_includes_profile_and_stats(self):
        for company in Company.objects.iterator():
            CompanyProfile.objects.update_or_create(
                company=company,
                defaults={
                    'program_name': 'Employee Co-Investment Program',
                    'mission_statement': 'Providing you with investment opportunities today. For tomorrow.',
                    'opportunities_description': 'LaSalle is offering employees the opportunity to invest in a variety of open-end funds, closed-end funds, and certain separate accounts and other vehicles as the opportunities arise. The following funds are planned to be available for investment soon.',
                    'contact_email': 'EmployeeCoInvest@lasalle.com',
                    'stats': [
                        {'label': 'Real Estate Investment Experience', 'value': '40yrs'},
                        {'label': 'Countries', 'value': '15'},
                        {'label': 'Assets Under Management', 'value': '$73B'},
                    ]
                }
            )

            CompanyFAQ.objects.create(
                company=company,
                display_on_top=True,
                question='What is our Employee Co-Investment Program?',
                answer="""At LaSalle, we are committed to investing in our people and providing employees direct ways to benefit from LaSalle's growth and success. \n
                        Our Employee Co-Investment Program offers eligible employees the chance to invest with financing alongside our clients, creating an exciting opportunity for employees to take advantage of our dynamic products and offerings. Additionally, the Program highlights our alignment of interest with clients, and demonstrates conviction in our investment process that has successfully guided the firm for more than 40 years. \n
                        This site is intended to provide you with a comprehensive overview of the program, current and upcoming investment opportunities, as well as answer any questions you may have about the program."""
            )
        url = reverse('company-profile-view', kwargs={'slug': self.company.slug})

        self.client.force_authenticate(self.user)
        response = self.client.get(
            url,
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        company_faqs = response.data.get('company_faqs')
        company_profile = response.data.get('company_profile')

        self.assertIsNotNone(company_faqs)
        self.assertEqual(len(company_faqs), 1)
        self.assertEqual(company_faqs[0]['question'], "What is our Employee Co-Investment Program?")
        self.assertIsNotNone(company_profile)
        self.assertEqual(company_profile['program_name'], "Employee Co-Investment Program")
