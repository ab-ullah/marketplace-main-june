from api.applications.models import Application
from api.eligibility_criteria.services.publish_criteria import PublishCriteria
from api.workflows.models import Task


class ApplicationChangeRequests:
    def __init__(self, application: Application):
        self.application = application

    def resubmit_changes(self):
        workflow = self.application.workflow
        if not workflow:
            return

        for child_workflow in workflow.child_workflows.all():
            _tasks = child_workflow.workflow_tasks.filter(
                task_type=Task.TaskTypeChoice.REVIEW_REQUEST
            ).exclude(
                status=Task.StatusChoice.APPROVED
            )
            PublishCriteria.set_tasks_status_pending(_tasks)

    def process_investor_tasks(self):
        workflow = self.application.workflow
        if not workflow:
            return
        for child_workflow in workflow.child_workflows.all():
            Task.objects.filter(
                task_type=Task.TaskTypeChoice.CHANGES_REQUESTED,
                workflow_id=child_workflow.id
            ).update(completed=True)

    def has_pending_change_requests(self):
        workflow = self.application.workflow
        if not workflow:
            return

        return Task.objects.filter(
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST,
            status=Task.StatusChoice.CHANGES_REQUESTED,
            workflow__parent_id=workflow.id
        ).exists()
