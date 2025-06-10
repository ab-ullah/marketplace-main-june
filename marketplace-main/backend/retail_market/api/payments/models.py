import encrypted_fields.fields
from django.db import models

from api.models import BaseModel


class PaymentDetail(BaseModel):
    user = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.DO_NOTHING,
        related_name='payment_detail'
    )
    bank_country = models.ForeignKey(
        'geographics.Country',
        on_delete=models.DO_NOTHING
    )
    bank_name = encrypted_fields.fields.EncryptedCharField(max_length=120)
    street_address = encrypted_fields.fields.EncryptedCharField(max_length=120)
    city = encrypted_fields.fields.EncryptedCharField(max_length=120)
    state = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    province = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    postal_code = encrypted_fields.fields.EncryptedCharField(max_length=120)
    account_name = encrypted_fields.fields.EncryptedCharField(max_length=120)
    account_number = encrypted_fields.fields.EncryptedCharField(max_length=120)

    routing_number = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    swift_code = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    iban_number = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)

    credit_account_name = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    credit_account_number = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    currency = models.ForeignKey(
        'currencies.Currency',
        on_delete=models.DO_NOTHING
    )
    reference = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    have_intermediary_bank = models.BooleanField(default=False)

    intermediary_bank_name = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    intermediary_bank_swift_code = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    deleted = models.BooleanField(default=False)