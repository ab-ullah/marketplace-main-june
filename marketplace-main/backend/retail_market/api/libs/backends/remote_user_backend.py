from django.contrib.auth.backends import RemoteUserBackend


class CustomRemoteUserBackend(RemoteUserBackend):
    create_unknown_user = False
