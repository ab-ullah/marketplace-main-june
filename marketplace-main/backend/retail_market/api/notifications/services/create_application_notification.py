from api.applications.models import Application
from api.notifications.models import UserNotification


class CreateApplicationNotification:
    def __init__(self, application: Application):
        self.application = application

    def create(self):
        application = self.application
        company_user = application.get_company_user()
        UserNotification.objects.get_or_create(
            fund=application.fund,
            user=company_user,
            company=application.company,
            application=application,
            defaults={
                'notification_type': UserNotification.NotificationTypeChoice.APPLICATION.value
            }
        )