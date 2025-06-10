from rest_framework.generics import CreateAPIView

from api.partners.serializers import TransactionDetailSerializers
from api.partners.views import BasePartnerView


class TransactionDetailCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = TransactionDetailSerializers