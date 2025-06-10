from django.db.models import Q
from django_filters import rest_framework as filters

from api.documents.models import Document
from api.libs.filters.ordering_filter import CustomOrderFilter


class DocumentsFilter(filters.FilterSet):
    investor_name__in = filters.BaseInFilter(method='filter_by_investor_id')
    fund_name__in = filters.BaseInFilter(method='filter_by_fund_id__in')
    document_type__in = filters.BaseInFilter(field_name="document_type")
    q = filters.CharFilter(method="text_search")
    created_at__gte = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_at__lte = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    file_date__gte = filters.DateFilter(field_name='file_date', lookup_expr='gte')
    file_date__lte = filters.DateFilter(field_name='file_date', lookup_expr='lte')

    class Meta:
        model = Document
        fields = ['document_type']

    def filter_by_fund_id__in(self, queryset, name, value):
        ids = list(map(int, value))
        return queryset.filter(
            Q(document_fund__fund_id__in=ids) | Q(document_investors__fund_id__in=ids)
        )

    def filter_by_investor_id(self, queryset, name, value):
        value = map(int, value)
        return queryset.filter(
            document_investors__investor_id__in=value
        )

    def text_search(self, queryset, name, value):
        # return queryset.filter(title__icontains=value)
        return queryset.filter(
            Q(document_investors__investor__name__icontains=value) | Q(
                document_investors__investor__investor_account_code__icontains=value)
        )


class InvestorDocumentOrderingFilter(CustomOrderFilter):
    allowed_custom_filters = ['document_name', 'created_at']
    fields_related = {
        'document_name': 'title',
        'created_at': 'created_at',
        'file_date': 'file_date',
    }
