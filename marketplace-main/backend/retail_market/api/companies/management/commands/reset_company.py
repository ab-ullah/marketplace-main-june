import logging

from django.core.management.base import BaseCommand

from api.companies.services.reset_company import ResetCompanyService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Reset company data'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)

    @staticmethod
    def has_user_confirmation(company_name):
        result = input("Are you sure you want to reset company: {}? [y/n]".format(company_name))
        while len(result) < 1 or result[0].lower() not in "yn":
            result = input("Please answer y or n: ")
        return result[0].lower() == "y"

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        user_confirmation = self.has_user_confirmation(company_name=company_name)
        if not user_confirmation:
            return

        reset_company_service = ResetCompanyService(company_name=company_name)
        reset_company_service.reset()
