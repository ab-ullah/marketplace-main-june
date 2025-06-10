from django.db import models
from django.utils.translation import gettext as _


class KYCInvestorType(models.IntegerChoices):
    INDIVIDUAL = 1, _('Individual')
    PARTICIPANT = 2, _('Participant'),
    ENTITY = 3, _('ENTITY'),
    PRIVATE_COMPANY = 4, _('Private Company')
    LIMITED_PARTNERSHIP = 5, _('Limited Partnership')
    TRUST = 6, _('Trust')


KYC_VALUE_MAPPING = {
    KYCInvestorType.INDIVIDUAL.value: 'INDIVIDUAL',
    KYCInvestorType.PRIVATE_COMPANY.value: 'PRIVATE_COMPANY',
    KYCInvestorType.LIMITED_PARTNERSHIP.value: 'LIMITED_PARTNERSHIP',
    KYCInvestorType.TRUST.value: 'TRUST',
}
