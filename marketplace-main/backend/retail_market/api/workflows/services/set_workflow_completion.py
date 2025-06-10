from api.applications.utils import get_application_or_404


class SetWorkFlowCompletion:
    def __init__(self, fund_external_id, user_id, module, completion_status):
        self.fund_external_id = fund_external_id
        self.user_id = user_id
        self.module = module
        self.completion_status = completion_status

    def process(self):
        application = get_application_or_404(
            params={'user_id': self.user_id, 'fund__external_id': self.fund_external_id}
        )
        if not application.workflow:
            return
        parent_workflow = application.workflow
        for workflow in parent_workflow.child_workflows.filter(module=self.module):
            if not workflow.has_review_task_created():
                workflow.is_completed = self.completion_status
                workflow.save(update_fields=['is_completed'])
