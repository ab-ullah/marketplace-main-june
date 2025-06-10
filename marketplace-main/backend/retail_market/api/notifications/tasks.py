from django.db.transaction import atomic

from api.applications.models import Application
from api.funds.models import Fund
from api.notifications.services.application_document_notification import CreateNotificationFromApplicationDocument


def async_process_application_notifications(fund_id: int):
    fund = Fund.objects.get(id=fund_id)
    if not fund.company.create_application_document_notification():
        return

    applications = Application.objects.filter(
        fund_id=fund_id,
        status=Application.Status.APPROVED.value
    )
    with atomic():
        for application in applications:
            CreateNotificationFromApplicationDocument(application=application).process()
