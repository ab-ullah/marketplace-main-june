from django.urls import path
from api.kyc_records.admin_views import views
from api.kyc_records.admin_views.participant_views import UserKycRecordsListAPIView, UserKycRecordsCreateAPIView, CarryParticipantKycRecordsListAPIView

urlpatterns = [
    path('document-options', views.DocumentFieldOptions.as_view(), name="admin-kyc-document-options"),
    path('user/kyc-records', UserKycRecordsCreateAPIView.as_view(), name="user-kyc-records-create-api-view"),
    path('user/<user_id>/kyc-records', UserKycRecordsListAPIView.as_view(), name="user-kyc-records-list-api-view"),
    path('carry-participant/<user_id>/kyc-records', CarryParticipantKycRecordsListAPIView.as_view(), name="carry-participant-kyc-records-list-api-view"),
    path('<uuid>', views.KYCRetrieveAPIView.as_view(), name="admin-kyc-records-get-uuid"),
    path('<uuid>/update', views.KYCUpdateAPIView.as_view(), name="admin-kyc-update-api-view"),
    path('workflows/<wf_slug>/kyc_records', views.KYCListAPIView.as_view(), name="admin-kyc-records-list"),
    path('workflows/<wf_slug>/kyc_records/<pk>/', views.KYCRetrieveUpdateDestroyAPIView.as_view(),
         name='admin-kyc-record-get-update-view'),
    path('<kyc_record_id>/documents', views.KYCDocumentListAPIView.as_view(), name='admin-kyc-document-list-view'),
    path('<kyc_record_id>/documents/<pk>', views.KYCDocumentUpdateAPIView.as_view(), name='admin-kyc-document-update-view'),
    path('workflows/<wf_slug>/kyc_records/<kyc_record_id>/participants/<pk>', views.KYCParticipantAPIView.as_view(),
         name='kyc-record-create-participant-view'),
    path('workflows/<wf_slug>/kyc_records/<kyc_entity_id>/participants/<kyc_record_id>/documents',
         views.KYCDocumentListAPIView.as_view(),
         name='admin-kyc-record-participant-view'),
    path('application/<application_id>/info',
         views.ApplicationKycInfoListAPIView.as_view(),
         name='application-kyc-records-with-documents-list-view'),
]
