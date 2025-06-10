from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView

from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.notifications.models import PublishedFundUserNotification, UserNotification


class NotificationFilterOptionsAPIView(CompanyUserViewMixin, APIView):
    def get(self, request):
        notification_model = UserNotification if self.show_unpublished_funds else PublishedFundUserNotification
        base_queryset = notification_model.objects.filter(
            Q(user_id__in=self.company_user_ids) |
            Q(investor_id__in=self.investor_ids)
        )

        fund_id = request.GET.get('fund_id')
        investor_id = request.GET.get('investor_id')

        if fund_id:
            base_queryset = base_queryset.filter(fund_id=fund_id)

        if investor_id:
            base_queryset = base_queryset.filter(investor_id=investor_id)

        notifications = base_queryset.prefetch_related('fund').prefetch_related('investor')
        has_unread_notification = base_queryset.filter(is_read=False).exists()
        fund_options = []
        seen_funds = set()
        investor_options = []
        seen_investors = set()
        type_options = []
        seen_types = set()
        for notification in notifications:
            if notification.fund and notification.fund_id not in seen_funds:
                fund_options.append({'value': notification.fund_id, 'label': notification.fund.name})
                seen_funds.add(notification.fund_id)
            if notification.investor_id and notification.investor_id not in seen_investors:
                investor_options.append({'value': notification.investor_id, 'label': notification.investor.name})
                seen_investors.add(notification.investor_id)
            if notification.notification_type not in seen_types:
                type_options.append(
                    {'value': notification.notification_type, 'label': notification.get_notification_type_display()}
                )
                seen_types.add(notification.notification_type)

        return Response({
            'fund_options': fund_options,
            'type_options': type_options,
            'investor_options': investor_options,
            'has_unread_notification': has_unread_notification
        })
