from django.urls import path, re_path

from api.carry_pools.views.carry_documents import PendingDocumentsCountAPIView, ParticipantCarryDocumentUpdateAPIView, \
    GetUserSigningURLAPIView, StoreUserSignedResponse
from api.carry_pools.views.participant_dashboard import AllocationsView, OverviewView, AllocationOverviewView, \
    ParticipantVestingScheduleDisplayView, CarryDocumentsAPIView, CarryPoolAllocationDetailAPIView, \
    ParticipantDistributionsView, CarryGpCommitmentsListAPIView

urlpatterns = [
    path(
        'pending_documents',
        PendingDocumentsCountAPIView.as_view(),
        name="pending-carry-documents-count"
    ),
    path(
        'allocations',
        AllocationsView.as_view(),
        name="participant-carry-plans"
    ),
    path(
        'overview',
        OverviewView.as_view(),
        name="carry-participant-overview"
    ),
    path(
        'distributions',
        ParticipantDistributionsView.as_view(),
        name="investor-list-distributions"
    ),
    path(
        'carry-gp-commitments',
        CarryGpCommitmentsListAPIView.as_view(),
        name="carry-gp-commitments"
    ),
    path(
        'participants_carry_documents/<int:pk>',
        ParticipantCarryDocumentUpdateAPIView.as_view(),
        name="carry-document-participant-get-update"
    ),
    path(
        'participants_carry_documents',
        CarryDocumentsAPIView.as_view(),
        name="carry-document-participants-dashboard"
    ),
    path(
        'vesting_schedules/<int:pk>',
        ParticipantVestingScheduleDisplayView.as_view(),
        name='participant-vesting-schedule-display'),
    path(
        'carry_pools/<str:external_id>/allocations/<str:allocation_id>',
        CarryPoolAllocationDetailAPIView.as_view(),
        name="carry-pool-allocation-detail"
    ),
    path(
        '<str:external_id>',
        AllocationOverviewView.as_view(),
        name="carry-allocation-overview"
    ),
    re_path(
        r'^signing_url/(?P<participant_carry_document_id>\d+)$',
        GetUserSigningURLAPIView.as_view(),
        name="carry-get-signing-url-api-view"
    ),
    re_path(
        r'^store_response/(?P<envelope_id>.+)$',
        StoreUserSignedResponse.as_view(),
        name="carry-store-response-url-api-view"
    ),
]
