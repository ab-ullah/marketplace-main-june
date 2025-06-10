import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from api.libs.utils.socket_communication import get_socket_group_name, fetch_user_task_count_payload


class RecentTasksCountConsumer(WebsocketConsumer):
    def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            self.close()
            return

        group_name = get_socket_group_name(user)

        async_to_sync(self.channel_layer.group_add)(
            group_name,
            self.channel_name
        )

        self.accept()
        task_count_info = fetch_user_task_count_payload(user)
        return self.send(text_data=json.dumps(task_count_info))

    def disconnect(self, close_code):
        self.close()

    def notify(self, payload):
        data = payload['data']
        return self.send(text_data=json.dumps(data))
