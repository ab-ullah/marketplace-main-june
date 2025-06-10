from django.core.management.base import BaseCommand

from api.cards.riverside.create_workflows import create_riverside_workflows_for_company
from api.companies.models import Company
from api.page_configs.models import CustomTextConfig


class Command(BaseCommand):
    help = 'Setup Riverside KYC and eligibility text updates'

    def handle(self, *args, **options):
        company = Company.objects.get(name__iexact='riverside')
        create_riverside_workflows_for_company(company=company)
        CustomTextConfig.objects.update_or_create(
            company=company,
            defaults={'custom_domicile_text': 'Where are you domiciled?'}
        )
