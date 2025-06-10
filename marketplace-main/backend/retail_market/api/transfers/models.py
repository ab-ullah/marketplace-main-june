from django.db import models

from api.applications.models import Application
from api.models import BaseModel


class Transfer(BaseModel):
    loan_date = models.DateField(null=True, blank=True)
    loan_balance = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    interest_date = models.DateField(null=True, blank=True)
    interest_balance = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
