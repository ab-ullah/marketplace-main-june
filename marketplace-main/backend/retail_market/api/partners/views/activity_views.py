from rest_framework.generics import CreateAPIView

from api.partners.serializers import FundActivitySerializers, LoanActivitySerializers, \
    FundActivityRegenerationSerializers, FundOnboardingDocumentSerializers
from api.partners.views import BasePartnerView


class FundActivityCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = FundActivitySerializers


class LoanActivityCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = LoanActivitySerializers


class FundActivityRegenerateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = FundActivityRegenerationSerializers


class FundOnboardingDocumentCreateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = FundOnboardingDocumentSerializers
