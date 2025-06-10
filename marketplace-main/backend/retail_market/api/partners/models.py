from django.db import models

from api.models import BaseModel


class PartnerAPILog(BaseModel):
    company = models.ForeignKey(
        'companies.Company',
        related_name='partner_api_logs',
        on_delete=models.CASCADE
    )
    request_path = models.TextField()
    request_body = models.JSONField()
    response_body = models.TextField(null=True, blank=True)
    response_status = models.PositiveIntegerField()
    request_method = models.CharField(max_length=50)
    view_name = models.CharField(max_length=250)
    run_time = models.FloatField()
