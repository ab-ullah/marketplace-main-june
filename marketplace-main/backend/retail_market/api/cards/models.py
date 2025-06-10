
from django.db import models
from api.models import BaseModel
from api.funds.models import Fund
from api.companies.models import Company
from api.constants.kyc_investor_types import KYCInvestorType
from simple_history.models import HistoricalRecords
from django.utils.translation import gettext_lazy as _



class Workflow(BaseModel):
    class FLOW_TYPES( models.IntegerChoices ):
        KYC = 1, _('Know Your Customer'),
        ELEGIBILITY = 2, _('Elegibility'),
        INDICATION_OF_INTEREST =3, _('Indication Of Interes'),
    

    name = models.CharField(max_length=120)
    slug = models.CharField(max_length=120)
    is_published = models.BooleanField(default=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="workflows")
    history = HistoricalRecords()
    type = models.PositiveSmallIntegerField(choices=FLOW_TYPES.choices, null=False)
    #fund is optional, most of the flows are company specific not fund specific
    fund = models.ForeignKey(Fund, on_delete=models.CASCADE, related_name="workflows", default=None, null = True)
    
    class Meta:
        unique_together = (
            ('company', 'name'), ('company', 'slug')
        )

    def __str__(self):
        return self.name

class Card(BaseModel):
    card_id = models.CharField(max_length=120, blank=True, default="")
    order = models.IntegerField(default=0)
    name = models.CharField(max_length=120)
    schema = models.JSONField(default=dict)
    is_repeatable = models.BooleanField(default=False)
    kyc_investor_type = models.PositiveSmallIntegerField(choices=KYCInvestorType.choices, null=True)
    card_dependencies = models.JSONField(default=dict)
    history = HistoricalRecords()
    class Meta:
        unique_together = (
            ('workflow', 'name', 'card_id'),
        )
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name="cards", null = False)
    
    def __str__(self):
        return self.name
