from uuid import uuid4

from api.companies.models import Company, CompanyToken
from api.constants.currencies import CURRENCIES
from api.constants.headers import API_KEY_HEADER
from api.currencies.models import Currency

LASALLE_COMPANY_NAME = 'lasalle'
DUMMY_COMPANY_NAME = 'dummycompany'


class CompanyService:
    @staticmethod
    def get_company():
        # TODO: Make it dynamic to get the company from api key
        return Company.objects.get(name__iexact=LASALLE_COMPANY_NAME)

    @staticmethod
    def create_company_currencies(company: Company):
        for currency_data in CURRENCIES:
            Currency.objects.get_or_create(
                code=currency_data['code'].upper(),
                company=company,
                defaults={
                    'company': company,
                    **currency_data
                }
            )

    @staticmethod
    def create_company(company_name):
        company, _ = Company.objects.get_or_create(name__iexact=company_name, defaults={'name': company_name})
        if company.company_tokens.count() == 0:
            token = uuid4().hex
            CompanyToken.objects.create(
                company=company,
                token=token
            )
        else:
            token = company.company_tokens.first().token
        CompanyService.create_company_currencies(company=company)

        return {'company': company, 'token': token}

    @staticmethod
    def get_company_from_request(request):
        api_key = request.headers.get(API_KEY_HEADER)
        if not api_key:
            # TODO: Update test to pass in headers in request.headers
            api_key = request.META.get(API_KEY_HEADER)
        if not api_key:
            return None
        try:
            company_token = CompanyToken.objects.get(token=api_key)
            return company_token.company
        except CompanyToken.DoesNotExist:
            return None
