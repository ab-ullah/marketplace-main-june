from rest_framework.generics import (
    RetrieveUpdateAPIView, ListAPIView, CreateAPIView, ListCreateAPIView, get_object_or_404
)

from api.comments.models import ApplicationComment, ApplicationCommentReply
from api.comments.serializers import (
    CommentUpdatedByModuleSerializer, ApplicationCommentSerializer, ApplicationCommentReplySerializer,
    ApplicationCommentReplyCreateSerializer
)
from api.mixins.company_user_mixin import CompanyUserViewMixin


class CommentListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = ApplicationCommentSerializer
    queryset = ApplicationComment.objects.all()

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
        queryset = queryset.filter(comment_for=self.request.user)
        return queryset.prefetch_related('replies')


class CommentRetrieveUpdateAPIView(CompanyUserViewMixin, RetrieveUpdateAPIView):
    serializer_class = ApplicationCommentSerializer
    queryset = ApplicationComment.objects.all()


class UpdateCommentsForModule(CompanyUserViewMixin, CreateAPIView):
    serializer_class = CommentUpdatedByModuleSerializer
    queryset = ApplicationComment.objects.all()


class ReplyListCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = ApplicationCommentReplySerializer
    queryset = ApplicationCommentReply.objects.all()

    def get_queryset(self):
        queryset = ApplicationCommentReply.objects.filter(comment_id=self.kwargs['comment_id'])
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ApplicationCommentReplySerializer
        else:
            return ApplicationCommentReplyCreateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['comment'] = get_object_or_404(ApplicationComment, id=self.kwargs['comment_id'])
        return context


class ReplyRetrieveUpdateAPIView(CompanyUserViewMixin, RetrieveUpdateAPIView):
    serializer_class = ApplicationCommentReplySerializer
    queryset = ApplicationCommentReply.objects.all()

    def get_queryset(self):
        queryset = ApplicationCommentReply.objects.filter(comment_id=self.kwargs['comment_id'])
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['comment'] = get_object_or_404(ApplicationComment, id=self.kwargs['comment_id'])
        return context

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ApplicationCommentReplySerializer
        else:
            return ApplicationCommentReplyCreateSerializer
