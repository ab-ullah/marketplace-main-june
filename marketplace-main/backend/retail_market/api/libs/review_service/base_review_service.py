from django.contrib.auth.models import Group

from api.admin_users.selectors.select_reviewers import select_random_reviewer_by_group
from api.companies.models import Company, CompanyUser
from api.workflows.models import WorkFlow, Task


class BaseReviewService:
    def get_company_user(self):
        try:
            return CompanyUser.objects.get(
                company=self.company,
                user=self.user
            )
        except CompanyUser.DoesNotExist:
            return None

    @staticmethod
    def complete_user_task(workflow: WorkFlow):
        if not workflow:
            return
        workflow.workflow_tasks.filter(
            completed=False,
            task_type=Task.TaskTypeChoice.USER_RESPONSE.value
        ).update(completed=True)

    @staticmethod
    def reviewer_task_exists(group_name: str, workflow: WorkFlow) -> bool:
        return Task.objects.filter(
            workflow=workflow,
            assigned_to_group__name=group_name
        ).exists()

    @staticmethod
    def mark_current_task_as_incomplete(group_name: str, workflow: WorkFlow):
        tasks = Task.objects.filter(
            workflow=workflow,
            assigned_to__groups__name=group_name
        )
        # TODO
        # Look for a way to update thee tasks without
        # having to loop over them
        for task in tasks:
            task.status = Task.StatusChoice.PENDING.value
            task.completed = False
            task.save(update_fields=["status", "completed"])

    def create_task(self, group_name: str, workflow: WorkFlow, company: Company, reopen_existing: bool = False):
        if self.reviewer_task_exists(group_name=group_name, workflow=workflow):
            if reopen_existing:
                self.mark_current_task_as_incomplete(group_name=group_name, workflow=workflow)
            return
        reviewer = select_random_reviewer_by_group(company=company, group_name=group_name)
        group = Group.objects.filter(name=group_name)
        if group.exists() and reviewer:
            return Task.objects.create(
                workflow=workflow,
                assigned_to=reviewer,
                assigned_to_group=group.first(),
                task_type=Task.TaskTypeChoice.REVIEW_REQUEST,
            )

    @staticmethod
    def get_enabled_workflows(fund):
        return fund.get_enabled_workflows()
