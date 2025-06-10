from django.conf import settings

from api.applications.models import Application
from api.applications.utils import get_user_application
from api.constants.module_choices import MODULE_URL_FUNCTIONS
from api.funds.models import Fund
from api.libs.utils.urls import get_eligibility_url
from api.users.models import RetailUser


class GetApplicationCurrentUrl:
    def __init__(self, user: RetailUser, fund: Fund):
        self.user = user
        self.fund = fund
        self.app_base_url = settings.FE_APP_URL

    def process(self):
        fund = self.fund
        try:
            application = get_user_application({
                'user_id': self.user.id,
                'fund__external_id': self.fund.external_id
            })

        except Application.DoesNotExist:
            return get_eligibility_url(fund_external_id=fund.external_id)

        if application.state:
            url_function = MODULE_URL_FUNCTIONS.get(application.state.module, get_eligibility_url)
            return url_function(fund_external_id=fund.external_id)

        return get_eligibility_url(fund_external_id=fund.external_id)