from django.db import models
from django.utils.translation import gettext_lazy as _


class VehicleTypeChoices(models.IntegerChoices):
    INDIVIDUAL = 1, _('Individual')
    CORPORATE_ENTITY = 2, _('Corporate Entity')
    PARTNERSHIP = 3, _('Partnership')
    TRUST = 4, _('Trust')
