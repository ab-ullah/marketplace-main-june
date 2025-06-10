from django.db import models
from django.utils.translation import gettext as _
from api.models import BaseModel


class Feature(BaseModel):
    name = models.CharField(max_length=100, help_text=_("Name of the feature"))
    description = models.TextField(help_text=_("Description of what the feature is about"), blank=True, null=True, default="")

    class Meta:
        db_table = 'features'


class CompanyFeatureFlag(BaseModel):
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, null=False)
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, null=False)
    active = models. BooleanField(default=False)

    class Meta:
        db_table = 'company_feature_flags'
        unique_together = ('company', 'feature', )
