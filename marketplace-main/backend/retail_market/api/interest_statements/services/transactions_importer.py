import copy
import csv
import datetime

from django.template.loader import render_to_string
from api.interest_statements.libs.currency_helper import CurrencyHelper
from api.libs.utils.date_util import DateUtil
from django.conf import settings
from weasyprint import HTML, CSS

ControlNumberCol = 0
InvestmentCol = 3
InvestorCol = 1
CurrencyCol = 4
EffDateCol = 6
TranTypeCol = 8
ActTranAmtCol = 13

class InterestStatementItem:
    def __init__(self, calculator_holder, interest_rate):
        self.loan_balance = calculator_holder.loan_balance
        self.accrued_interest = calculator_holder.get_accrued_interest()
        self.loan_plus_accrued_interest = calculator_holder.loan_balance + calculator_holder.get_accrued_interest()
        self.from_date = calculator_holder.from_date
        self.to_date = calculator_holder.to_date
        self.quarter = DateUtil.get_quarter_name(calculator_holder.to_date)
        self.days = (calculator_holder.to_date - calculator_holder.from_date).days + 1
        self.period_interest = self.loan_plus_accrued_interest * interest_rate * self.days / DateUtil.get_days_for_year(calculator_holder.from_date)
        calculator_holder.add_total_interest(self.period_interest)



    def to_string(self):
        return '\n Loan Balance={} \n Accrued Interest={} \n Loan Plus Accrued Interest={} \n From Date={} \n To Date={} \n Quarter={} \n Days={} \n Period Interest={}\n'.format(
            self.loan_balance,
            self.accrued_interest,
            self.loan_plus_accrued_interest,
            self.from_date,
            self.to_date,
            self.quarter,
            self.days,
            self.period_interest
        )


class InterestEvent:
    def __init__(self, control_number, investment, investor, investor_currency, effective_date_str, amount, transaction_type):
        effective_date = datetime.datetime.strptime(effective_date_str, "%m/%d/%Y").date()
        self.control_number = int(control_number)
        self.investment = investment
        self.investor = investor
        self.quarter = DateUtil.get_quarter_name(effective_date)
        self.investor_currency = investor_currency
        self.effective_date = effective_date
        self.amount = float(amount.replace(",", ""))
        self.transaction_type = transaction_type
        self.original_merged_events = set()

    def to_string(self):
        return '\n Control Number={} \n Investment={} \n Investor={} \n Quarter={} \n Investor Currency={} \n Effective Date={} \n Amount={} \n Transaction Type={} \n'.format(
            self.control_number,
            self.investment,
            self.investor,
            self.quarter,
            self.investor_currency,
            self.effective_date,
            self.amount,
            self.transaction_type
        )

class InterestCalculatorHolder:
    def __init__(self, loan_balance, accrued_interest, from_date, to_date):
        self.__total_interest = 0
        self.__total_paid_interest = 0
        self.__accrued_interest = accrued_interest
        self.loan_balance = loan_balance
        self.from_date = from_date
        self.to_date = to_date

    def add_total_interest(self, interest):
        self.__total_interest += interest

    def get_total_interest(self):
        return self.__total_interest

    def add_total_paid_interest(self, paid_interest):
        self.__total_paid_interest += paid_interest

    def get_total_paid_interest(self):
        return self.__total_paid_interest

    def get_accrued_interest(self):
        return self.__accrued_interest

    def calculate_accrued_interest(self):
        self.__accrued_interest = max(0, self.__total_interest - self.__total_paid_interest)

    def blank_accrued_interest(self):
        self.__accrued_interest = 0


