import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.eligibility_criteria.models import BlockCategory

logger = logging.getLogger(__name__)

CATEGORIES = ('investor', 'fund')


class Command(BaseCommand):
    help = 'Create block Categories'

    def handle(self, *args, **options):
        for company in Company.objects.all():
            for index, category in enumerate(CATEGORIES):
                BlockCategory.objects.get_or_create(
                    name=category,
                    position=index + 1,
                    company=company
                )
