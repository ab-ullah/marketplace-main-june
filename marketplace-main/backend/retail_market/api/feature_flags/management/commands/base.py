import logging
from abc import ABC

from api.companies.models import Company
from api.feature_flags.models import Feature
from api.feature_flags.provider import ID, CompanyFeatureFlagProvider

logger = logging.getLogger(__name__)


class BaseMixin(ABC):
    help = 'Activate company feature flag for a given feature and a company id'

    def add_arguments(self, parser):
        parser.add_argument('company_id', type=ID)
        parser.add_argument('feature_flag_name', type=str)
        parser.add_argument('--description', type=str)

    def _create_feature_flag_provider(self, options):
        feature_flag_name = options['feature_flag_name']
        company_id = options['company_id']
        description = options.get('description', '')
        Feature.objects.get_or_create(name=feature_flag_name, defaults={'description': description})
        try:
            Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            self.stderr.write(f"No company for id {company_id}")
        company_feature_flag = CompanyFeatureFlagProvider(company_id=company_id)
        return company_feature_flag
