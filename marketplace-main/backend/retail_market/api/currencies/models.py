from django.db import models

from api.models import BaseModel


class Currency(BaseModel):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=3)
    symbol = models.TextField()
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='company_currency')

    class Meta:
        unique_together = ('company', 'code')


class CurrencyRate(BaseModel):
    from_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='from_rates')
    to_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='to_rates')
    conversion_rate = models.FloatField()
    rate_date = models.DateTimeField()
