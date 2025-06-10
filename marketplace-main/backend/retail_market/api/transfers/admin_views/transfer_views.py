from rest_framework.generics import ListAPIView, RetrieveAPIView, UpdateAPIView

from api.mixins.admin_view_mixin import AdminViewMixin
from api.transfers.models import Transfer
from api.transfers.serializers import TransferSerializer


class TransferListView(AdminViewMixin, ListAPIView):
    serializer_class = TransferSerializer
    queryset = Transfer.objects.all()

    def get_queryset(self):
        return Transfer.objects.filter(
            transfer_application__company=self.company
        )


class TransferRetrieveUpdateView(AdminViewMixin, RetrieveAPIView, UpdateAPIView):
    serializer_class = TransferSerializer
    queryset = Transfer.objects.all()

    def get_queryset(self):
        return Transfer.objects.filter(
            transfer_application__company=self.company
        )
