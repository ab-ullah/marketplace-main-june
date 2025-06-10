from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from api.models import BaseModel, MultiTenantModel


class PageConfig(BaseModel):
    class PageTypes(models.TextChoices):
        INVESTOR_DASHBOARD = 'investor_dashboard', _('Investor Dashboard')
        INVESTMENT_DETAIL_PAGE = 'investment_detail_page', _('Investment Detail Page')
        NOTICE_CONSIDERATIONS = 'notice_considerations', _('Notice Considerations')
        NOTICE_CONSIDERATIONS_FIRM_DETAIL = 'notice_considerations_firm_detail', _('Notice Considerations Firm Detail')
        COMPENSATION_VIEW = 'compensation_view', _('Compensation View')
        CARRY_CONFIG = 'carry_config', _('Carry Config')

    history = HistoricalRecords()
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE)
    enabled = models.BooleanField(default=False, verbose_name="Enabled")
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, null=True, blank=True)
    page = models.CharField(choices=PageTypes.choices, max_length=50)
    page_value = models.JSONField(default=dict)


class CustomTextConfig(MultiTenantModel):
    custom_domicile_text = models.TextField(null=True, blank=True)
    deleted = models.BooleanField(default=False, verbose_name="Deleted")
