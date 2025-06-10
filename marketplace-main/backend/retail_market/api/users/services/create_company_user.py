import logging
import uuid

from django.db import IntegrityError

from api.companies.models import Company, CompanyUser
from api.companies.services.company_service import CompanyService
from api.libs.utils.company_name_from_email import get_company_name_from_email
from api.users.models import RetailUser

logger = logging.getLogger(__name__)


class CreateCompanyUserService:
    def __init__(self, user: RetailUser):
        self.user = user

    def get_company(self):
        company_name = get_company_name_from_email(email=self.user.email)
        company = Company.objects.filter(name__iexact=company_name).first()
        if company:
            return company
        company_info = CompanyService.create_company(company_name=company_name)
        return company_info['company']

    def company_user_exists(self, company: Company):
        return CompanyUser.objects.filter(
            company=company,
            user=self.user
        ).exists()

    def create_company_user(self, company: Company):
        company_user, _ = CompanyUser.objects.get_or_create(
            user=self.user,
            company=company,
            # TODO: We need a flow to assign partner id to users that are not in db and log in from okta
            defaults={
                'partner_id': uuid.uuid4().hex
            }
        )
        return company_user

    def create(self):
        if not self.user.email:
            return

        company = self.get_company()
        if self.company_user_exists(company=company):
            return

        try:
            self.create_company_user(company=company)
        except IntegrityError:
            if not self.company_user_exists(company=company):
                logger.exception('Unable to create company user for user: {email}'.format(email=self.user.email))
