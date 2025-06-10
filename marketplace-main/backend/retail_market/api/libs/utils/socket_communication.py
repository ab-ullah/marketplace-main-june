from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from api.workflows.models import Task, Comment, WorkFlow
from api.workflows.serializers import CommentSerializer


def get_socket_group_name(user):
    return f'task-count-group-{user.id}'


def get_workflow_group_name(workflow_id):
    return f'workflow-comments-group-{workflow_id}'


def get_current_channel_layer():
    return get_channel_layer()


def fetch_user_task_count(user):
    return Task.objects.filter(
        assigned_to__user_id=user.id,
        completed=False
    ).exclude(
        workflow__module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
        workflow__workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        workflow__parent__isnull=True
    ).count()


def fetch_workflow_comments(workflow_id):
    return CommentSerializer(
        list(
            Comment.objects.filter(workflow_id=workflow_id).order_by('-created_at')
        ),
        many=True
    ).data


def fetch_user_task_count_payload(user):
    return {'count': fetch_user_task_count(user=user)}


def send_socket_notification(to_user, payload):
    channel_group_name = get_socket_group_name(to_user)
    channel_layer = get_current_channel_layer()
    async_to_sync(channel_layer.group_send)(channel_group_name, {"type": 'notify', 'data': payload})


def send_workflow_socket_notification(workflow_id, payload):
    channel_group_name = get_workflow_group_name(workflow_id)
    channel_layer = get_current_channel_layer()
    async_to_sync(channel_layer.group_send)(channel_group_name, {"type": 'notify', 'data': payload})
