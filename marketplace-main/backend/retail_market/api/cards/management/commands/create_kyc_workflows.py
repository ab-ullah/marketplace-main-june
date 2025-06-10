from django.core.management.base import BaseCommand

from api.cards.config.company_specific_workflows import get_workflow_creator_for_company
from api.companies.models import Company


class Command(BaseCommand):
    help = 'Create Initial KYC Workflows for existing COMPANIES'

    def handle(self, *args, **options):
        for company in Company.objects.iterator():
            kyc_workflow_creator = get_workflow_creator_for_company(company=company)
            kyc_workflow_creator(company=company)
