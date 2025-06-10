from django.urls import path

from api.comments.admin_views.comment_views import CommentListCreateAPIView, CommentRetrieveUpdateAPIView, UpdateCommentAPIView

urlpatterns = [
    path('', CommentListCreateAPIView.as_view(), name='admin-comment-list-view'),
    path('<pk>', CommentRetrieveUpdateAPIView.as_view(), name='admin-comment-retrieve-update-view'),
    path('update/<pk>', UpdateCommentAPIView.as_view(), name='admin-comment-update-view'),
]
