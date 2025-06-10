import logging

from django.core.management import BaseCommand

from api.feature_flags.management.commands.base import BaseMixin

logger = logging.getLogger(__name__)


class Command(BaseMixin, BaseCommand):
    help = 'Activate company feature flag for a given feature and a company id'

    def handle(self, *args, **options):
        feature_flag_name = options['feature_flag_name']
        company_feature_flag = self._create_feature_flag_provider(options)
        company_feature_flag.activate(feature_flag_name)
