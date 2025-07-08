import io
import uuid
from copy import deepcopy

from django.apps import apps
from django.contrib.auth.models import Group
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.admin_users.models import AdminUser
from api.admin_users.services.create_reviewers import CreateReviewerService
from api.agreements.models import ApplicantAgreementDocument
from api.cards.default.workflow_types import WorkflowTypes
from api.cards.default.workflows import create_workflow_for_company
from api.companies.models import Company
from api.currencies.models import Currency
from api.documents.models import FundDocument
from api.eligibility_criteria.blocks_data.any_region_blocks import ANY_REGION_BLOCKS
from api.eligibility_criteria.models import BlockCategory, Block
from api.eligibility_criteria.serializers import CriteriaBlockCreateSerializer
from api.eligibility_criteria.services.create_company_blocks import BLOCK_CONTAINERS
from api.eligibility_criteria.services.create_eligibility_criteria import CreateEligibilityCriteriaService
from api.eligibility_criteria.services.get_eligibility_criteria_user_response import \
    FundEligibilityCriteriaPreviewResponse
from api.eligibility_criteria.tests.factories import (
    FundEligibilityCriteriaResponseFactory, EligibilityCriteriaBlockResponseFactory, FundEligibilityCriteriaFactory,
    ApplicationFactory
)
from api.geographics.data.countries import COUNTRIES
from api.geographics.models import Country, Region
from api.libs.sidecar_blocks.document_store.document_api import DocumentData
from api.partners.tests.factories import (
    FundFactory, CurrencyFactory, UserFactory, CompanyFactory, CompanyUserFactory, WorkFlowFactory, AdminUserFactory,
    CompanyFundVehicleFactory
)
from api.tax_records.tests.factories import DocumentFactory
from api.users.constants import ADMIN_GROUP_NAME

from django.db import connection
from django.db.migrations.executor import MigrationExecutor


class Migrator:
    def __init__(self, conn=connection):
        self.apps = None
        self.executor = MigrationExecutor(conn)

    def migrate(self, app_label: str, migration: str):
        target = [(app_label, migration)]
        self.executor.loader.build_graph()
        self.executor.migrate(target)
        self.apps = self.executor.loader.project_state(target).apps


