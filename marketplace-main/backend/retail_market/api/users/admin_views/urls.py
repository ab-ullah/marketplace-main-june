from django.urls import re_path

from api.users.admin_views.invite_views import UsersInviteListCreateAPIView, UsersInviteUpdateAPIView, \
    ParticipantsListAPIView
from api.users.admin_views.user_views import (
    UsersListAPIView, UserDeleteAPIView, AllUsersListAPIView, UpdateUserAPIView, UserCreateAPIView
)

ADMIN_USERS_PARTICIPANTS = 'admin-users-participants'

urlpatterns = [
    re_path(r'^$', UsersListAPIView.as_view(), name='admin-users-list-view'),
    re_path(r'^create$', UserCreateAPIView.as_view(), name='admin-users-create-view'),
    re_path(r'^invites$', UsersInviteListCreateAPIView.as_view(), name='admin-users-invites'),
    re_path(r'^participants$', ParticipantsListAPIView.as_view(), name=ADMIN_USERS_PARTICIPANTS),
    re_path(r'^invites/(?P<pk>\d+)$', UsersInviteUpdateAPIView.as_view(), name='admin-users-invites-update'),
    re_path(
        r'^(?P<pk>\d+)$',
        UserDeleteAPIView.as_view(),
        name='admin-users-delete-view'
    ),
    re_path(r'^all$', AllUsersListAPIView.as_view(), name='admin-all-users-list-view'),
    re_path(r'^(?P<pk>\d+)/update$', UpdateUserAPIView.as_view(), name='admin-update-user-view'),
]
