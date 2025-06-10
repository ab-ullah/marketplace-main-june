from django.urls import path

from api.notices.admin_views.notice_views import NoticeCreateView

urlpatterns = [
    path(
        '',
        NoticeCreateView.as_view(),
        name="notice-create"
    ),
]
