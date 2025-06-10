from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from api.eligibility_criteria.models import CustomSmartBlock, CustomSmartBlockField
from api.eligibility_criteria.serializers import CustomSmartBlockSerializer, CustomSmartBlockFieldSerializer
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CustomSmartBlockListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CustomSmartBlockSerializer
    queryset = CustomSmartBlock.objects.all()


class CustomSmartBlockUpdateAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CustomSmartBlockSerializer
    queryset = CustomSmartBlock.objects.all()


class CustomSmartBlockFieldListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CustomSmartBlockFieldSerializer

    def get_queryset(self):
        return CustomSmartBlockField.objects.filter(
            block_id=self.kwargs['block_id'],
            block__company=self.company
        )


class CustomSmartBlockFieldUpdateAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CustomSmartBlockFieldSerializer

    def get_queryset(self):
        return CustomSmartBlockField.objects.filter(
            block_id=self.kwargs['block_id'],
            block__company=self.company
        )
