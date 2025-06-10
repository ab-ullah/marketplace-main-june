import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from api.libs.utils.socket_communication import get_socket_group_name, fetch_workflow_comments, get_workflow_group_name


class WorkflowCommentConsumer(WebsocketConsumer):
    def connect(self):
        user = self.scope["user"]
        workflow_id = self.scope.get("url_route", {}).get("kwargs", {}).get("workflow_id")
        if user.is_anonymous:
            self.close()
            return

        group_name = get_workflow_group_name(workflow_id)

        async_to_sync(self.channel_layer.group_add)(
            group_name,
            self.channel_name
        )

        self.accept()

        workflow_comments = fetch_workflow_comments(workflow_id)
        return self.send(text_data=json.dumps(workflow_comments))

    def disconnect(self, close_code):
        self.close()

    def notify(self, payload):
        data = payload['data']
        return self.send(text_data=json.dumps(data))
