from django.utils import timezone
from api.constants.headers import VESTING_CALCULATION_DATE


class VestingDateViewMixin:
    @property
    def calculation_date(self):
        as_of_date = self.request.headers.get(VESTING_CALCULATION_DATE)
        if as_of_date:
            as_of_date = as_of_date.split('T')[0]
        else:
            as_of_date = timezone.now().strftime("%Y-%m-%d")
        return as_of_date
