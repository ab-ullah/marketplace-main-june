import logging

from django.core.management import BaseCommand
from rest_framework.renderers import JSONRenderer

from api.feature_flags.models import CompanyFeatureFlag
from api.feature_flags.provider import ID
from api.feature_flags.serializers import CompanyFeatureFlagSerializer

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'List all feature flags for a company'

    def add_arguments(self, parser):
        parser.add_argument('company_id', type=ID)

    def handle(self, *args, **options):
        company_id = options['company_id']
        feature_flags = CompanyFeatureFlag.objects.filter(company_id=company_id).select_related('feature', 'company')
        for feature_flag in feature_flags:
            serialized = CompanyFeatureFlagSerializer(feature_flag)
            self.stdout.write(JSONRenderer().render(serialized.data).decode())
