from api.applications.models import Application
from api.applications.services.reset_application import ApplicationResetService


def reset_applications_for_kyc_record(kyc_record_ids, user):
    applications = Application.objects.filter(kyc_record_id__in=kyc_record_ids)
    for application in applications:
        ApplicationResetService(application=application, user=user).reset()
