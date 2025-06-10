from django.urls import re_path

from api.notifications.views.notification_filter_views import NotificationFilterOptionsAPIView
from api.notifications.views.notification_views import UserNotificationListCreateAPIView, \
    UserNotificationRetrieveUpdateAPIView

urlpatterns = [
    re_path(r'^$', UserNotificationListCreateAPIView.as_view(), name='notifications-list'),
    re_path(r'^(?P<pk>\d+)$', UserNotificationRetrieveUpdateAPIView.as_view(), name='notifications-detail'),
    re_path(r'^filters$', NotificationFilterOptionsAPIView.as_view(), name='notifications-filters'),
]
