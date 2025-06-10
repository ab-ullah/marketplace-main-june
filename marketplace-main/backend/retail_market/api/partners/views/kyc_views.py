from rest_framework.generics import CreateAPIView

from api.partners.kyc_serializers import KYCPartnerSerializer, KycDocumentSerializer, KycApplicationDocumentSerializer
from api.partners.views import BasePartnerView


class KycRecordCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = KYCPartnerSerializer


class KycDocumentCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = KycDocumentSerializer

class ApplicationDocumentCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = KycApplicationDocumentSerializer