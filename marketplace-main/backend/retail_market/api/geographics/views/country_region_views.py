from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.funds.models import Fund
from api.geographics.models import Country, Region
from api.geographics.services.region_country_parsing_service import RegionCountryParsingService
from api.mixins.company_user_mixin import CompanyUserViewMixin


class CountryRegionAPIView(CompanyUserViewMixin, APIView):

    def get(self, request, fund_external_id):
        countries = Country.objects.all()
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id,
            company_id__in=self.company_ids
        )
        regions = Region.objects.filter(company=fund.company)
        return Response(RegionCountryParsingService.parse(regions=regions, countries=countries))
