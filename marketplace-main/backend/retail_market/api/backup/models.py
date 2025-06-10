from django.db import models
from api.models import BaseModel


class ApplicationBackup(BaseModel):
    application = models.ForeignKey('applications.Application', on_delete=models.SET_NULL, related_name='backups', null=True)
    storage_key = models.CharField(max_length=120)

    class Meta:
        db_table = 'application_backups'


class FundBackup(BaseModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.SET_NULL, related_name='backups', null=True)
    storage_key = models.CharField(max_length=120)

    class Meta:
        db_table = 'fund_backups'


class FundDocumentsBackup(BaseModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.SET_NULL, related_name='document_backups', null=True)
    storage_key = models.CharField(max_length=120)

    class Meta:
        db_table = 'fund_documents_backups'


class DynamoFund(BaseModel):
    fund = models.OneToOneField('funds.Fund', on_delete=models.CASCADE, related_name="dynamo_fund")
    dynamo_id = models.CharField(max_length=250, db_index=True, null=True)  # it's expected not to have uniqueness

    class Meta:
        db_table = 'dynamo_funds'
