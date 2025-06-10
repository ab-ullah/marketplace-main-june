import logging

from django.core.management.base import BaseCommand
from api.investors.models import InvestorAdvisor
from api.companies.models import CompanyUser

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Advisor Investor Relation Using CompanyUser ID'

    def add_arguments(self, parser):
        parser.add_argument('--advisor', type=str, action='store', required=True)
        parser.add_argument('--investor', type=str, action='store', required=True)

    def handle(self, *args, **options):
        advisor_company_user_id = options.get('advisor')
        investor_company_user_id = options.get('investor')

        try:
            advisor = CompanyUser.objects.get(id=advisor_company_user_id)
        except CompanyUser.DoesNotExist:
            self.stdout.write('No Advisor Company User Found with ID: ' + advisor_company_user_id)
            return

        try:
            investor = CompanyUser.objects.get(id=investor_company_user_id)
        except CompanyUser.DoesNotExist:
            self.stdout.write('No Investor Company User Found with ID: ' + investor_company_user_id)
            return

        try:
            InvestorAdvisor.objects.create(advisor=advisor, investor=investor)
        except Exception as err:
            self.stdout.write('Error:' + err.args[0])
            return

        self.stdout.write('Created Successfully!')
