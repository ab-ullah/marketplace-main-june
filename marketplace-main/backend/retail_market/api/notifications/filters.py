from django_filters import rest_framework as filters

from api.notifications.models import UserNotification


class UserNotificationFilter(filters.FilterSet):
    fund_id = filters.BaseInFilter(field_name="fund_id")
    investor_id = filters.BaseInFilter(field_name="investor_id")
    type = filters.BaseInFilter(field_name="notification_type")
    document_date__gte = filters.DateFilter(field_name='document_date', lookup_expr='gte')
    document_date__lte = filters.DateFilter(field_name='document_date', lookup_expr='lte')
    due_date__gte = filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date__lte = filters.DateFilter(field_name='due_date', lookup_expr='lte')
    created_at__gte = filters.DateFilter(field_name='created_at__date', lookup_expr='gte')
    created_at__lte = filters.DateFilter(field_name='created_at__date', lookup_expr='lte')

    class Meta:
        model = UserNotification
        fields = ['fund_id', 'investor_id', 'type']
