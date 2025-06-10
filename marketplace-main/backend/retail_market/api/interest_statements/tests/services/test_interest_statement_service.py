import unittest
from copy import deepcopy

from dateutil.parser import parse as dt_parse

from api.activities.models import TransactionDetail
from api.currencies.models import CurrencyRate
from api.documents.models import Document, InvestorDocument
from api.interest_statements.constants.interest_rates import INTEREST_RATE_BY_YEAR, CURRENCY_INTEREST_RATE_BY_YEAR
from api.interest_statements.services.calculate_interest_statement import CalculateInterestStatementService
from api.interest_statements.services.process_investor import ProcessInvestorService
from api.interest_statements.tests.data.transaction_details import TRANSACTION_DETAILS
from api.notifications.models import UserNotification
from api.partners.tests.factories import FundFactory, InvestorFactory, CurrencyFactory, CompanyUserInvestorFactory
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
                effective_date=dt_parse(transaction_detail_copy.pop('effective_date')),
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
        self.assertEqual(segment.brought_forward_interest, 58.60)
        self.assertEqual(segment.from_date, dt_parse('2022-04-27').date())
        self.assertEqual(segment.to_date, dt_parse('2022-05-14').date())
        self.assertEqual(segment.days, 18)
        self.assertEqual(segment.interest, 62.15)

        segment = quarter.segments[2]
        self.assertEqual(float(segment.loan_balance), 59128.33)
        self.assertEqual(segment.brought_forward_interest, 58.60)
        self.assertEqual(segment.from_date, dt_parse('2022-05-15').date())
        self.assertEqual(segment.to_date, dt_parse('2022-06-30').date())
        self.assertEqual(segment.days, 47)
        self.assertEqual(segment.interest, 247.69)

    def test_2022_Q3_segments(self):
        interest_statement_calculator = CalculateInterestStatementService(
            investor_id=self.investor.id,
            end_date=dt_parse('2022-09-30')
        )
        quarters = interest_statement_calculator.process()
        self.assertEqual(len(quarters), 4)
        quarter = quarters[3]
        self.assertEqual(quarter.year, 2022)
        self.assertEqual(quarter.quarter, 'Q3 2022')
        self.assertEqual(quarter.total_interest, 607.49)
        self.assertEqual(len(quarter.segments), 4)

        segment = quarter.segments[0]
        self.assertEqual(float(segment.loan_balance), 59128.33)
        self.assertEqual(segment.brought_forward_interest, 394.40)
        self.assertEqual(segment.from_date, dt_parse('2022-07-01').date())
        self.assertEqual(segment.to_date, dt_parse('2022-07-06').date())
        self.assertEqual(segment.days, 6)
        self.assertEqual(segment.interest, 31.8)

        segment = quarter.segments[1]
        self.assertEqual(float(segment.loan_balance), 78628.25)
        self.assertEqual(segment.brought_forward_interest, 394.40)
        self.assertEqual(segment.from_date, dt_parse('2022-07-07').date())
        self.assertEqual(segment.to_date, dt_parse('2022-07-25').date())
        self.assertEqual(segment.days, 19)
        self.assertEqual(segment.interest, 133.69)

        segment = quarter.segments[2]
        self.assertEqual(float(segment.loan_balance), 75938.15)
        self.assertEqual(segment.brought_forward_interest, 0)
        self.assertEqual(segment.from_date, dt_parse('2022-07-26').date())
        self.assertEqual(segment.to_date, dt_parse('2022-07-30').date())
        self.assertEqual(segment.days, 5)
        self.assertEqual(segment.interest, 33.81)

        segment = quarter.segments[3]
        self.assertEqual(float(segment.loan_balance), 73940.72)
        self.assertEqual(segment.brought_forward_interest, 0)
        self.assertEqual(segment.from_date, dt_parse('2022-07-31').date())
        self.assertEqual(segment.to_date, dt_parse('2022-09-30').date())
        self.assertEqual(segment.interest, 408.19)

    def test_multi_fund_multi_currency_context(self):
        other_currency = CurrencyFactory(
            company=self.company,
            code='EUR',
            name='EURO',
            symbol='€',
        )
        CurrencyRate.objects.create(
            from_currency=other_currency,
            to_currency=self.fund.fund_currency,
            rate_date=dt_parse('2021-12-31 01:01:01'),
            conversion_rate=2.0
        )
        CurrencyRate.objects.create(
            from_currency=other_currency,
            to_currency=self.fund.fund_currency,
            rate_date=dt_parse('2021-12-31 05:01:01'),
            conversion_rate=4.0
        )
        other_fund = FundFactory(company=self.company, fund_currency=other_currency)
        self.create_transaction_details(fund=other_fund, investor=self.investor)
        context = ProcessInvestorService(
            investor_id=self.investor.id,
            quarter_end_date=dt_parse('2021-12-31').date(),
            company=self.company
        ).get_context()
        self.assertEqual(context['quarter'], 'Q4 2021')
        self.assertEqual(context['date'], dt_parse('2021-12-31').date())
        self.assertEqual(context['investor'], self.investor.name)
        segments = context['segments']
        self.assertEqual(len(segments), 2)

        first_segment = segments[0]
        self.assertEqual(first_segment['investment'], self.fund.name)
        self.assertEqual(first_segment['investment_currency'], 'USD')
        statement = first_segment['statements'][0]
        interest_rate = INTEREST_RATE_BY_YEAR[2021]
        expected_interest = statement['loan_accrued_interest'] * statement['days'] / 365 * interest_rate
        self.assertEqual(first_segment['total_interest'], round(expected_interest, 2))
        self.assertEqual(first_segment['translation_rate'], 1.0)
        self.assertEqual(len(first_segment['statements']), 1)

        second_segment = segments[1]
        statement = second_segment['statements'][0]
        self.assertEqual(second_segment['investment'], other_fund.name)
        self.assertEqual(second_segment['investment_currency'], 'EUR')
        interest_rate = CURRENCY_INTEREST_RATE_BY_YEAR['EUR'][2021]
        expected_interest = statement['loan_accrued_interest'] * statement['days'] / 365 * interest_rate
        self.assertEqual(second_segment['total_interest'], round(expected_interest, 2))
        self.assertEqual(second_segment['total_interest'], 36.24)
        self.assertEqual(second_segment['translation_rate'], 4.0)
        self.assertEqual(len(second_segment['statements']), 1)

    @unittest.skip(reason="CI failing when test passes locally")
    def test_document_creation(self):
        CompanyUserInvestorFactory(investor=self.investor)
        for _ in range(3):
            ProcessInvestorService(
                investor_id=self.investor.id,
                quarter_end_date=dt_parse('2021-12-31').date(),
                company=self.company
            ).process()
            self.assertEqual(Document.objects.count(), 1)
            document = Document.objects.first()

            self.assertEqual(InvestorDocument.objects.filter(
                document=document,
                investor=self.investor
            ).count(), 1)

            self.assertEqual(
                UserNotification.objects.filter(
                    investor=self.investor,
                    company=self.company
                ).count(),
                1
            )
