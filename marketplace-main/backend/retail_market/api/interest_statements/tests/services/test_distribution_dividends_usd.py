from copy import deepcopy
from datetime import datetime

from dateutil.parser import parse as dt_parse

from api.activities.models import TransactionDetail
from api.interest_statements.services.calculate_interest_statement import CalculateInterestStatementService
from api.interest_statements.tests.data.transaction_details_dividends_usd import TRANSACTION_DETAILS
from api.partners.tests.factories import FundFactory, InvestorFactory
from core.base_tests import BaseTestCase


class InterestStatementServiceTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.fund = FundFactory(company=self.company)
        self.investor = InvestorFactory()
        self.create_transaction_details(fund=self.fund, investor=self.investor)

    def create_transaction_details(self, fund, investor):
        for transaction_detail in TRANSACTION_DETAILS:
            transaction_detail_copy = deepcopy(transaction_detail)
            partner_id = transaction_detail_copy.pop('partner_id')
            TransactionDetail.objects.create(
                fund=fund,
                investor=investor,
                company=self.company,
                effective_date=datetime.strptime(transaction_detail_copy.pop('effective_date'), '%d/%m/%Y'),
                partner_id=f'{partner_id}-f{fund.id}',
                **transaction_detail_copy
            )

    def test_2021_Q4_segments(self):
        interest_statement_calculator = CalculateInterestStatementService(
            investor_id=self.investor.id,
            end_date=dt_parse('2021-12-31')
        )
        quarters = interest_statement_calculator.process()
        self.assertEqual(len(quarters), 1)
        quarter = quarters[0]
        self.assertEqual(quarter.year, 2021)
        self.assertEqual(quarter.quarter, 'Q4 2021')
        self.assertEqual(quarter.total_interest, 68.56)

        self.assertEqual(len(quarter.segments), 1)
        segment = quarter.segments[0]
        self.assertEqual(float(segment.loan_balance), 12999.99)
        self.assertEqual(segment.brought_forward_interest, 0)
        self.assertEqual(segment.from_date, dt_parse('2021-11-07').date())
        self.assertEqual(segment.to_date, dt_parse('2021-12-31').date())
        self.assertEqual(segment.days, 55)
        self.assertEqual(segment.interest, 68.56)

    def test_2022_Q1_segments(self):
        interest_statement_calculator = CalculateInterestStatementService(
            investor_id=self.investor.id,
            end_date=dt_parse('2022-03-31')
        )
        quarters = interest_statement_calculator.process()
        self.assertEqual(len(quarters), 2)
        quarter = quarters[1]
        self.assertEqual(quarter.year, 2022)
        self.assertEqual(quarter.quarter, 'Q1 2022')
        self.assertEqual(quarter.total_interest, 94.67)
        self.assertEqual(len(quarter.segments), 2)

        segment = quarter.segments[0]
        self.assertEqual(float(segment.loan_balance), 12999.99)
        self.assertEqual(segment.brought_forward_interest, 68.56)
        self.assertEqual(segment.from_date, dt_parse('2022-01-01').date())
        self.assertEqual(segment.to_date, dt_parse('2022-01-31').date())
        self.assertEqual(segment.days, 31)
        self.assertEqual(segment.interest, 36.07)

        segment = quarter.segments[1]
        self.assertEqual(float(segment.loan_balance), 11154.62)
        self.assertEqual(segment.from_date, dt_parse('2022-02-01').date())
        self.assertEqual(segment.to_date, dt_parse('2022-03-31').date())
        self.assertEqual(segment.brought_forward_interest, 0)
        self.assertEqual(segment.days, 59)
        self.assertEqual(segment.interest, 58.60)

    def test_2022_Q2_segments(self):
        interest_statement_calculator = CalculateInterestStatementService(
            investor_id=self.investor.id,
            end_date=dt_parse('2022-06-30')
        )
        quarters = interest_statement_calculator.process()
        self.assertEqual(len(quarters), 3)
        quarter = quarters[2]
        self.assertEqual(quarter.year, 2022)
        self.assertEqual(quarter.quarter, 'Q2 2022')
        self.assertEqual(quarter.total_interest, 335.8)
        self.assertEqual(len(quarter.segments), 3)

        segment = quarter.segments[0]
        self.assertEqual(float(segment.loan_balance), 11154.62)
        self.assertEqual(segment.brought_forward_interest, 58.60)
        self.assertEqual(segment.from_date, dt_parse('2022-04-01').date())
        self.assertEqual(segment.to_date, dt_parse('2022-04-26').date())
        self.assertEqual(segment.days, 26)
        self.assertEqual(segment.interest, 25.96)

        segment = quarter.segments[1]
        self.assertEqual(float(segment.loan_balance), 38718.41)
        self.assertEqual(segment.brought_forward_interest, 58.6)
        self.assertEqual(segment.from_date, dt_parse('2022-04-27').date())
        self.assertEqual(segment.to_date, dt_parse('2022-05-14').date())
        self.assertEqual(segment.days, 18)
        self.assertEqual(segment.interest, 62.15)

        segment = quarter.segments[2]
        self.assertEqual(float(segment.loan_balance), 59128.33)
        self.assertEqual(segment.brought_forward_interest, 58.6)
        self.assertEqual(segment.from_date, dt_parse('2022-05-15').date())
        self.assertEqual(segment.to_date, dt_parse('2022-06-30').date())
        self.assertEqual(segment.days, 47)
        self.assertEqual(segment.interest, 247.69)
