from api.applications.models import Application
from api.funds.models import Fund
from api.users.models import RetailUser


class UndeleteApplicationService:
    def __init__(self, fund: Fund, user: RetailUser):
        self.fund = fund
        self.user = user

    def process(self):
        Application.objects.filter(fund=self.fund, user=self.user).update(deleted=False)
