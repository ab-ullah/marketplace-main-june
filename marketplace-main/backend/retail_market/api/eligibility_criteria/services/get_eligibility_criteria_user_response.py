import logging

from django.db.models import Q, Prefetch
from slugify import slugify

from api.applications.models import Application
from api.applications.utils import get_user_application, update_or_create_user_application
from api.cards.models import Workflow as KYCWorkflow
from api.cards.utils import get_fund_kyc_workflow_name, get_workflow_name_by_fund
from api.companies.models import CompanyUser
from api.constants.kyc_investor_types import KYCInvestorType
from api.eligibility_criteria.models import FundEligibilityCriteria, EligibilityCriteriaResponse, CriteriaBlockResponse, \
    CriteriaBlock, InvestmentAmount
from api.eligibility_criteria.serializers import FundEligibilityCriteriaDetailSerializer, CriteriaResponseSerializer
from api.applications.serializers import ApplicationSerializer
from api.eligibility_criteria.services.eligibility_criteria_preview import CriteriaPreviewService
from api.funds.models import Fund
from api.geographics.models import Country
from api.kyc_records.models import KYCRecord
from api.libs.utils.user_name import get_display_name
from api.users.models import RetailUser
from api.workflows.models import WorkFlow
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService

logger = logging.getLogger(__name__)


