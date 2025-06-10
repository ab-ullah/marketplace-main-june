from .wsgi import *
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from api.libs.middlewares.websock_auth_middleware import TokenAuthMiddlewareStack
from api.workflows.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": TokenAuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
