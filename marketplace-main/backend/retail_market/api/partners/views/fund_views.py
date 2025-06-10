from rest_framework.generics import CreateAPIView

from api.partners.serializers import PartnerFundSerializer, FundNavSerializer
from api.partners.views import BasePartnerView


class FundCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = PartnerFundSerializer


class FundNavCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = FundNavSerializer
