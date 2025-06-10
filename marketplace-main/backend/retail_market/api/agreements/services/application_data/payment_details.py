from django.forms import BooleanField
from encrypted_fields.fields import EncryptedCharField

from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import PAYMENT_DETAILS_ID
from api.payments.models import PaymentDetail


class PaymentDetailOptions(ModelBasedOptions):
    PREFIX_ID = PAYMENT_DETAILS_ID
    model = PaymentDetail
