from datetime import datetime

import factory

from api.transfers.models import Transfer


class TransferFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Transfer

    loan_date = datetime.now().date()
