from django.urls import path

from api.comments.views.comment_views import (
    CommentListAPIView, CommentRetrieveUpdateAPIView, UpdateCommentsForModule, ReplyListCreateAPIView,
    ReplyRetrieveUpdateAPIView
)

urlpatterns = [
    path('', CommentListAPIView.as_view(), name='comment-list-view'),
    path('update-by-module', UpdateCommentsForModule.as_view(), name='update-comments-status-for-module'),
    path('<pk>', CommentRetrieveUpdateAPIView.as_view(), name='comment-retrieve-update-view'),
    path('<comment_id>/replies', ReplyListCreateAPIView.as_view(), name='comment-reply-list-create-view'),
    path('<comment_id>/replies/<pk>', ReplyRetrieveUpdateAPIView.as_view(), name='comment-reply-retrieve-update-view'),
]
