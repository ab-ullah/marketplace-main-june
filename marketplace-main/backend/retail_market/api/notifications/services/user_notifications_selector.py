from typing import List

from django.db.models import Q


def get_user_notifications_queryset(queryset, company_user_ids: List[int], investor_ids: List[int]):
    queryset = queryset.filter(
        Q(user_id__in=company_user_ids) |
        (Q(investor_id__in=investor_ids) & Q(user_id__in=company_user_ids)) # since an investor can belong to more than one
        # user, make sure we only fetch notifications for the user and investor to prevent duplicates.
    ).prefetch_related('documents'). \
        prefetch_related('investor'). \
        prefetch_related('fund')
    return queryset
