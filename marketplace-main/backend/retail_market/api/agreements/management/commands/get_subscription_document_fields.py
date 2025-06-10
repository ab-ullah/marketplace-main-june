import json
import logging

from django.core.management.base import BaseCommand

from api.agreements.services.application_data.aml_kyc_details import AmlKycOptions
from api.agreements.services.application_data.applicant_details import ApplicantOptions
from api.agreements.services.application_data.application_details import ApplicationOptions
from api.agreements.services.application_data.eligibility_criteria_details import EligibilityCriteriaOptions
from api.agreements.services.application_data.investment_amount_details import InvestmentAmountOptions
from api.agreements.services.application_data.payment_details import PaymentDetailOptions
from api.agreements.services.application_data.tax_details import TaxDetailOptions
from api.agreements.services.application_data.fund_document_details import FundDocumentsDetails
from api.funds.models import Fund

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Get list of subscription document fields'

    def add_arguments(self, parser):
        parser.add_argument('--fund_slug', type=str, action='store')

    def handle(self, *args, **options):
        fund_slug = options.get('fund_slug')
        fund = Fund.objects.get(slug=fund_slug)
        eligibility_criteria_fields = EligibilityCriteriaOptions().get_fields(fund=fund)
        aml_kyc_fields = AmlKycOptions().get_fields()
        banking_detail_fields = PaymentDetailOptions().get_fields()
        tax_detail_fields = TaxDetailOptions().get_fields()
        investment_amount_fields = InvestmentAmountOptions().get_fields()
        application_fields = ApplicationOptions().get_fields()
        gp_signer_fields = FundDocumentsDetails().get_document_fields()
        applicant_fields = ApplicantOptions().get_fields()

        available_fields = {
            'banking_details': banking_detail_fields,
            'tax_details': tax_detail_fields,
            'aml_kyc_details': aml_kyc_fields,
            'eligibility_criteria_details': eligibility_criteria_fields,
            'investment_amount_details': investment_amount_fields,
            'application_details': application_fields,
            'gp_signer_details': gp_signer_fields,
            'applicant_details': applicant_fields,
        }
        return print(json.dumps(available_fields, indent=4, sort_keys=True))
