from django.urls import path

from api.kyc_records import views

urlpatterns = [
    path('workflows/<wf_slug>/kyc_records', views.KYCCreateAPIView.as_view(), name="kyc-records-create"),
    path('<uuid>', views.KYCRetrieveAPIView.as_view(), name="kyc-records-get-uuid"),
    path(
        '<uuid>/funds/<fund_external_id>/update-workflow',
        views.UpdateKYCRecordWorkflow.as_view(),
        name="kyc-records-get-uuid"
    ),
    path('workflows/<wf_slug>/kyc_records/<pk>/', views.KYCRetrieveUpdateDestroyAPIView.as_view(),
         name='kyc-record-get-update-view'),
    path('<kyc_record_id>/documents', views.KYCDocumentCreateListAPIView.as_view(), name='kyc-document-list-view'),
    path('<kyc_record_id>/documents/<document_id>', views.KYCDocumentDeleteAPIView.as_view(),
         name='record-documents-view'),
    path('<kyc_record_id>/documents', views.KYCDocumentCreateListAPIView.as_view(), name='kyc-document-list-view'),
    path('<kyc_record_id>/risk_evaluation', views.KYCRiskEvaluationCreateAPIView.as_view(),
         name='kyc-risk-evaluation-view'),
    path('<kyc_record_id>/documents/<document_id>', views.KYCDocumentDeleteAPIView.as_view(),
         name='kyc-document-delete-view'),
    path('<kyc_record_id>/review/fund/<fund_external_id>', views.KYCReviewAPIView.as_view(),
         name='kyc-review-view'),
    path('schema', views.KYCSchemaListAPIView.as_view(), name='kyc-record-schema-view'),
    path('workflows/<wf_slug>/kyc_records/<kyc_record_id>/participants', views.KYCParticipantAPIView.as_view(),
         name='kyc-record-create-participant-view'),
    path('workflows/<wf_slug>/kyc_records/<kyc_record_id>/participants/<pk>', views.KYCParticipantAPIView.as_view(),
         name='kyc-record-create-participant-view'),
    path('workflows/<wf_slug>/kyc_records/<kyc_entity_id>/participants/<kyc_record_id>/documents',
         views.KYCDocumentCreateListAPIView.as_view(),
         name='kyc-record-create-participant-view'),
]
