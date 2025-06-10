from rest_framework.generics import CreateAPIView

from api.partners.serializers import PowerOfAttorneyDocumentSerializer
from api.partners.views import BasePartnerView


class PowerOfAttorneyCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = PowerOfAttorneyDocumentSerializer
