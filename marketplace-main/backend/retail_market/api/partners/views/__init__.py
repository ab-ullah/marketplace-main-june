from api.mixins.list_create_mixin import CreateListModelMixin
from api.permissions.company_machine_permission import IsCompanyMachine


class BasePartnerView(CreateListModelMixin):
    permission_classes = (IsCompanyMachine,)

    @property
    def company(self):
        return self.request.company

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['company'] = self.company
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(company=self.company)
        return qs
