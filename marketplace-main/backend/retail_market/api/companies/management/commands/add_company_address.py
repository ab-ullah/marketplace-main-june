import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.geographics.models import Address, Country, USState

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Add Address for the Company'

    def add_arguments(self, parser):
        parser.add_argument('--company_name', type=str, action='store')
        parser.add_argument('--street1', type=str, action='store')
        parser.add_argument('--street2', type=str, default=None, action='store')
        parser.add_argument('--city', type=str, action='store')
        parser.add_argument('--state_iso', type=str, action='store')
        parser.add_argument('--country_iso', type=str, action='store')
        parser.add_argument('--zip_code', type=str, action='store')

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        street1 = options.get('street1')
        street2 = options.get('street2')
        city = options.get('city')
        state_iso = options.get('state_iso', None)
        country_iso = options.get('country_iso')
        zip_code = options.get('zip_code')

        if state_iso:
            state = USState.objects.get(iso_code=state_iso)

        country = Country.objects.get(iso_code=country_iso)
        company = Company.objects.get(name=company_name)

        if company.address:
            company.address.street1 = street1
            company.address.street2 = street2
            company.address.city = city
            company.address.state = state
            company.address.country = country
            company.address.zip_code = zip_code
            company.address.save()

        else:
            address = Address.objects.create(
                street1=street1,
                street2=street2,
                city=city,
                state=state,
                country=country,
                zip_code=zip_code
            )
            company.address = address
            company.save()
