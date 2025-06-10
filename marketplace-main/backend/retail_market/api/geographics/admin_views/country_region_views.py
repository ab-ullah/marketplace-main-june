from rest_framework.response import Response
from rest_framework.views import APIView

from api.geographics.models import Country, Region, CountryIdDocumentType
from api.geographics.services.region_country_parsing_service import RegionCountryParsingService
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CountryRegionAPIView(APIView, AdminViewMixin):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, *args, **kwargs):
        countries = Country.objects.all()
        regions = Region.objects.filter(company=self.company)
        return Response(RegionCountryParsingService.parse(regions=regions, countries=countries))


class IdDocumentTypeByCountry(APIView, AdminViewMixin):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, *args, **kwargs):
        country_document_ids = CountryIdDocumentType.objects.all()
        country_id_map = {}
        for country_document_id in country_document_ids:
            country_id = str(country_document_id.country_id)
            if country_id not in country_id_map:
                country_id_map[country_id] = [country_document_id.id_document_type]
            else:
                country_id_map[country_id].append(country_document_id.id_document_type)
        return Response(country_id_map)
