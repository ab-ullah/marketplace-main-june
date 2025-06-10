import random

from django.contrib.auth.models import Group

from api.admin_users.models import AdminUser
from api.admin_users.selectors.select_reviewers import \
    select_random_reviewer_by_group
from api.capital_calls.models import FundCapitalCall
from api.funds.models import Fund
from api.users.constants import CAPITAL_CALL_REVIEWER
from api.workflows.models import Task, WorkFlow


class CreateCapitalCallTask:
    def __init__(self, fund: Fund, capital_call: FundCapitalCall, admin_user: AdminUser):
        self.fund = fund
        self.capital_call = capital_call
        self.admin_user = admin_user

    def create_workflow_task(self):
        name = f'Capital-Call-review'
        workflow = WorkFlow.objects.create(
            name=f'{name}-workflow',
            fund=self.fund,
            company=self.fund.company,
            created_by=self.admin_user,
            workflow_type=WorkFlow.WorkFlowTypeChoices.REVIEW.value,
            module=WorkFlow.WorkFlowModuleChoices.CAPITAL_CALL.value
        )

        self.capital_call.workflow = workflow
        self.capital_call.save()

        reviewer = select_random_reviewer_by_group(company=self.fund.company, group_name=CAPITAL_CALL_REVIEWER)
        group = Group.objects.filter(name=CAPITAL_CALL_REVIEWER).first()
        Task.objects.create(
            workflow=workflow,
            assigned_to=reviewer,
            assigned_to_group=group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value,
            name=f'{name}-task',
            status=Task.StatusChoice.PENDING.value
        )