class TransactionsImporter:
    def __init__(self):
        self.currency_symbols = CurrencyHelper.get_currency_symbols()
        self.contribution_transactions = {
            "Contrib Loan"
        }
        self.dist_income_transactions = {
            "DistribDiv Income"
        }
        self.dist_capital_gain_transactions = {
            "DistribDiv Capital Gain"
        }
        self.dist_employee_loan_repay_transactions = {
            "DistribDiv EmployeeLoan Repay Income",
            "DistribDiv EmployeeLoan Repay Capital"
        }
        self.dist_interest_repayment_transactions = {
            "DistribDiv Interest Repayment Income",
            "DistribDiv Interest Repayment Capital"
        }
        self.interest_transactions = {
            "Interest"
        }

        self.interest_transactions_category = self.interest_transactions
        self.contribution_transactions_category = self.contribution_transactions
        self.distribution_transactions_category = self.dist_income_transactions.union(self.dist_capital_gain_transactions).union(
                self.dist_employee_loan_repay_transactions).union(self.dist_interest_repayment_transactions)
        self.acceptable_transactions_category = self.contribution_transactions_category.union(
            self.distribution_transactions_category).union(self.interest_transactions_category)

    def matching_tran(self, row):
        return row[TranTypeCol] in self.acceptable_transactions_category

    def get_investment_rate(self, investment, year):
        for rate in self.get_investment_rates(investment):
            if rate[0] == year:
                return rate[1]
        return 0.0

    def get_investment_rates(self, investment):
        return [(2021, 0.0350), (2022, 0.0325)]

    def get_translation_rate(self, currency_from, currency_to, at_date):
        if currency_from.upper() == currency_to.upper():
            return 1.0
        return CurrencyHelper.get_currency_rate(currency_from.upper(), currency_to.upper(), at_date)

    def build_investment_currency_key(self, investment, investor):
        return '{}:{}'.format(investment, investor)

    def build_segment_key(self, investor):
        return '{}'.format(investor)

    def is_more_events_coming(self, current_event_idx, events_list):
        return current_event_idx < len(events_list)-1

    def is_same_type_category_events(self, event_type_one, event_type_two):
        if self.contribution_transactions_category.__contains__(event_type_one):
            return self.contribution_transactions_category.__contains__(event_type_two)
        elif self.distribution_transactions_category.__contains__(event_type_one):
            return self.distribution_transactions_category.__contains__(event_type_two)
        elif self.interest_transactions_category.__contains__(event_type_one):
            return self.interest_transactions_category.__contains__(event_type_two)

    def all_same_type(self, start_idx, events):
        accumulated_amount = 0
        same_types_number = set()
        original_events = set()

        last_idx = len(events) - 1
        original_event = copy.copy(events[start_idx])
        for idx in range(start_idx, len(events)):
            event = events[idx]
            next_event = events[idx + 1] if idx < last_idx else None
            if next_event is not None and event.effective_date == next_event.effective_date and \
                    self.is_same_type_category_events(event.transaction_type, next_event.transaction_type):
                accumulated_amount += next_event.amount
                same_types_number.add(next_event.control_number)
                original_events.add(next_event)
            else:
                break

        if len(same_types_number) > 0:
            original_events.add(original_event)
            return accumulated_amount, sorted(same_types_number), original_events

        return None

    def statements_by_quarter_investment(self, qrtr_invest_dict, investment_name, quarters):
        for quarter_name, statements in quarters.items():
            if qrtr_invest_dict.get(quarter_name) is None:
                investments = dict()
                investments[investment_name] = statements
                qrtr_invest_dict[quarter_name] = investments
            else:
                quarter = qrtr_invest_dict[quarter_name]
                if quarter.get(investment_name) is None:
                    quarter[investment_name] = statements
                else:
                    quarter[quarter_name][investment_name].extend(statements)

        return qrtr_invest_dict

    def add_to_dict_structure_level1(self, quarters, quarter_name, interest_statement):
        if quarters.get(quarter_name) is None:
            quarters[quarter_name] = [interest_statement]
        else:
            quarters[quarter_name].append(interest_statement)

    def create_interest_statements_by_quarter(self, events):
        classified_interest_statement_items = dict()
        calculator_holder = InterestCalculatorHolder(0, 0, None, None)

        merged_events_number = self.merge_events(events)
        filtered_events = list(filter(lambda event: (event.control_number not in merged_events_number), events))
        sorted_events = sorted(filtered_events, key=lambda event: event.control_number)
        for i in range(len(sorted_events)):
            current_event = sorted_events[i]

            next_event = sorted_events[i + 1] if self.is_more_events_coming(i, sorted_events) else None

            if next_event is not None:
                if current_event.transaction_type in self.acceptable_transactions_category:
                    to_date = next_event.effective_date
                    if current_event.transaction_type in self.contribution_transactions:
                        if next_event.transaction_type in self.distribution_transactions_category:
                            total_amount = self.get_total_amount_of_events(next_event.original_merged_events, self.dist_employee_loan_repay_transactions)
                            calculator_holder.loan_balance -= total_amount
                        else:
                            calculator_holder.loan_balance += current_event.amount
                        calculator_holder.from_date = current_event.effective_date
                        interest_rate = self.get_investment_rate(current_event.investment, calculator_holder.from_date.year)
                        calculator_holder.to_date = to_date
                        if next_event.transaction_type in self.contribution_transactions:
                            calculator_holder.to_date -= datetime.timedelta(days=1)
                        interest_statement_item = InterestStatementItem(calculator_holder, interest_rate)
                        self.add_to_dict_structure_level1(
                            classified_interest_statement_items,
                            interest_statement_item.quarter,
                            interest_statement_item
                        )
                    if current_event.transaction_type in self.interest_transactions:
                        if next_event.transaction_type in self.distribution_transactions_category:
                            # TODO: Search for next_event paid interest transactions just to be more specific
                            calculator_holder.blank_accrued_interest()
                            total_amount = self.get_total_amount_of_events(next_event.original_merged_events, self.dist_employee_loan_repay_transactions)
                            calculator_holder.loan_balance -= total_amount
                        calculator_holder.from_date = current_event.effective_date + datetime.timedelta(days=1)
                        interest_rate = self.get_investment_rate(current_event.investment, calculator_holder.from_date.year)
                        if current_event.effective_date == next_event.effective_date:
                            calculator_holder.to_date = sorted_events[i+2].effective_date
                        else:
                            calculator_holder.to_date = to_date
                        if next_event.transaction_type in self.contribution_transactions:
                            calculator_holder.to_date -= datetime.timedelta(days=1)
                        interest_statement_item = InterestStatementItem(calculator_holder, interest_rate)
                        self.add_to_dict_structure_level1(
                            classified_interest_statement_items,
                            interest_statement_item.quarter,
                            interest_statement_item
                        )
                    if current_event.transaction_type in self.distribution_transactions_category:
                        total_amount = self.get_total_amount_of_events(
                            current_event.original_merged_events,
                            self.dist_interest_repayment_transactions
                        )
                        calculator_holder.add_total_paid_interest(total_amount)
                    if DateUtil.is_quarter_end(calculator_holder.to_date):
                        calculator_holder.calculate_accrued_interest()

        return classified_interest_statement_items

    def get_total_amount_of_events(self, events, transaction_types):
        total_amount = 0
        for event in events:
            if event.transaction_type in transaction_types:
                total_amount += event.amount

        return total_amount

    def do_import(self, file_name, output_content_type):
        investors, investments_currency = self.create_classified_events(file_name)
        return self.process_events(investors, investments_currency, output_content_type)

    def create_classified_events(self, file_name, encoding='UTF-8'):
        investments_currency = dict()
        investors = dict()
        with open(file_name, encoding=encoding) as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader)

            for row in reader:
                if self.matching_tran(row):
                    event = InterestEvent(
                        row[ControlNumberCol],
                        row[InvestmentCol],
                        row[InvestorCol],
                        row[CurrencyCol],
                        row[EffDateCol],
                        row[ActTranAmtCol],
                        row[TranTypeCol])

                    investment_curr_key = self.build_investment_currency_key(event.investment, event.investor)
                    investor_key = self.build_segment_key(event.investor)

                    if investments_currency.get(investment_curr_key) is None:
                        investments_currency[investment_curr_key] = event.investor_currency

                    if investors.get(investor_key) is None:
                        investments = dict()
                        investments[event.investment] = [event]
                        investors[investor_key] = investments
                    else:
                        investments = investors.get(investor_key)
                        if investments.get(event.investment) is None:
                            investors[investor_key][event.investment] = [event]
                        else:
                            investors[investor_key][event.investment].append(event)

        return investors, investments_currency

    def process_events(self, investors, investments_currency, result_content_type='application/pdf'):
        process_results = list()
        for investor_name, investments in investors.items():
            classified_interest_statements = dict()
            for investment_name, investment_events in investments.items():
                classified_interest_statements = self.statements_by_quarter_investment(
                    classified_interest_statements,
                    investment_name,
                    self.create_interest_statements_by_quarter(investment_events))

            for quarter_name, investments_value in classified_interest_statements.items():
                process_result = None
                segments = list()
                for investment_key, statements in investments_value.items():
                    segment = dict()
                    segment['investment'] = investment_key
                    segment['investment_currency'] = investments_currency[self.build_investment_currency_key(investment_key, investor_name)]
                    segment['interest_rates'] = self.get_investment_rates(investment_key)
                    segment['interest_statements'] = statements
                    segments.append(segment)

                if result_content_type == 'application/pdf':
                    process_result = {
                        'investor': investor_name,
                        'quarter': quarter_name,
                        'object': self.create_pdf_file(segments, investor_name)
                    }
                else:
                    process_result = {
                        'investor': investor_name,
                        'quarter': quarter_name,
                        'object': self.write_to_console(segments, investor_name)
                    }

                process_results.append(process_result)

        return result_content_type, process_results

    def merge_events(self, events):
        checked_events = set()
        merged_events = set()
        last_idx = len(events) - 1

        for i in range(len(events)):
            event = events[i]
            next_event = events[i+1] if i < last_idx else None
            if event.control_number not in checked_events:
                checked_events.add(event.control_number)
                if next_event is not None and event.effective_date == next_event.effective_date:
                    if self.is_same_type_category_events(event.transaction_type, next_event.transaction_type):
                       same_type_events = self.all_same_type(i, events)
                       if same_type_events is not None:
                            events[i].amount += same_type_events[0]
                            events[i].original_merged_events = same_type_events[2]
                            merged_events = merged_events.union(same_type_events[1])
                            checked_events = checked_events.union(merged_events)

        return merged_events

    def generate_segmented_data(self, interest_statements):
        segments = list()
        for interest_statement in interest_statements:
            total_interest = 0
            statements = list()
            for item in interest_statement['interest_statements']:
                statement = dict()
                statement['loan_balance'] = '{:10.2f}'.format(item.loan_balance)
                statement['accrued_interest'] = '{:5.2f}'.format(item.accrued_interest)
                statement['loan_plus_acc_interest'] = '{:10.2f}'.format(item.loan_plus_accrued_interest)
                statement['from_date'] = item.from_date.strftime('%m/%d/%Y')
                statement['to_date'] = item.to_date.strftime('%m/%d/%Y')
                statement['days'] = '{:3}'.format(item.days)
                statement['period_interest'] = '{:5.2f}'.format(item.period_interest)
                statements.append(statement)
                total_interest += item.period_interest

            last_statement_date_str = statements[-1].get('to_date')
            last_statement_date = datetime.datetime.strptime(last_statement_date_str, '%m/%d/%Y').date()

            segment = dict()
            currency = interest_statement['investment_currency'].upper()
            segment['investment'] = interest_statement['investment']
            segment['investment_currency'] = currency
            segment['investment_currency_symbol'] = self.currency_symbols.get(currency)
            segment['translation_rate'] = self.get_translation_rate(currency, CurrencyHelper.USD, last_statement_date)
            segment['interest_rates'] = interest_statement['interest_rates']
            segment['statements'] = statements
            segment['total_interest'] = total_interest
            segments.append(segment)

        return segments


    def write_to_console(self, segments, investor):
        # TODO: Restrict to execute in Non-prod environments
        for segment in segments:
            print('Investor: {}, Investment: {} Quarter: {}'.format(
                investor,
                segment.get('investment'),
                DateUtil.get_quarter_name(segment.get('interest_statements')[-1].to_date)
            ))
            for statement in segment.get('interest_statements'):
                print(statement.to_string())

        return None


    def create_pdf_file(self, interest_statements, investor) -> bytes:
        segments = self.generate_segmented_data(interest_statements)
        last_date_str = segments[-1].get('statements')[-1].get('to_date')
        last_date = datetime.datetime.strptime(last_date_str, '%m/%d/%Y').date()

        html_str = render_to_string('interest_statement.html',
                                    {
                                        'date': last_date,
                                        'base_currency_symbol': self.currency_symbols.get(CurrencyHelper.USD),
                                        'trans_rate_date': last_date.strftime('%m/%d/%Y'),
                                        'quarter': DateUtil.get_quarter_name(last_date),
                                        'investor': investor,
                                        'segments': segments
                                    })

        html = HTML(string = html_str, base_url=settings.STATEMENTS_BASE_URL)

        return html.write_pdf(stylesheets=[CSS(url=settings.STATEMENTS_CSS_URL)])