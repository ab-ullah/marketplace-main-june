from rest_framework.filters import OrderingFilter


class CustomOrderFilter(OrderingFilter):
    allowed_custom_filters = []
    fields_related = {}

    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param)
        if params:
            fields = [param.strip() for param in params.split(',')]
            ordering = []
            for f in fields:
                base_name = f.strip('-')
                filed_name = self.fields_related.get(base_name)
                if not filed_name:
                    continue
                if f.startswith('-'):
                    filed_name = f'-{filed_name}'
                ordering.append(filed_name)
            if ordering:
                return ordering

        return self.get_default_ordering(view)

    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)
        if ordering:
            return queryset.order_by(*ordering)

        return queryset
