import random

from django.contrib.auth.models import Group

from api.admin_users.models import AdminUser
from api.admin_users.selectors.select_reviewers import \
    select_random_reviewer_by_group
from api.distribution_notices.models import DistributionNotice
from api.funds.models import Fund
from api.users.constants import DISTRIBUTION_NOTICE_REVIEWER
from api.workflows.models import Task, WorkFlow


class CreateDistributionNoticeTask:
    def __init__(self, fund: Fund, distribution_notice: DistributionNotice, admin_user: AdminUser):
        self.fund = fund
        self.distribution_notice = distribution_notice
        self.admin_user = admin_user

    def create_workflow_task(self):
        name = f'Distribution-Notice-review'
        workflow = WorkFlow.objects.create(
            name=f'{name}-workflow',
            fund=self.fund,
            company=self.fund.company,
            created_by=self.admin_user,
            workflow_type=WorkFlow.WorkFlowTypeChoices.REVIEW.value,
            module=WorkFlow.WorkFlowModuleChoices.DISTRIBUTION_NOTICE.value
        )

        self.distribution_notice.workflow = workflow
        self.distribution_notice.save()

        reviewer = select_random_reviewer_by_group(
            company=self.fund.company, group_name=DISTRIBUTION_NOTICE_REVIEWER)

        group = Group.objects.filter(name=DISTRIBUTION_NOTICE_REVIEWER).first()
        Task.objects.create(
            workflow=workflow,
            assigned_to=reviewer,
            assigned_to_group=group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value,
            name=f'{name}-task',
            status=Task.StatusChoice.PENDING.value
        )
