from django_filters import rest_framework as filters
from rest_framework.filters import OrderingFilter
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView

from api.libs.pagination.api_pagination import CustomPagination
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.notifications.filters import UserNotificationFilter
from api.notifications.models import PublishedFundUserNotification, UserNotification
from api.notifications.serializers import NotificationSerializer
from api.notifications.services.user_notifications_selector import get_user_notifications_queryset


class BaseNotificationView(CompanyUserViewMixin):
    def get_queryset(self):
        notification_model = UserNotification if self.show_unpublished_funds else PublishedFundUserNotification
        queryset = notification_model.objects.filter(company_id__in=self.company_ids)
        return get_user_notifications_queryset(
            queryset=queryset,
            company_user_ids=self.company_user_ids,
            investor_ids=self.investor_ids
        )


class UserNotificationListCreateAPIView(BaseNotificationView, ListAPIView):
    serializer_class = NotificationSerializer
    queryset = PublishedFundUserNotification.objects.all()
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend, OrderingFilter)
    filterset_class = UserNotificationFilter
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class UserNotificationRetrieveUpdateAPIView(BaseNotificationView, RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
