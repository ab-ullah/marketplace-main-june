from django.db import models
from django.utils.translation import gettext as _


class IdDocuments(models.IntegerChoices):
    PASSPORT = 1, _('Passport')
    DRIVERS_LICENSE = 2, _('Driver\'s license')
    SSN_CARD = 3, _('SSN card')
    NATIONAL_ID_CARD = 4, _('National ID card')
    OTHER = 5, _('Other')
