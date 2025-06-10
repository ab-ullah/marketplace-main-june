from django.db import models

from api.models import BaseModel


class Firm(BaseModel):
    name = models.CharField(max_length=120)
    slug = models.CharField(max_length=120, db_index=True)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_firms'
    )

    class Meta:
        unique_together = (
            ('company', 'slug')
        )

    def __str__(self):
        return f'{self.company}-{self.name}'
