from django.utils import timezone

from api.applications.models import Application


class PinKYCVersion:
    def __init__(self, application, history_date=None):
        self.application = application
        self.history_date = history_date

    def pin(self):
        dt = self.history_date if self.history_date else timezone.now()
        self.application.gp_signing_completed_at = dt
        self.application.save(update_fields=['gp_signing_completed_at'])


def async_pin_kyc_version(application_id):
    application = Application.objects.get(id=application_id)
    PinKYCVersion(application=application).pin()
