from rest_framework.generics import ListAPIView
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.geographics.serializers import CountryIdDocumentSerializer, CountrySerializer
from api.geographics.models import Country, CountryIdDocumentType
from rest_framework.generics import GenericAPIView
from api.constants import country_states
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import APIException


class CountryIdDocumentTypesRetrieveAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = CountryIdDocumentSerializer

    def get_queryset(self):
        country = Country.objects.get(iso_code=self.kwargs['country_code'])
        return CountryIdDocumentType.objects.filter(country=country)


class CountryStatesAPIView(CompanyUserViewMixin, GenericAPIView):

    def get(self, request, country_id):
        try:
            countries_with_states = list(
                Country.objects.filter(iso_code__in=country_states.STATES_BY_COUNTRY_MAP.keys()))
        except Exception:
            raise APIException()
        states_by_country_map = {}
        for country in countries_with_states:
            states_by_country_map[str(country.id)] = [{'label': state['name'], 'value': state['code']} for state in
                                                 country_states.STATES_BY_COUNTRY_MAP[country.iso_code]]
        if country_id in states_by_country_map.keys():
            return Response(states_by_country_map[country_id], status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)


class CountriesListApiView(ListAPIView):

    queryset = Country.objects.all()
    serializer_class = CountrySerializer