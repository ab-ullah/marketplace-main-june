from api.companies.models import Company
from api.geographics.data.regions import EUROPE_COUNTRIES, EUROPE_REGION_CODE
from api.geographics.models import Country, Region


class CreateCompanyRegionsService:
    def __init__(self, company: Company):
        self.company = company

    def create_regions(self):
        europe_country_codes = [x['code'] for x in EUROPE_COUNTRIES]
        countries = list(Country.objects.filter(iso_code__in=europe_country_codes))
        region, _ = Region.objects.get_or_create(
            company=self.company,
            region_code=EUROPE_REGION_CODE,
            name='Europe Region'
        )
        for country in countries:
            region.countries.add(country)
