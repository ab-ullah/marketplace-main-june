from rest_framework.generics import RetrieveUpdateAPIView, ListCreateAPIView, UpdateAPIView, get_object_or_404

from api.applications.models import Application
from api.comments.models import ApplicationComment
from api.comments.serializers import ApplicationCommentSerializer, CommentSerializer, CommentsSerializer
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CommentListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = ApplicationCommentSerializer
    queryset = ApplicationComment.objects.all()
    permission_classes = (IsSidecarAdminUser,)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        application_id = self.request.query_params.get('application_id')
        if application_id:
            application = get_object_or_404(
                Application,
                id=application_id,
                company=self.company
            )
            context['application'] = application
        else:
            context['application'] = None
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        application_id = self.request.query_params.get('application_id')
        kyc_id = self.request.query_params.get('kyc_id')
        status = self.request.query_params.get('status')
        if application_id:
            queryset = queryset.filter(application_id=int(application_id))
        if kyc_id:
            queryset = queryset.filter(kyc_record=int(kyc_id))
        if status:
            queryset = queryset.filter(kyc_record=int(status))
        return queryset


class CommentRetrieveUpdateAPIView(AdminViewMixin, RetrieveUpdateAPIView):
    serializer_class = ApplicationCommentSerializer
    queryset = ApplicationComment.objects.all()
    permission_classes = (IsSidecarAdminUser,)


class UpdateCommentAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = CommentsSerializer
    queryset = ApplicationComment.objects.all()
