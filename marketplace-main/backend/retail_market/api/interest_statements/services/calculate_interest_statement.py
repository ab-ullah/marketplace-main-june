from datetime import date, timedelta
from typing import Optional, List

from api.activities.models import TransactionDetail
from api.interest_statements.constants.interest_rates import INTEREST_RATE_BY_YEAR, CURRENCY_INTEREST_RATE_BY_YEAR
from api.interest_statements.constants.precision import FLOAT_DECIMAL_PRECISION
from api.interest_statements.services.data_classes import SegmentInfo, QuarterInfo, InterestDetail
from api.interest_statements.services.merge_transactions import merge_transactions
from api.libs.utils.date_util import DateUtil


class CalculateInterestStatementService:
    def __init__(self,
                 investor_id: int,
                 fund_id: Optional[int] = None,
                 start_date: Optional[date] = None,
                 end_date: Optional[date] = None,
                 fund_currency: Optional[str] = None
                 ):
        self.investor_id = investor_id
        self.fund_id = fund_id
        self.start_date = start_date
        self.end_date = end_date
        self.fund_currency = fund_currency
        self.segments = []  # type: List[SegmentInfo]
        self.quarters = []

    def get_transactions_query(self):
        query = TransactionDetail.objects.filter(
            investor_id=self.investor_id
        )
        if self.fund_id:
            query = query.filter(fund_id=self.fund_id)
        if self.start_date:
            query = query.filter(effective_date__gte=self.start_date)
        if self.end_date:
            query = query.filter(effective_date__lte=self.end_date)

        return query.order_by('effective_date', 'partner_id')

    def calculate_segment_interest(self, segment: SegmentInfo):
        days = (segment.to_date - segment.from_date).days + 1
        segment.days = days
        year = segment.from_date.year
        if self.fund_currency and self.fund_currency in CURRENCY_INTEREST_RATE_BY_YEAR:
            interest_rate = CURRENCY_INTEREST_RATE_BY_YEAR[self.fund_currency].get(year)
        else:
            interest_rate = INTEREST_RATE_BY_YEAR.get(year)
        if interest_rate:
            interest_for_period = (days / 365) * float(interest_rate) * (
                    float(segment.loan_balance) + float(segment.brought_forward_interest)
            )
            segment.interest = round(interest_for_period, FLOAT_DECIMAL_PRECISION)
        segment.brought_forward_interest = round(segment.brought_forward_interest, FLOAT_DECIMAL_PRECISION)
        segment.loan_balance = round(segment.loan_balance, FLOAT_DECIMAL_PRECISION)
        return segment

    def process_previous_segment(self, next_transaction_date):
        if not self.segments:
            if self.quarters:
                return self.quarters[-1].segments[-1]
            return

        previous_segment = self.segments[-1]
        previous_segment.to_date = next_transaction_date
        return self.calculate_segment_interest(segment=previous_segment)

    def initiate_quarter(
            self,
            segment_date: date,
            brought_forward_interest: float
    ):
        if not (self.quarters and not self.segments):
            return
        previous_segment = self.quarters[-1].segments[-1]
        segment = SegmentInfo(
            loan_balance=previous_segment.loan_balance if previous_segment else 0,
            brought_forward_interest=brought_forward_interest,
            from_date=DateUtil.start_of_quarter(for_date=segment_date),
            to_date=segment_date
        )
        segment = self.calculate_segment_interest(segment=segment)
        self.segments.append(segment)

    def complete_quarter(self):
        if not self.segments:
            return
        last_segment = self.segments[-1]
        quarter_end = DateUtil.end_of_quarter(for_date=last_segment.from_date)
        quarter_name = DateUtil.get_quarter_name(last_segment.from_date)
        self.process_previous_segment(next_transaction_date=quarter_end)
        interest_for_period = sum(segment.interest for segment in self.segments)

        self.quarters.append(QuarterInfo(
            quarter=quarter_name,
            year=last_segment.from_date.year,
            total_interest=round(interest_for_period, FLOAT_DECIMAL_PRECISION),
            segments=[segment for segment in self.segments]
        ))
        self.segments = []

    def process(self):
        transactions_query = self.get_transactions_query()
        interest_detail = InterestDetail(
            brought_forward_interest=0,
            running_interest=0,
            paid_interest=0,
            quarter_start_interest=0
        )
        current_quarter = None
        merged_transactions = merge_transactions(transactions=transactions_query)
        for transaction in merged_transactions:
            quarter_name = DateUtil.get_quarter_name(for_date=transaction.effective_date)
            if quarter_name != current_quarter:
                self.complete_quarter()
                interest_detail.set_brought_forward_interest(interest_detail.get_unpaid_interest())
                interest_detail.set_quarter_start_interest(interest_detail.get_unpaid_interest())
                current_quarter = quarter_name

            if transaction.is_interest_repay_transaction:
                interest_detail.pay_interest(amount=transaction.actual_transaction_amount)
                continue

            if transaction.is_interest_transaction:
                interest_detail.add_running_interest(amount=transaction.actual_transaction_amount)
                continue

            previous_segment = self.process_previous_segment(next_transaction_date=transaction.effective_date)

            current_segment = SegmentInfo(
                loan_balance=previous_segment.loan_balance if previous_segment else 0,
                brought_forward_interest=interest_detail.brought_forward_interest,
                from_date=transaction.effective_date,
            )
            if self.quarters and not self.segments:
                self.initiate_quarter(
                    segment_date=transaction.effective_date,
                    brought_forward_interest=interest_detail.quarter_start_interest
                )
            if transaction.is_loan_repay_transaction:
                current_segment.loan_balance -= transaction.actual_transaction_amount
                current_segment.from_date = transaction.effective_date + timedelta(days=1)

            elif transaction.is_contribution_loan_transaction:
                current_segment.loan_balance += transaction.actual_transaction_amount
                if self.segments:
                    self.segments[-1].to_date = transaction.effective_date - timedelta(days=1)
                    self.calculate_segment_interest(segment=self.segments[-1])

            self.segments.append(current_segment)
        self.complete_quarter()
        return self.quarters
