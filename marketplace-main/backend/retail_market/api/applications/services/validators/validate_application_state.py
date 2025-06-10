import json
import logging

from api.applications.models import Application
from api.applications.services.validators.tax_state_validation_mixin import TaxRecordValidatorMixin

logger = logging.getLogger(__name__)


class ApplicationStateValidationService(
    TaxRecordValidatorMixin
):
    def __init__(self, application: Application, perform_fix: bool = False):
        self.application = application
        self.perform_fix = perform_fix

    def validate_tax(self):
        return self.has_valid_tax_state(application=self.application)

    def validate(self):
        if self.application.status == Application.Status.APPROVED.value:
            tax_state = self.validate_tax()
            if tax_state:
                logger.info(tax_state.get('message'))
            if not tax_state['is_valid_state']:
                logger.warning(f'Tax is not in valid State: ${json.dumps(tax_state, indent=4)}')
            return tax_state