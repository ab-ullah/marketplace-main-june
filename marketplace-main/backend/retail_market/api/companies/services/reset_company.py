from api.activities.models import FundActivity, LoanActivity
from api.capital_calls.models import CapitalCall
from api.companies.models import Company
from api.currencies.models import Currency
from api.documents.models import Document
from api.funds.models import Fund
from api.notifications.models import UserNotification


class ResetCompanyService:
    def __init__(self, company_name):
        self.company_name = company_name
        self.company = self.get_company()

    def get_company(self):
        try:
            return Company.objects.get(name__iexact=self.company_name)
        except Company.DoesNotExist:
            return None

    def delete_activities(self):
        FundActivity.objects.filter(company=self.company).delete()
        LoanActivity.objects.filter(company=self.company).delete()

    def delete_capital_calls(self):
        CapitalCall.objects.filter(company=self.company).delete()

    def delete_currencies(self):
        Currency.objects.filter(company=self.company).delete()

    def delete_documents(self):
        Document.objects.filter(company=self.company).delete()

    def delete_funds(self):
        Fund.objects.filter(company=self.company).delete()

    def delete_notifications(self):
        UserNotification.objects.filter(company=self.company).delete()

    def reset(self):
        if not self.company:
            return 'Company with this name does not exist'

        self.delete_activities()
        self.delete_capital_calls()
        self.delete_currencies()
        self.delete_documents()
        self.delete_funds()
        self.delete_notifications()
