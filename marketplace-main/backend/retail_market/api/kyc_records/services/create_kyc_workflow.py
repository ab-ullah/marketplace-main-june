from slugify import slugify

from api.cards.utils import get_fund_kyc_workflow_name
from api.constants.kyc_investor_types import KYCInvestorType
from api.funds.models import Fund
from api.cards.models import Workflow as KYCWorkflow


class GetKycWorkflow:
    def __init__(self, fund: Fund, kyc_entity_type):
        self.fund = fund
        self.kyc_entity_type = kyc_entity_type

    def get_investor_type(self):
        return KYCInvestorType(self.kyc_entity_type).name

    def get(self):
        fund = self.fund
        name = get_fund_kyc_workflow_name(company=fund.company, vehicle_type=self.get_investor_type())
        return KYCWorkflow.objects.get(
            company=fund.company,
            slug=slugify(name),
            type=KYCWorkflow.FLOW_TYPES.KYC.value
        )
