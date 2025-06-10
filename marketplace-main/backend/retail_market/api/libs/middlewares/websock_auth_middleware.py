from urllib.parse import parse_qs

import jwt
from channels.auth import AuthMiddleware
from channels.db import database_sync_to_async
from channels.sessions import SessionMiddleware, CookieMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections

from api.libs.auth0.jwt import jwt_decode_token


@database_sync_to_async
def get_user(scope):
    close_old_connections()
    query_string = parse_qs(scope['query_string'].decode())
    token = query_string.get('token')
    if not token:
        return AnonymousUser()
    try:
        payload = jwt_decode_token(token[0])
        username = payload.get('sub').replace('|', '.')
        user = get_user_model().objects.get(username=username)
    except (jwt.ExpiredSignatureError, get_user_model().DoesNotExist) as e:
        return AnonymousUser()

    if not user.is_active:
        return AnonymousUser()

    return user


class TokenAuthMiddleware(AuthMiddleware):
    async def resolve_scope(self, scope):
        scope['user']._wrapped = await get_user(scope)


def TokenAuthMiddlewareStack(inner):
    return CookieMiddleware(SessionMiddleware(TokenAuthMiddleware(inner)))