class FundEligibilityCriteriaPreviewResponse:
    def __init__(self, fund: Fund, user: RetailUser, country: Country, vehicle_type: str, applicant_info: dict):
        self.fund = fund
        self.user = user
        self.company_user = self.get_company_user()
        self.country = country
        self.vehicle_type = vehicle_type
        self.applicant_info = applicant_info
        transferred_application = self.get_transferred_application()
        self.transferred_application_id = transferred_application.id if transferred_application else None

    def get_company_user(self):
        try:
            return CompanyUser.objects.get(
                company=self.fund.company,
                user=self.user
            )
        except CompanyUser.DoesNotExist:
            return None

    def get_eligibility_criteria(self):
        try:
            return FundEligibilityCriteria.objects.filter(
                fund_id=self.fund.id,
                status=FundEligibilityCriteria.CriteriaStatusChoice.PUBLISHED.value,
                fund__accept_applications=True
            ).filter(
                Q(criteria_countries__country=self.country) | Q(criteria_regions__region__countries=self.country)
            ).prefetch_related(
                Prefetch('criteria_blocks', queryset=CriteriaBlock.objects.filter(auto_completed=False))
            ).prefetch_related(
                'criteria_blocks__block'
            ).prefetch_related(
                'criteria_blocks__criteria_block_documents'
            ).prefetch_related(
                'criteria_blocks__criteria_block_documents__document'
            ).latest('created_at')
        except FundEligibilityCriteria.DoesNotExist:
            return None

    def populate_country_vehicle_response(
            self,
            eligibility_criteria: FundEligibilityCriteria,
            criteria_response: EligibilityCriteriaResponse
    ):
        country_block = eligibility_criteria.criteria_blocks.filter(is_country_selector=True).first()
        if not country_block:
            return

        CriteriaBlockResponse.objects.update_or_create(
            criteria_response=criteria_response,
            block_id=country_block.id,
            defaults={
                'response_json': {
                    'country': {'value': self.country.iso_code, 'label': self.country.name},
                    'vehicle_type': {'value': self.vehicle_type}
                }
            }
        )

    def get_transferred_application(self):
        try:
            application = get_user_application({
                'user_id': self.user.id,
                'company': self.fund.company,
                'fund__external_id': self.fund.external_id
            })

            if application.is_transferred:
                return application

        except Application.DoesNotExist:
            return None

        return None

    def create_criteria_response_workflow(
            self,
            fund: Fund,
            company_user: CompanyUser,
            eligibility_criteria: FundEligibilityCriteria
    ):
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=fund,
            company_user=company_user,
            transferred_application_id=self.transferred_application_id
        )
        return on_boarding_workflow_service.get_or_create_eligibility_workflow(
            eligibility_criteria=eligibility_criteria
        )

    def get_parent_workflow(self):
        return UserOnBoardingWorkFlowService(
            fund=self.fund,
            company_user=self.company_user,
            transferred_application_id=self.transferred_application_id
        ).get_or_create_parent_workflow()

    def create_kyc_record(self, workflow: KYCWorkflow):
        kyc_record, _ = KYCRecord.objects.update_or_create(
            user=self.user,
            company=self.fund.company,
            workflow=workflow,
            kyc_investor_type=KYCInvestorType[self.vehicle_type],
            defaults={
                'first_name': self.applicant_info['first_name'],
                'last_name': self.applicant_info['last_name'],
                'occupation': self.applicant_info.get('job_title'),
                'eligibility_country': self.country,
                'department': self.applicant_info['department']['value'] if self.applicant_info.get('department') else None,
                'job_band': self.applicant_info['job_band']['value'] if self.applicant_info.get('job_band') else None,
                'job_title': self.applicant_info.get('job_title'),
                'investor_location': self.country
            }
        )
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=self.fund,
            company_user=self.company_user,
            transferred_application_id=self.transferred_application_id
        )
        workflow = on_boarding_workflow_service.get_or_create_kyc_workflow(kyc_record=kyc_record)

        try:
            application = get_user_application({
                'user_id': self.user.id,
                'company': self.fund.company,
                'fund__external_id': self.fund.external_id
            })
            application.workflow = workflow.parent
            application.save()

        except Application.DoesNotExist:
            pass

        return kyc_record

    def create_application(
            self,
            kyc_record: KYCRecord,
            eligibility_criteria_response: EligibilityCriteriaResponse,
            workflow: WorkFlow
    ):

        values = {
            'kyc_record': kyc_record,
            'eligibility_response': eligibility_criteria_response,
            'workflow': workflow,
            'investment_amount': eligibility_criteria_response.investment_amount
        }
        application, created = update_or_create_user_application(fund=self.fund, user=self.user, values=values)

        if application.tax_record != kyc_record.tax_record:
            application.tax_record = kyc_record.tax_record
            application.save(update_fields=['tax_record'])

        if application.payment_detail != kyc_record.payment_detail:
            if not kyc_record.payment_detail:
                kyc_record.payment_detail = application.payment_detail
                kyc_record.save(update_fields=['payment_detail'])
            else:
                application.payment_detail = kyc_record.payment_detail
                application.save(update_fields=['payment_detail'])

        if application.defaults_from_fund_file:
            if not kyc_record.office_location:
                office_location = application.defaults_from_fund_file.get('office_location')
                if office_location:
                    try:
                        country = Country.objects.get(id=office_location)
                        kyc_record.office_location = country
                        kyc_record.save(update_fields=['office_location'])
                    except Country.DoesNotExist:
                        logger.warning(f'Cant find country with id {country}')

        return application

    def get_application_investment_amount(self):
        try:
            application = get_user_application({
                'user_id': self.user.id,
                'company': self.fund.company,
                'fund__external_id': self.fund.external_id
            })

            return application.investment_amount
        except Application.DoesNotExist:
            return None

    def get_investor_type(self):
        if self.vehicle_type == KYCInvestorType.INDIVIDUAL.name:
            return KYCInvestorType.INDIVIDUAL.name
        elif self.vehicle_type == KYCInvestorType.PRIVATE_COMPANY.name:
            return KYCInvestorType.PRIVATE_COMPANY.name
        elif self.vehicle_type == KYCInvestorType.LIMITED_PARTNERSHIP.name:
            return KYCInvestorType.LIMITED_PARTNERSHIP.name
        elif self.vehicle_type == KYCInvestorType.TRUST.name:
            return KYCInvestorType.TRUST.name

    def create_workflow_name(self, eligibility_criteria: FundEligibilityCriteria):
        username = get_display_name(self.user)
        return f'{self.fund.name}/{eligibility_criteria.name}/{username}'

    def get_kyc_workflow(self):
        fund = self.fund
        company_workflow = get_fund_kyc_workflow_name(company=fund.company, vehicle_type=self.get_investor_type())
        fund_specific_workflow = get_workflow_name_by_fund(fund=fund, vehicle_type=self.get_investor_type())

        try:
            return KYCWorkflow.objects.get(
                fund=fund,
                slug=slugify(fund_specific_workflow),
                type=KYCWorkflow.FLOW_TYPES.KYC.value
            )
        except KYCWorkflow.DoesNotExist:
            return KYCWorkflow.objects.get(
                company=fund.company,
                slug=slugify(company_workflow),
                type=KYCWorkflow.FLOW_TYPES.KYC.value
            )

    @staticmethod
    def create_investment_amount():
        return InvestmentAmount.objects.create(amount=0)

    @staticmethod
    def get_default_last_position(eligibility_criteria_id):
        try:
            country_selector_block = CriteriaBlock.objects.get(
                criteria=eligibility_criteria_id,
                is_country_selector=True
            )
            return country_selector_block.id
        except:
            return 0

    def un_assign_other_eligibility_response(self, eligibility_response: EligibilityCriteriaResponse):
        user_other_responses = EligibilityCriteriaResponse.objects.filter(
            criteria__fund_id=self.fund.id,
            response_by_id=self.company_user.id
        ).exclude(id=eligibility_response.id)

        if self.transferred_application_id:
            user_other_responses = user_other_responses.filter(application_id=self.transferred_application_id)

        if not user_other_responses.exists():
            return

        for user_response in user_other_responses:
            if user_response.workflow:
                user_response.workflow.parent = None
                user_response.workflow.save(update_fields=['parent'])

    def get_user_criteria_response(self, eligibility_criteria: FundEligibilityCriteria):
        workflow = self.get_kyc_workflow()
        kyc_record = self.create_kyc_record(workflow=workflow)
        investment_amount = self.get_application_investment_amount()

        is_create_user_response = False
        transferred_application = self.get_transferred_application()

        if transferred_application:
            try:
                user_response = EligibilityCriteriaResponse.objects.get(
                    criteria_id=eligibility_criteria.id,
                    response_by_id=self.company_user.id,
                    application=transferred_application
                )
            except EligibilityCriteriaResponse.DoesNotExist:
                is_create_user_response = True

        else:
            try:
                user_response = EligibilityCriteriaResponse.objects.filter(
                    criteria_id=eligibility_criteria.id,
                    response_by_id=self.company_user.id
                ).prefetch_related(
                    'user_block_responses'
                ).prefetch_related(
                    'user_block_responses__response_block_documents'
                ).prefetch_related(
                    'user_block_responses__block'
                ).prefetch_related(
                    'user_block_responses__block__block'
                ).latest('created_at')
                user_response.last_position = self.get_default_last_position(eligibility_criteria_id=eligibility_criteria.id)
                user_response.save(update_fields=['last_position'])
                if not user_response.kyc_record:
                    user_response.kyc_record = kyc_record
                    user_response.save(update_fields=['kyc_record'])
            except EligibilityCriteriaResponse.DoesNotExist:
                is_create_user_response = True

        if is_create_user_response:
            if not investment_amount:
                investment_amount = self.create_investment_amount()
            user_response = EligibilityCriteriaResponse.objects.create(
                criteria_id=eligibility_criteria.id,
                response_by_id=self.company_user.id,
                kyc_record=kyc_record,
                investment_amount=investment_amount,
                last_position=self.get_default_last_position(eligibility_criteria_id=eligibility_criteria.id)
            )
            self.populate_country_vehicle_response(
                eligibility_criteria=eligibility_criteria,
                criteria_response=user_response
            )

        self.un_assign_other_eligibility_response(eligibility_response=user_response)

        if not user_response.workflow:
            user_response.workflow = self.create_criteria_response_workflow(
                fund=self.fund,
                company_user=self.company_user,
                eligibility_criteria=eligibility_criteria
            )
            user_response.save(update_fields=['workflow'])
        if not user_response.workflow.parent:
            user_response.workflow.parent = self.get_parent_workflow()
            user_response.workflow.save(update_fields=['parent'])

        application = self.create_application(
            kyc_record=kyc_record,
            eligibility_criteria_response=user_response,
            workflow=user_response.workflow.parent
        )

        if not application.eligibility_response.application:
            application.eligibility_response.application = application
            application.eligibility_response.save(update_fields=['application'])

        return user_response, CriteriaResponseSerializer(user_response).data, ApplicationSerializer(application).data

    @staticmethod
    def get_criteria_preview(eligibility_criteria: FundEligibilityCriteria):
        serializer = FundEligibilityCriteriaDetailSerializer(eligibility_criteria)
        criteria_details = serializer.data
        preview_service = CriteriaPreviewService(data=criteria_details)
        return preview_service.process(add_intro=False)

    def process(self):
        if not self.company_user:
            return None

        eligibility_criteria = self.get_eligibility_criteria()
        if not eligibility_criteria:
            return {'error': 'No Matching criteria found'}
        criteria_details = self.get_criteria_preview(eligibility_criteria=eligibility_criteria)
        user_response, parsed_response_data, application_data = self.get_user_criteria_response(
            eligibility_criteria=eligibility_criteria)
        return {
            'criteria_preview': criteria_details,
            'user_response': parsed_response_data,
            'application': application_data
        }
