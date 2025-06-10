from datetime import timedelta

from api.capital_calls.models import CapitalCall
from api.companies.models import Company
from api.currencies.services.fund_currency_info import FundCurrencyDetail
from api.funds.models import Fund

ADMIN_STAT_FIELDS = [
    'nav_share',
    'commitment_to_date',
    'leverage_used',
    'interest_accrued',
    'unrealized_gain',
    'income_distributions_since_inception'
]


class AdminStatsService:
    def __init__(self, company: Company):
        self.company = company

    @staticmethod
    def format_pie_chart_data(role_stat, total):
        charts_data = []
        for role_name, investment in role_stat.items():
            charts_data.append({
                'name': role_name,
                'value': round(investment/total, 2) if total else 0
            })
        return charts_data

    def get_fund_stats(self):
        funds = Fund.objects.filter(company=self.company).prefetch_related('fund_investors').order_by('-created_at')[:5]
        fund_stats = []
        fund_tasks = []
        role_investments = {}
        total_row = {
            'id': 0,
            'name': 'Total',
            'type': '',
            'employees_count': 0,
            'total_committed': 0,
            'currency': FundCurrencyDetail.get_default()
        }
        role_total_investment = 0
        for column in ADMIN_STAT_FIELDS:
            total_row[column] = 0
        for fund in funds:
            fund_detail = FundCurrencyDetail(fund=fund)
            currency = fund_detail.process()
            rate = currency['rate']
            fund_stat = {
                'id': fund.id,
                'name': fund.name,
                'type': fund.get_fund_type_display(),
                'employees_count': 0,
                'total_committed': 0,
                'close_date': str(fund.deadline),
                'total_available': fund.unsold,
                'sold': fund.sold,
                'currency': currency,
            }
            # TODO: Do one query instead of separate query for all funds
            if not CapitalCall.objects.filter(fund=fund).exists():
                fund_task = {
                    'id': fund.id,
                    'name': fund.name,
                    'slug': fund.slug,
                    'external_id': fund.external_id,
                    'deadline': str(fund.deadline) if fund.deadline else None,
                    'task_date': str(fund.deadline + timedelta(days=5)) if fund.deadline else None
                }
                fund_tasks.append(fund_task)
            for column in ADMIN_STAT_FIELDS:
                fund_stat[column] = 0
            for fund_investor in fund.fund_investors.all():
                fund_stat['employees_count'] += 1
                for column in ADMIN_STAT_FIELDS:
                    fund_stat[column] += getattr(fund_investor, column, 0)
                    total_row[column] += float(getattr(fund_investor, column, 0)) * rate

                for user in fund_investor.investor.associated_users.all():
                    role = user.company_user.role
                    if role:
                        role_investments[role.name] = role_investments.get(role.name, 0) + fund_stat['commitment_to_date']
                        role_total_investment += fund_stat['commitment_to_date']
                fund_stat['total_committed'] = fund_stat['commitment_to_date'] + fund_stat['leverage_used']
            total_row['total_committed'] = total_row['commitment_to_date'] * rate + total_row['leverage_used'] * rate
            fund_stats.append(fund_stat)

        fund_raising = [fund_stats[-1]] if fund_stats else []
        return {
            'active_funds': fund_stats,
            'total_row': total_row,
            'investment_by_role': self.format_pie_chart_data(role_stat=role_investments, total=role_total_investment),
            'fund_raising': fund_raising,
            'fund_tasks': fund_tasks
        }
