from django.urls import re_path

from api.companies.admin_views.company_view import (
    CompanyRetrieveUpdateAPIView, CompanyDocumentsListCreateAPIView, CompanyDocumentRetrieveUpdateDestroyAPIView,
    CompanyProfileRetrieveUpdateAPIView, CompanyGroupListView, AddGroupUsersAPIView, CompanyReportListAPIView,
    CompanyDocumentsOptionsListAPIView
)

urlpatterns = [
    re_path(r'^$', CompanyRetrieveUpdateAPIView.as_view(), name='admin-company-retrieve-update-view'),
    re_path(r'^reports$', CompanyReportListAPIView.as_view(), name='admin-company-reports-list-view'),
    re_path(
        r'^profile$',
        CompanyProfileRetrieveUpdateAPIView.as_view(),
        name='admin-company-profile-retrieve-update-view'
    ),
    re_path(
        r'^documents$',
        CompanyDocumentsListCreateAPIView.as_view(),
        name='admin-company-documents-list-create-view'
    ),
    re_path(
        r'^documents-options$',
        CompanyDocumentsOptionsListAPIView.as_view(),
        name='admin-company-documents-options-list-view'
    ),
    re_path(
        r'^documents/(?P<pk>\d+)$',
        CompanyDocumentRetrieveUpdateDestroyAPIView.as_view(),
        name='admin-company-document-retrieve-update-destroy-view'
    ),
    re_path(r'^groups$', CompanyGroupListView.as_view(), name='admin-company-group-list'),
    re_path(r'^groups/(?P<pk>\d+)/add_users$', AddGroupUsersAPIView.as_view(), name='admin-add-group-users-view'),
]
