from django.urls import re_path

from api.users.views.user_views import CreateUserListCreateAPIView, UserInfoAPIView, RegisterFirstLogin, \
    UserUnreadNotificationCountAPIView

urlpatterns = [
    re_path(r'^$', CreateUserListCreateAPIView.as_view(), name='users-list-create'),
    re_path(r'^info$', UserInfoAPIView.as_view(), name='users-info-view'),
    re_path(r'^first_login$', RegisterFirstLogin.as_view(), name='user-first-login'),
    re_path(
        r'^unread_notification_count$',
        UserUnreadNotificationCountAPIView.as_view(),
        name='user-unread-notification-count'
    ),
]
