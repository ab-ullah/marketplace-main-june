from rest_framework.generics import ListCreateAPIView

from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.workflows.models import Comment
from api.workflows.serializers import CommentSerializer


class WorkFlowCommentsListCreateView(AdminViewMixin, ListCreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CommentSerializer

    def get_queryset(self):
        workflow_id = self.kwargs['workflow_id']
        return Comment.objects.filter(workflow_id=workflow_id).order_by('-created_at')
