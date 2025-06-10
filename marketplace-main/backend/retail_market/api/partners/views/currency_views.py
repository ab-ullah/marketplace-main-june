from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response

from api.partners.serializers import CurrencySerializer
from api.partners.views import BasePartnerView


class FundCurrencyCreateUpdateAPIView(BasePartnerView, CreateAPIView):
    serializer_class = CurrencySerializer

    def create(self, request, *args, **kwargs):
        payload = request.data
        for currency_info in payload:
            currency_info['from_currency'] = currency_info.pop('from', None)
            currency_info['to_currency'] = currency_info.pop('to', None)
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
