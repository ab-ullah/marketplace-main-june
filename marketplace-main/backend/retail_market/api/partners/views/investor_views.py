from rest_framework.generics import CreateAPIView

from api.partners.serializers import InvestorSerializer
from api.partners.views import BasePartnerView


class InvestorCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = InvestorSerializer
