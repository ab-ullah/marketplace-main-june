import copy
from datetime import datetime
from decimal import Decimal
from typing import List

from django.db.models import Max, Subquery, OuterRef

from api.currencies.models import Currency
from api.currencies.serializers import CurrencySerializer
from api.currencies.services.company_currency_details import DEFAULT_CURRENCY
from api.notices.models import TransactionalConsideration, ValuationConsideration
from api.notices.serializers import TransactionalConsiderationsDetailSerializer, ValuationConsiderationsDetailSerializer
from api.notices.utils import get_quarter

SKIP_KEYS = ['id', 'fund', 'firm', 'investor', 'company', 'conversion_rate', 'quarter']


class NoticesService:
    def __init__(self, company_ids: List[int], investor_ids, start_date, end_date):
        self.investor_ids = investor_ids
        self.company_ids = company_ids
        self.default_currencies = self.get_usd_currencies()
        self.start_date = start_date
        self.end_date = end_date

    def get_usd_currencies(self):
        currencies = Currency.objects.filter(
            company_id__in=self.company_ids,
            code__iexact=DEFAULT_CURRENCY
        )
        currencies = CurrencySerializer(currencies, many=True).data
        currency_data = {}
        for currency in currencies:
            currency_data[currency['company']] = currency

        return currency_data

    def fetch_notices(self):
        queryset = TransactionalConsideration.objects.filter(
            investor_id__in=self.investor_ids,
            company_id__in=self.company_ids
        )
        if self.start_date and self.end_date:
            queryset = queryset.filter(
                notice_date__range=[self.start_date, self.end_date]
            )

        notices = queryset.select_related(
            'fund__fund_currency',
            'firm',
            'company'
        ).order_by('-notice_date')
        return TransactionalConsiderationsDetailSerializer(notices, many=True).data

    @staticmethod
    def calculate_sum(firm_total, transaction):
        firm_id = transaction['firm']['id']
        current_total = firm_total[firm_id]
        for field, value in transaction.items():
            if field in SKIP_KEYS:
                continue
            if type(value) not in {float, int, Decimal}:
                continue

            if field.endswith('_usd'):
                current_total[field] += transaction.get(field)
            else:
                current_total[field] += (transaction.get(field) * Decimal(transaction.get('conversion_rate')))
        firm_total[firm_id] = current_total

    @staticmethod
    def convert_to_usd(transaction):
        for field, value in transaction.items():
            if field in SKIP_KEYS:
                continue
            if type(value) not in {float, int, Decimal}:
                continue

            transaction[field] = (transaction.get(field) * Decimal(transaction.get('conversion_rate')))

    def compile(self):
        investments = {}
        compositions = {}
        transaction_notices = self.fetch_notices()
        for transaction in transaction_notices:
            firm_id = transaction['firm']['id']
            if firm_id not in investments:

                composition_transaction = copy.deepcopy(transaction)
                self.convert_to_usd(composition_transaction)
                composition_transaction['conversion_rate'] = 1
                composition_transaction['currency'] = self.default_currencies.get(
                    transaction['company'],
                    transaction['currency']
                )
                investments[firm_id] = composition_transaction
                compositions[firm_id] = [copy.deepcopy(transaction)]
            else:
                self.calculate_sum(firm_total=investments, transaction=transaction)
                compositions[firm_id].append(copy.deepcopy(transaction))

        return {
            'transactions': list(investments.values()),
            'transactions_compositions': compositions,
        }


class ValuationNotice(NoticesService):

    def fetch_notices(self):
        queryset = ValuationConsideration.objects.filter(
            investor_id__in=self.investor_ids,
            company_id__in=self.company_ids,
            notice_date__isnull=False
        )
        if self.end_date:
            queryset = queryset.filter(
                notice_date__lte=self.end_date
            )
        notices = queryset.select_related(
            'fund__fund_currency',
            'firm',
            'company'
        ).distinct('id')
        return ValuationConsiderationsDetailSerializer(notices, many=True).data

    def composed_transaction(self, transaction):
        composition_transaction = copy.deepcopy(transaction)
        self.convert_to_usd(composition_transaction)
        composition_transaction['conversion_rate'] = 1
        composition_transaction['currency'] = self.default_currencies.get(
            transaction['company'],
            transaction['currency']
        )
        return composition_transaction

    @classmethod
    def compile_latest_dates_by_firm(cls, transaction_notices):
        latest_transactions_by_firm = dict()
        for transaction in transaction_notices:
            firm_id = transaction['firm']['id']
            fund_id = transaction['fund']['id']
            notice_date = datetime.strptime(transaction['notice_date'], '%Y-%m-%d')
            if firm_id not in latest_transactions_by_firm:
                latest_transactions_by_firm[firm_id] = {fund_id: notice_date}
            else:
                if fund_id not in latest_transactions_by_firm[firm_id]:
                    latest_transactions_by_firm[firm_id][fund_id] = notice_date
                else:
                    if notice_date > latest_transactions_by_firm[firm_id][fund_id]:
                        latest_transactions_by_firm[firm_id][fund_id] = notice_date
        return latest_transactions_by_firm

    def compile(self):
        investments = {}
        compositions = {}
        transaction_notices = self.fetch_notices()
        latest_transactions_by_firm = self.compile_latest_dates_by_firm(transaction_notices)

        for transaction in transaction_notices:
            firm_id = transaction['firm']['id']
            fund_id = transaction['fund']['id']
            notice_date = datetime.strptime(transaction['notice_date'], '%Y-%m-%d')
            if notice_date == latest_transactions_by_firm[firm_id][fund_id]:
                if firm_id not in investments:
                    composition_transaction = self.composed_transaction(transaction)
                    investments[firm_id] = composition_transaction
                else:
                    self.calculate_sum(firm_total=investments, transaction=transaction)
                compositions.setdefault(firm_id, [])
                compositions[firm_id].append(copy.deepcopy(transaction))

        return {
            'transactions': list(investments.values()),
            'transactions_compositions': compositions,
        }
