from rest_framework.test import APITestCase

from api.cards.models import Workflow
from api.currencies.models import Currency
from api.eligibility_criteria.models import BlockCategory
from api.geographics.models import Region
from api.partners.tests.factories import CompanyFactory
from api.tax_records.models import TaxForm
from core.services.setup_db import SetupDbService


class CompanySetupDBTestCase(APITestCase):

    def test_company_creation(self):
        company = CompanyFactory()
        SetupDbService(
            company_name=company.name,
            admin_emails=[],
            financial_reviewer_emails=[],
            knowledgeable_reviewer_emails=[]
        ).process()
        self.assertGreater(Currency.objects.filter(company=company).count(), 0)
        self.assertGreater(Region.objects.filter(company=company).count(), 0)
        self.assertGreater(BlockCategory.objects.filter(company=company).count(), 0)
        self.assertGreater(Workflow.objects.filter(company=company).count(), 0)
        self.assertGreater(TaxForm.objects.filter(company=company).count(), 0)
