from django.urls import path, re_path

from api.agreements.admin_views.agreement_views import AdminApplicantAgreementDocumentListView, \
    GetAdminSigningURLAPIView, StoreAdminSignedResponse

urlpatterns = [
    path(
        '<application_id>',
        AdminApplicantAgreementDocumentListView.as_view(),
        name="admin-agreement-documents-list-view"
    ),
    re_path(
        r'^signing_url/(?P<envelope_id>.+)$',
        GetAdminSigningURLAPIView.as_view(),
        name="get-admin-signing-url-api-view"
    ),
    re_path(
        r'^store_response/(?P<envelope_id>.+)$',
        StoreAdminSignedResponse.as_view(),
        name="store-response-url-api-view"
    ),
]
