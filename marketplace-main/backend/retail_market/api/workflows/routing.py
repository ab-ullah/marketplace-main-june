from django.urls import re_path

from api.workflows.consumers.comment_consumer import WorkflowCommentConsumer
from api.workflows.consumers.task_consumer import RecentTasksCountConsumer

websocket_urlpatterns = [
    re_path(r'^ws/tasks/recent-count/$', RecentTasksCountConsumer.as_asgi()),
    re_path(r'^ws/workflows/(?P<workflow_id>\d+)/comments$', WorkflowCommentConsumer.as_asgi()),
]
