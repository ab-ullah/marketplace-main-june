from django.db import models
from django.utils.translation import gettext_lazy as _

class EmploymentStatus(models.IntegerChoices):
    EMPLOYED = 1, _('Employed')
    UNEMPLOYED = 2, _('Unemployed')

class Gender (models.IntegerChoices):
    MALE  = 1, _('Male')
    FEMALE = 2, _('Female')