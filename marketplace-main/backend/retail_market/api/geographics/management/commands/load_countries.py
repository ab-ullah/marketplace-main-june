import logging

from django.core.management.base import BaseCommand

from api.geographics.data.countries import COUNTRIES
from api.geographics.models import Country

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Load Countries'

    def handle(self, *args, **options):
        for country in COUNTRIES:
            Country.objects.get_or_create(
                name=country['country'],
                iso_code=country['abbreviation']
            )
