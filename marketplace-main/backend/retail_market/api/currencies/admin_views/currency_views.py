from rest_framework.generics import ListAPIView

from api.currencies.models import Currency
from api.currencies.serializers import CurrencySerializer
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CompanyCurrencyListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CurrencySerializer

    def get_queryset(self):
        return Currency.objects.filter(company=self.company)
