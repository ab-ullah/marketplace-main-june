import random
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from api.investors.models import FundOrder, FundInvestor


class CompleteOrderService:
    def __init__(self, order: FundOrder):
        self.order = order
        self.investor = order.investor
        self.fund = order.fund

    def get_create_fund_investor_instance(self) -> FundInvestor:
        fund_investor, _ = FundInvestor.objects.get_or_create(
            investor=self.investor,
            fund=self.fund
        )
        return fund_investor

    def create_update_fund_investor(self):
        fund_investor = self.get_create_fund_investor_instance()
        fund_investor.purchase_price = 1
        fund_investor.commitment_amount += self.order.approved_allocation
        fund_investor.pending_distributions += self.order.approved_allocation

        if self.order.requested_allocation > 0:
            leverage_used = float(self.order.approved_allocation) - float(self.order.requested_allocation)
            if leverage_used > 0:
                fund_investor.leverage_used += Decimal(leverage_used)

        fund_investor.save()

    def update_fund_count(self):
        self.fund.sold += self.order.approved_allocation
        self.fund.existing_investors += self.order.approved_allocation
        self.fund.unsold -= self.order.approved_allocation
        self.fund.save()

    def complete(self):
        self.create_update_fund_investor()
        self.update_fund_count()
