from django.db.transaction import atomic

from api.eligibility_criteria.models import FundEligibilityCriteria
from api.workflows.models import Task


class PublishCriteria:
    def __init__(self, criteria: FundEligibilityCriteria):
        self.criteria = criteria

    @staticmethod
    def set_tasks_status_pending(_tasks):
        with atomic():
            for _task in _tasks:
                _task.status_to_pending()

    @staticmethod
    def approve_tasks(_tasks):
        with atomic():
            for _task in _tasks:
                _task.status_to_approved()

    def mark_publish_task_completed(self):
        workflow_tasks = self.criteria.workflow.workflow_tasks.filter(
            task_type=Task.TaskTypeChoice.PUBLISH.value
        )
        self.approve_tasks(workflow_tasks)

    def process(self):
        self.mark_publish_task_completed()
