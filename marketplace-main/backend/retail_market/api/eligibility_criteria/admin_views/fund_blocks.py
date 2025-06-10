from django.db.models import Prefetch
from rest_framework.generics import ListAPIView

from api.eligibility_criteria.models import Block, BlockCategory
from api.eligibility_criteria.serializers import BlockCategorySerializer
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class BlockListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = BlockCategorySerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        blocks = Block.objects.select_related('country', 'region')

        return BlockCategory.objects.filter(
            company=self.company
        ).prefetch_related(Prefetch('category_blocks', queryset=blocks)).order_by('position')
