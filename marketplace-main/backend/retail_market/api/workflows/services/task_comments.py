from django.db.models import Q

from api.applications.models import Application
from api.comments.models import ApplicationComment
from api.workflows.models import Task


class TaskCommentService:
    def __init__(self, task: Task):
        self.task = task

    def get_application(self):
        try:
            return self.task.workflow.parent.application
        except:
            return None

    @staticmethod
    def has_active_comment(application: Application):
        return ApplicationComment.objects.filter(
            Q(application_id=application.id) | Q(kyc_record_id=application.kyc_record_id)
        ).exclude(status=ApplicationComment.Statuses.RESOLVED.value).exists()

    def process(self):
        application = self.get_application()
        if not application:
            return False
        return self.has_active_comment(application=application)
