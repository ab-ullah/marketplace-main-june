import logging

from django.core.management.base import BaseCommand

from api.applications.models import Application
from api.applications.services.validators.validate_application_state import ApplicationStateValidationService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'validate application'

    def add_arguments(self, parser):
        parser.add_argument('--application_id', type=int, action='store')
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Store True',
        )

    def handle(self, *args, **options):
        application_id = options.get('application_id')
        fix = options.get('fix')

        if fix:
            logger.warning('Validator is running in fixing mode')

        application = Application.objects.get(id=application_id)
        application_validator_service = ApplicationStateValidationService(
            application=application,
            perform_fix=fix
        )
        application_validator_service.validate()
