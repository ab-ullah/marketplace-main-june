from django.urls import re_path

from api.admin_users.views.admin_user_views import (
    AdminUserListAPIView, AdminUserRetrieveUpdateAPIView, CompanyAdminUserListAPIView, CompanyInfoRetrieveAPIView,
    AdminUserDetailAPIView, AdminInfoRetrieveAPIView
)

urlpatterns = [
    re_path(r'^$', AdminUserListAPIView.as_view(), name='admin-users-list'),
    re_path(r'^me$', AdminUserDetailAPIView.as_view(), name='admin-users-detail'),
    re_path(r'^company$', CompanyAdminUserListAPIView.as_view(), name='company-admin-users-list'),
    re_path(r'^company-info$', CompanyInfoRetrieveAPIView.as_view(), name='company-info-view'),
    re_path(r'^(?P<pk>\d+)$', AdminUserRetrieveUpdateAPIView.as_view(), name='admin-user-retrieve-update'),
    re_path(r'^admin-info$', AdminInfoRetrieveAPIView.as_view(), name='admin-info-view'),
]
