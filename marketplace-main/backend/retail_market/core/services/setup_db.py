from typing import List

from django.db.transaction import atomic

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.admin_users.services.create_reviewers import CreateReviewerService
from api.cards.config.company_specific_workflows import get_workflow_creator_for_company
from api.cards.default.workflow_types import WorkflowTypes
from api.cards.default.workflows import create_workflow_for_company
from api.companies.models import Company
from api.companies.services.company_service import CompanyService
from api.eligibility_criteria.management.commands.create_block_categories import CATEGORIES
from api.eligibility_criteria.models import BlockCategory
from api.eligibility_criteria.services.create_company_blocks import CreateCompanyBlocksService
from api.feature_flags.models import Feature, CompanyFeatureFlag
from api.fund_marketing_pages.services.create_icons import CreateIconService
from api.geographics.data.countries import COUNTRIES
from api.geographics.models import Country, USState
from api.geographics.data.us_states import US_STATES
from api.geographics.services.create_company_regions import CreateCompanyRegionsService
from api.geographics.services.create_id_document_types_by_country import CreateIdDocumentTypesService
from api.tax_records.services.load_tax_forms import CreateCompanyTaxFormsService


class SetupDbService:
    def __init__(
            self,
            company_name: str,
            admin_emails: List[str],
            knowledgeable_reviewer_emails: List[str],
            financial_reviewer_emails: List[str]
    ):
        self.company_name = company_name
        self.company = self.get_company()
        self.admin_emails = admin_emails
        self.knowledgeable_reviewer_emails = knowledgeable_reviewer_emails
        self.financial_reviewer_emails = financial_reviewer_emails

    def get_company(self):
        return Company.objects.get(name__iexact=self.company_name)

    def create_currencies(self):
        CompanyService.create_company_currencies(company=self.company)

    @staticmethod
    def create_countries():
        for country in COUNTRIES:
            Country.objects.get_or_create(
                name=country['country'],
                iso_code=country['abbreviation']
            )

    @staticmethod
    def create_states():
        for state in US_STATES:
            USState.objects.get_or_create(
                name=state['name'],
                iso_code=state['abbreviation']
            )

    def create_regions(self):
        CreateCompanyRegionsService(company=self.company).create_regions()

    def create_admins(self):
        for user_email in self.admin_emails:
            CreateAdminUserService(
                email=user_email,
                company_name=self.company_name
            ).create()

    def create_reviewers(self):
        for email in self.knowledgeable_reviewer_emails:
            CreateReviewerService(email=email, company_name=self.company_name).create_knowledgeable_reviewer()

        for email in self.financial_reviewer_emails:
            CreateReviewerService(email=email, company_name=self.company_name).create_financial_reviewer()

    def create_block_categories(self):
        for index, category in enumerate(CATEGORIES):
            BlockCategory.objects.get_or_create(
                name=category,
                position=index + 1,
                company=self.company
            )

    def create_eligibility_criteria_blocks(self):
        CreateCompanyBlocksService(company=self.company).create()

    @staticmethod
    def create_icons():
        CreateIconService.create()

    def create_kyc_workflows(self):
        company = self.company
        kyc_workflow_creator = get_workflow_creator_for_company(company=company)
        kyc_workflow_creator(company=company)

    @staticmethod
    def create_id_document_types():
        CreateIdDocumentTypesService.create()

    def create_tax_forms(self):
        CreateCompanyTaxFormsService(company=self.company).create()

    def create_feature_flags(self):
        features = Feature.objects.all()
        for feature in features:
            qs = CompanyFeatureFlag.objects.filter(company=self.company, feature=feature)
            if not qs.exists():
                CompanyFeatureFlag.objects.create(company=self.company, feature=feature)

    def process(self):
        with atomic():
            self.create_admins()
            self.create_reviewers()
            self.create_currencies()
            self.create_countries()
            self.create_states()
            self.create_regions()
            self.create_block_categories()
            self.create_eligibility_criteria_blocks()
            self.create_icons()
            self.create_kyc_workflows()
            self.create_id_document_types()
            self.create_tax_forms()
            self.create_feature_flags()
