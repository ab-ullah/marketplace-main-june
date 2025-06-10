from django.urls import path, re_path

from api.applications.views import application_views as views
from api.applications.views import application_document_views as document_views

urlpatterns = [
    path(
        'funds/<fund_external_id>/company-documents/<int:pk>',
        document_views.ApplicationCompanyDocumentUpdateAPIView.as_view(),
        name="application-company-documents-update"
    ),
    path(
        'funds/<fund_external_id>/company-documents/<skip_completed_required_docs>',
        document_views.ApplicationCompanyDocumentListAPIView.as_view(),
        name="application-company-documents"
    ),
    re_path(
        'funds/(?P<fund_external_id>.+)/company-documents/signing_url/(?P<applicant_company_document_id>\d+)',
        document_views.GetUserSigningURLAPIView.as_view(),
        name="application-company-documents-signing-url"
    ),
    re_path(
        'funds/(?P<fund_external_id>.+)/company-documents/store_response/(?P<envelope_id>.+)',
        document_views.StoreUserSignedResponse.as_view(),
        name="application-company-documents-signing-url"
    ),
    path('funds/<fund_external_id>/applications', views.ApplicationListAPIView.as_view(), name="application-retrieve"),
    path('funds/<fund_external_id>/default', views.ApplicationDefaultsAPIView.as_view(), name="application-defaults"),
    path(
        'funds/<fund_external_id>/has-pending-requests',
        views.ApplicationHasRequestedChangeAPIView.as_view(),
        name="has-pending-requests"
    ),
    path(
        'funds/<fund_external_id>/state',
        views.UserApplicationStateListCreateAPIView.as_view(),
        name="user-fund-application-state"
    ),
    path('', views.ApplicationCreateAPIView.as_view(), name="application-create"),
    path('applications/<uuid>', views.ApplicationUpdateAPIView.as_view(), name="application-update"),
    path(
        'application-document-request/<application_id>',
        views.ApplicationDocumentsRequestsListView.as_view(),
        name='application-document-request-create'
    ),
    path(
        'application-document-request-response',
        views.ApplicationDocumentRequestResponse.as_view(),
        name='application-document-request-response'
    ),
    path(
        'application-document-request-response/<application_id>',
        views.ApplicationDocumentRequestResponse.as_view(),
        name='application-document-request-response'
    ),
    path(
        'application-document-response-delete/<pk>',
        views.ApplicationDocumentRequestResponseDestroyView.as_view(),
        name='application-document-request-response-delete'
    ),
    path(
        'submit-changes',
        views.ApplicationSubmitChangesAPIView.as_view(),
        name='submit-changes-for-application'
    ),
    path(
        'application-workflow-status/<fund_external_id>',
        views.ApplicationWorkflowStatusAPIView.as_view(),
        name='application-workflow-status'
    ),
    path(
        'application-module-states/<fund_external_id>',
        views.ApplicationModuleStatesAPIView.as_view(),
        name='application-module-states'
    ),
    path(
        'application-next-state/<fund_external_id>',
        views.ApplicationNextStateAPIView.as_view(),
        name='application-next-state'
    ),
    path('<uuid>', views.ApplicationBaseUpdateAPIView.as_view(), name="application-base-update"),
]
