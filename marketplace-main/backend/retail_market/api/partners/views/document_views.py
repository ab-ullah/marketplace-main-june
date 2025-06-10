from rest_framework.generics import CreateAPIView

from api.partners.serializers import FundDocumentSerializer, InvestorDocumentSerializer
from api.partners.views import BasePartnerView


class FundDocumentCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = FundDocumentSerializer


class InvestorDocumentCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = InvestorDocumentSerializer
