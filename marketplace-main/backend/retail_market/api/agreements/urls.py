from django.urls import path, re_path

from api.agreements.views.agreement_signing_views import WitnessListCreateAPIView, \
    GetUserSigningURLAPIView, GetWitnessSigningURLAPIView, StoreUserSignedResponse, GetWitnessRequesterDetails, \
    StoreWitnessSignedResponse, ApplicantDocumentCreateAPIView

urlpatterns = [
    path(
        '<fund_external_id>',
        ApplicantDocumentCreateAPIView.as_view(),
        name="agreement-documents-list-view"
    ),
    path('<fund_external_id>/witness', WitnessListCreateAPIView.as_view(), name="witness-create-view"),
    path(
        '<fund_external_id>/agreements',
        ApplicantDocumentCreateAPIView.as_view(),
        name="applicant-documents-list-create-view"
    ),
    re_path(
        r'^signing_url/(?P<applicant_agreement_document_id>\d+)$',
        GetUserSigningURLAPIView.as_view(),
        name="get-signing-url-api-view"
    ),
    re_path(
        r'^witness_signing_url/(?P<uuid>.+)/document/(?P<envelope_id>.+)$',
        GetWitnessSigningURLAPIView.as_view(),
        name="get-witness-signing-url-api-view"
    ),
    re_path(
        r'^witness_requester/(?P<uuid>.+)$',
        GetWitnessRequesterDetails.as_view(),
        name="get-witness-requestor-detail-view"
    ),
    re_path(
        r'^store_response/(?P<envelope_id>.+)$',
        StoreUserSignedResponse.as_view(),
        name="store-response-url-api-view"
    ),
    re_path(
        r'^witness_store_response/(?P<uuid>.+)/document/(?P<envelope_id>.+)$',
        StoreWitnessSignedResponse.as_view(),
        name="store-witness-signing-url-api-view"
    ),
]
