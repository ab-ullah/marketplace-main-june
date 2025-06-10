from typing import List

from api.applications.models import Application
from api.companies.models import CompanyUser
from api.investors.models import CompanyUserInvestor
from api.users.models import RetailUser


class UserHelper:
    @staticmethod
    def get_company_users(user: RetailUser):
        return list(user.associated_company_users.all())

    @staticmethod
    def get_company_user_ids(user: RetailUser):
        company_user_ids = user.associated_company_users.values_list('id', flat=True)
        return list(company_user_ids)

    @staticmethod
    def get_companies(company_users: List[CompanyUser]):
        return [company_user.company for company_user in company_users]

    @staticmethod
    def get_company_ids(company_users: List[CompanyUser]):
        return [company_user.company_id for company_user in company_users]

    @staticmethod
    def get_investor_ids(company_user_ids: List[int]):
        investor_ids = CompanyUserInvestor.objects.filter(
            company_user_id__in=company_user_ids
        ).values_list(
            'investor_id',
            flat=True
        )
        return list(investor_ids)

    @staticmethod
    def get_application_company_user(application: Application):
        return CompanyUser.objects.get(
            company=application.company,
            user=application.user
        )
