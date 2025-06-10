from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
import logging

from api.constants.task_due_date import DEFAULT_NUMBER_OF_WORKING_DAYS
from api.libs.utils.date_utils import get_date_after_n_working_days
from api.libs.utils.socket_communication import fetch_user_task_count, send_socket_notification, \
    fetch_workflow_comments, send_workflow_socket_notification
from api.workflows.models import Task, Comment
from api.workflows.models import WorkFlow
from api.workflows.serializers import TaskSerializer
from api.workflows.services.send_task_email import SendTaskEmail

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Task)
def set_due_date_in_task(sender, instance: Task, *args, **kwargs):
    if not instance.due_date:
        start_date = timezone.now()
        instance.due_date = get_date_after_n_working_days(
            start_date=start_date,
            add_days=DEFAULT_NUMBER_OF_WORKING_DAYS
        )


@receiver(post_save, sender=Task)
def send_new_task_notification(sender, instance: Task, created, **kwargs):
    assigned_to = instance.assigned_to
    if not assigned_to:
        return
    data = {
        'count': fetch_user_task_count(assigned_to.user),
        'task': TaskSerializer(instance, context={"admin_user": assigned_to}).data
    }
    send_socket_notification(assigned_to.user, data)


@receiver(post_save, sender=Comment)
def send_new_comment_notification(sender, instance: Comment, created, **kwargs):
    workflow_id = instance.workflow_id
    data = fetch_workflow_comments(workflow_id)
    send_workflow_socket_notification(workflow_id, data)


@receiver(pre_save, sender=Task)
def get_previous_status(sender, instance, **kwargs):
    if instance.pk:
        instance._pre_save_status = Task.objects.get(pk=instance.pk).status
    else:
        instance._pre_save_status = None


@receiver(post_save, sender=Task)
def send_new_task_email(sender, instance: Task, created, **kwargs):
    if created or (
            not created and
            instance._pre_save_status in [
                Task.StatusChoice.APPROVED.value,
                Task.StatusChoice.CHANGES_REQUESTED.value,
                Task.StatusChoice.REJECTED.value
            ] and
            instance.status == Task.StatusChoice.PENDING.value):

        if created and instance.workflow.module == WorkFlow.WorkFlowModuleChoices.GP_SIGNING.value:
            # We are creating de-duplicated task email for gp signing flow, so we need to skip it here
            return

        try:
            SendTaskEmail(task_id=instance.id, company=instance.workflow.company).send_task_added_email()
        except Exception as e:
            logger.exception(e)


@receiver(post_save, sender=WorkFlow)
def mark_workflow_as_completed(sender, instance: WorkFlow, created, **kwargs):
    if not instance.parent_id:
        parent_workflow_id = instance.id
    else:
        parent_workflow_id = instance.parent_id

    total_nested_workflows = sender.nested_workflows.filter(parent_id=parent_workflow_id).count()
    completed_nested_workflows = sender.nested_workflows.filter(parent_id=parent_workflow_id, is_completed=True).count()

    if not total_nested_workflows:
        return

    # using update method here to avoid re-firing of post_save signal
    sender.objects.filter(id=parent_workflow_id).update(
        is_completed=total_nested_workflows == completed_nested_workflows
    )