class BaseTestCase(APITestCase):

    def create_multi_user(self):
        self.create_company()
        self.create_countries()
        self.create_blocks(company=self.company)
        self.user_1 = UserFactory()
        self.user_2 = UserFactory()
        self.admin_user = AdminUserFactory(company=self.company)
        self.company_user_1 = CompanyUserFactory(user=self.user_1, company=self.company)
        self.company_user_2 = CompanyUserFactory(user=self.user_2, company=self.company)

    def create_user(self):
        self.create_company()
        self.create_countries()
        self.create_blocks(company=self.company)
        self.user = UserFactory()
        self.admin_user = AdminUserFactory(company=self.company)
        self.company_user = CompanyUserFactory(user=self.user, company=self.company)

    def create_company(self):
        self.company = CompanyFactory()

    @staticmethod
    def create_countries():
        countries_to_create = [
            Country(name=country['country'], iso_code=country['abbreviation'])
            for country in COUNTRIES
        ]

        existing_country_names = set(Country.objects.values_list('name', flat=True))
        countries_to_create = [
            country for country in countries_to_create
            if country.name not in existing_country_names
        ]

        Country.objects.bulk_create(countries_to_create)

    def create_currency(self):
        self.currency = CurrencyFactory()

    def get_currency(self) -> Currency:
        return self.currency

    def setup_fund(self, company) -> None:
        self.create_fund(company=company)
        self.create_eligibility_criteria_for_fund()

    def create_fund(self, company):
        self.fund = FundFactory(company=company, accept_applications=True)

    def create_card_workflow(self, company):
        for workflow_type in WorkflowTypes:
            create_workflow_for_company(company=company, type=workflow_type)
        self.workflow = create_workflow_for_company(company=company, type=WorkflowTypes.INDIVIDUAL)

    @staticmethod
    def create_workflow(company, admin_user):
        return WorkFlowFactory(
            company=company,
            created_by=admin_user
        )

    def create_application(self, company_user=None, fund=None, kyc_record=None, tax_record=None):
        return ApplicationFactory(
            fund=fund or self.fund,
            company=self.company,
            user=self.user,
            eligibility_response=self.create_eligibility_criteria_user_response(company_user=company_user),
            kyc_record=kyc_record,
            tax_record=tax_record,
            vehicle=CompanyFundVehicleFactory(company=self.company)
        )

    def create_eligibility_criteria_for_fund(self):
        self.fund_eligibility_criteria = FundEligibilityCriteriaFactory(fund=self.fund)

    @staticmethod
    def create_criteria_region_codes(criteria, region_codes_list, company):
        CreateEligibilityCriteriaService.create_regions_countries(
            fund_criteria=criteria,
            country_region_codes=region_codes_list,
            company=company
        )

    def get_eligibility_response_service(self):
        country = Country.objects.get(iso_code__iexact="AL")
        return FundEligibilityCriteriaPreviewResponse(
            self.fund,
            self.user,
            country,
            'INDIVIDUAL',
            {
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'occupation': "Job Title",
                'eligibility_country': country,
                'department': {'label': 'Accounting', 'value': 'accounting'},
                'job_band': {'label': 'M2', 'value': 'M2'},
                'job_title': "Job Title",
                'office_location': country
            }
        )

    def create_eligibility_criteria_user_response(self, company_user=None):
        response_service = self.get_eligibility_response_service()
        kyc_record = response_service.create_kyc_record(self.workflow)

        self.fund_eligibility_criteria_response = FundEligibilityCriteriaResponseFactory(
            criteria=self.fund_eligibility_criteria,
            response_by=company_user or self.company_user,
            kyc_record=kyc_record
        )

        self.fund_eligibility_criteria_block_response = EligibilityCriteriaBlockResponseFactory(
            criteria_response=self.fund_eligibility_criteria_response
        )
        return self.fund_eligibility_criteria_response

    @staticmethod
    def get_headers():
        return {
            "HTTP_AUTHORIZATION": "Bearer Test-123"
        }

    @staticmethod
    def create_block_category(company, name):
        return BlockCategory.objects.get_or_create(
            company=company,
            name__iexact=name,
            defaults={
                'name': name
            }
        )

    def create_blocks(self, company):
        investor_category, _ = self.create_block_category(company, 'investor')
        fund_category, _ = self.create_block_category(company, 'fund')

        for block in ANY_REGION_BLOCKS:
            self.create_block(company=company, category=fund_category, block_data=block)

        for block_container in BLOCK_CONTAINERS:
            for block in block_container:
                self.create_block(company=company, category=fund_category, block_data=block)
                self.create_block(company=company, category=investor_category, block_data=block)

    @staticmethod
    def create_block(company, category, block_data):
        block_data_copy = deepcopy(block_data)
        block_id = block_data_copy['block_id']
        country = None
        region = None

        if country_code := block_data_copy.pop('country_code', None):
            country = Country.objects.get(iso_code__iexact=country_code)

        if region_code := block_data_copy.pop('region_code', None):
            region, _ = Region.objects.get_or_create(region_code=region_code, company=company)

        block_data_copy.update({
            'country': country,
            'region': region
        })

        Block.objects.update_or_create(
            company=company,
            category=category,
            block_id=block_id,
            defaults=block_data_copy
        )

    def get_block_by_str_id(self, str_id: str, company: Company, category_name: str = 'fund') -> Block:
        return Block.objects.get(block_id=str_id, company=company, category__name=category_name)

    def add_block_in_fund_criteria(self, block, criteria):
        return CriteriaBlockCreateSerializer().create({
            'block': block,
            'criteria': criteria
        })

    def create_financial_reviewer(self):
        CreateReviewerService(
            email=self.admin_user.user.email,
            company_name=self.admin_user.company.name
        ).create_financial_reviewer()

    def create_document_path(self):
        config = apps.get_app_config('documents')
        upload_context = config.context
        document_api = config.document_api
        content_type = "application/text"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        document_data = DocumentData(content_type, origin_file_obj)
        document_path = document_api.upload(upload_context, document_data)
        return document_path

    def delete_document(self, document_id: int):
        url = reverse('document-delete', kwargs={'pk': document_id})
        return self.client.delete(url)

    def make_full_access_admin(self, admin_user: AdminUser):
        group, _ = Group.objects.get_or_create(name=ADMIN_GROUP_NAME)
        admin_user.groups.add(group)

    def create_fund_document(self, fund, company=None, require_gp_sign=False, signer=None):
        if not company:
            company = self.company
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=company,
            partner_id=uuid.uuid4().hex
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=fund,
            require_signature=True,
            require_gp_signature=require_gp_sign,
            gp_signer=signer
        )
        return fund_document

    @staticmethod
    def create_applicant_document(fund_document, application):
        return ApplicantAgreementDocument.objects.create(
            agreement_document=fund_document,
            application=application,
            envelope_id=uuid.uuid4().hex
        )
