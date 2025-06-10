import copy
from django.utils import timezone

from api.companies.models import Company
from api.eligibility_criteria.constants.conditions import AND_CONDITION
from api.eligibility_criteria.models import FundEligibilityCriteria, FundCriteriaCountry, FundCriteriaRegion, \
    CriteriaBlock, CriteriaBlockConnector
from api.eligibility_criteria.services.get_company_final_step_text import get_payload
from api.geographics.models import Region, Country
from api.workflows.models import WorkFlow


class CreateEligibilityCriteriaService:
    def __init__(self, validated_data):
        self.validated_data = validated_data

    @staticmethod
    def create_regions_countries(
            fund_criteria: FundEligibilityCriteria,
            country_region_codes,
            company: Company,
            update: bool = False
    ):
        country_codes = []
        region_codes = []
        for code in country_region_codes:
            if code.startswith('RG|'):
                region_code = code.split('RG|')[-1]
                region_codes.append(region_code)
            else:
                country_codes.append(code)

        if update:
            FundCriteriaCountry.objects.filter(
                fund_criteria=fund_criteria
            ).exclude(country__iso_code__in=country_codes).delete()
            FundCriteriaRegion.objects.filter(
                fund_criteria=fund_criteria
            ).exclude(region__region_code__in=region_codes).delete()

        countries = Country.objects.filter(iso_code__in=country_codes)
        regions = Region.objects.filter(region_code__in=region_codes, company=company)

        for country in countries:
            FundCriteriaCountry.objects.get_or_create(
                fund_criteria=fund_criteria,
                country=country
            )

        for region in regions:
            FundCriteriaRegion.objects.get_or_create(
                fund_criteria=fund_criteria,
                region=region
            )

    @staticmethod
    def create_final_step_block(fund_criteria: FundEligibilityCriteria):
        payload = get_payload(company=fund_criteria.fund.company)
        return CriteriaBlock.objects.create(
            criteria=fund_criteria,
            is_final_step=True,
            is_smart_block=fund_criteria.is_smart_criteria,
            payload=payload
        )

    @staticmethod
    def create_user_documents_block(fund_criteria: FundEligibilityCriteria):
        return CriteriaBlock.objects.create(
            criteria=fund_criteria,
            is_user_documents_step=True,
            is_smart_block=fund_criteria.is_smart_criteria
        )

    @staticmethod
    def create_country_block(fund_criteria: FundEligibilityCriteria):
        return CriteriaBlock.objects.create(
            criteria=fund_criteria,
            is_country_selector=True,
            is_smart_block=fund_criteria.is_smart_criteria,
            position=1
        )

    @staticmethod
    def create_connector(from_block, to_block):
        CriteriaBlockConnector.objects.create(
            from_block=from_block,
            to_block=to_block,
            condition=AND_CONDITION

        )

    def create_initial_blocks(self, fund_criteria: FundEligibilityCriteria):
        final_block = self.create_final_step_block(fund_criteria=fund_criteria)
        user_documents_block = self.create_user_documents_block(fund_criteria=fund_criteria)
        country_block = self.create_country_block(fund_criteria=fund_criteria)
        self.create_connector(from_block=user_documents_block, to_block=final_block)
        if not fund_criteria.is_smart_criteria:
            self.create_connector(from_block=country_block, to_block=user_documents_block)

    def create_workflow(self, criteria_name):
        name = f'{criteria_name} criteria review'
        return WorkFlow.objects.create(
            name=name,
            company=self.validated_data['created_by'].company,
            created_by=self.validated_data['created_by'],
            workflow_type=WorkFlow.WorkFlowTypeChoices.REVIEW.value,
            module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value
        )

    def create(self):
        validated_data = self.validated_data
        country_region_codes = validated_data.pop('country_region_codes')
        fund_criteria = FundEligibilityCriteria.objects.create(
            **validated_data,
            last_modified=timezone.now(),
        )

        self.create_regions_countries(
            fund_criteria=fund_criteria,
            country_region_codes=country_region_codes,
            company=self.validated_data['fund'].company
        )

        workflow = self.create_workflow(criteria_name=fund_criteria.name)
        fund_criteria.workflow = workflow
        fund_criteria.save()
        self.create_initial_blocks(fund_criteria=fund_criteria)
        return fund_criteria
