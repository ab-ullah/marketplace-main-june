import logging

from django.core.management.base import BaseCommand

from api.activities.models import TransactionDetail
from api.agreements.models import FundAgreementDocument
from api.capital_calls.models import CapitalCall, FundCapitalCall
from api.documents.models import FundDocument, InvestorDocument
from api.funds.models import Fund, FundNav, FundInterest
from api.investors.models import FundInvestor, FundOrder
from api.notifications.models import UserNotification

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Move investment related info from one fund to another'

    def add_arguments(self, parser):
        parser.add_argument('--source_fund_external_id', type=str, action='store')
        parser.add_argument('--destination_fund_external_id', type=str, action='store')

    def handle(self, *args, **options):
        source_fund_external_id = options.get('source_fund_external_id')
        destination_fund_external_id = options.get('destination_fund_external_id')

        source_fund = Fund.objects.get(external_id=source_fund_external_id)
        destination_fund = Fund.objects.get(external_id=destination_fund_external_id)

        if source_fund.applications.count() > 0:
            raise Exception("Source fund cant have applications")

        TransactionDetail.objects.filter(fund=source_fund).update(fund=destination_fund)
        FundInvestor.objects.filter(fund=source_fund).update(fund=destination_fund)
        FundOrder.objects.filter(fund=source_fund).update(fund=destination_fund)

        CapitalCall.objects.filter(fund=source_fund).update(fund=destination_fund)
        FundCapitalCall.objects.filter(fund=source_fund).update(fund=destination_fund)
        UserNotification.objects.filter(fund=source_fund).update(fund=destination_fund)

        FundDocument.objects.filter(fund=source_fund).update(fund=destination_fund)
        InvestorDocument.objects.filter(fund=source_fund).update(fund=destination_fund)
        FundNav.objects.filter(fund=source_fund).update(fund=destination_fund)
        FundInterest.objects.filter(fund=source_fund).update(fund=destination_fund)
        FundAgreementDocument.objects.filter(fund=source_fund).update(fund=destination_fund)

        temp_partner_id = 'temp-partner-id'

        source_partner_id = source_fund.partner_id
        source_investment_product_code = source_fund.investment_product_code
        source_raw_investment_product_code = source_fund.raw_investment_product_code

        destination_partner_id = destination_fund.partner_id
        destination_investment_product_code = destination_fund.investment_product_code
        destination_raw_investment_product_code = destination_fund.raw_investment_product_code

        source_fund.partner_id = temp_partner_id
        source_fund.investment_product_code = None
        source_fund.save()

        destination_fund.partner_id = source_partner_id
        destination_fund.investment_product_code = source_investment_product_code
        destination_fund.raw_investment_product_code = source_raw_investment_product_code
        destination_fund.save()

        source_fund.partner_id = destination_partner_id
        source_fund.investment_product_code = destination_investment_product_code
        source_fund.raw_investment_product_code = destination_raw_investment_product_code
        source_fund.save()

