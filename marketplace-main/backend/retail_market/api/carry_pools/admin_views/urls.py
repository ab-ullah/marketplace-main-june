from django.urls import path, re_path

from api.carry_pools.admin_views.distribution_views import CarryFundDistributionView, \
    DistributionCarryPlanDetailView, DistributionView
from api.carry_pools.admin_views.fund_carry_pools_views import (
    AllocationActionDetailView, AllocationActionListCreateView,
    CalculateVestedPoints, CarryPlanAllocationsAPIView,
    CarryPlanCompanyUserWithNoAllocationAPIView, CarryPlanListCreateAPIView,
    CarryPlanRetrieveUpdateDestroyAPIView, CarryPoolAddAPIView,
    CarryPoolDeleteAPIView, CarryFundsView, DealsListCreateView,
    DealRetrieveUpdateView, DealAllocationsView,
    UserCarryAllocationAPIView, FundWithDealsListView,
    MilestoneBasedVestingScheduleListCreateView,
    MilestoneBasedVestingScheduleRetrieveDestroyAPIView,
    MilestoneListCreateView, MilestoneRetrieveUpdateDestroyAPIView,
    ParticipantAPIView, PoolAllocationsAPIView,
    TimeBasedVestingScheduleListCreateView,
    TimeBasedVestingScheduleRetrieveDestroyAPIView, VestingScheduleDetailView,
    VestingScheduleDisplayView, VestingScheduleListCreateView, CarryFundParticipantsView,
    CarryDocumentsListCreateAPIView, CarryDocumentUpdateAPIView,
    CarryDocumentParticipantsListAPIView, GetCarryDocumentAdminSigningURLAPIView, StoreCarryDocumentAdminSignedResponse,
    ParticipantCompensationHistory, CarryPlanFirmLevelView, ForfeitureAPIView, ForfeitureListAPIView,
    ForfeitureRetrieveAPIView, ForfeitureUpdateDeleteAPIView, CarryPlanVestingSchedulesView, CarryPlanMilestoneView,
    UserCarryDocumentsView, CarryParticipantCreateAPIView, CarryPlanPreviewDiluteView,
    UserParticipantEmploymentRecordView, CarryPlanExportAPIView, AllocationsExportAPIView,
    CarryPlanDiluteView, CarryPlanAllocationDetailAPIView, CarrySubPoolAPIView, ParticipantInvestmentsView,
    UserParticipantsAPIView, UserParticipantProfileView, CarryListAllUsersView, CarryDocumentParticipantsReleaseAPIView,
    CarryDocumentParticipantsUpdateAPIView, SubPoolUpdateDeleteAPIView, SubPoolPointsMigrationsAPIView,
    SubPoolCreateAPIView, InvestmentTrancheListCreateView, InvestmentTrancheRetrieveUpdateView,
    MangerReportingFirmLevelView, MangerReportingDetailView,
    InvestmentTrancheAllocationsView, DealTranchesListView, CarryGpCommitmentListCreateUpdateAPIView,
    CarryGpCommitmentDetailAPIView, CarryGpCommitmentParticipantListAPIView, CarryParticipantEntityTypes,
    UserAllocationsExportAPIView, CarryHurdleListCreateAPIView, CarryHurdleDetailAPIView,
    AllocationValueAdjustmentListCreateAPIView, AllocationValueAdjustmentDetailAPIView,
    CarryPlanAdjustmentAllocationsAPIView, CarryCreateTransferAPIView, ForfeiturePreviewAPIView)



from api.carry_pools.admin_views.spv_share_class_views import (
    CarryShareClassCreateAPIView, CarryVehicleCreateAPIView, CarryShareClassRetrieveUpdateAPIView,
    CarryVehicleRetrieveUpdateAPIView
)
from api.carry_pools.admin_views.workflow_views import CarryPlanSubmitForApprovalView, CarryPlanPublishView

PARTICIPANT_ENTITY_TYPES_URL_NAME = "carry-participant-entity-types"

urlpatterns = [
    path(
        'carry-plans',
        CarryPlanListCreateAPIView.as_view(),
        name="carry-plans-list-create"
    ),
    path(
        'carry-plans/export',
        CarryPlanExportAPIView.as_view(),
        name="carry-plans-export-view"
    ),
    path(
        'allocations/export',
        AllocationsExportAPIView.as_view(),
        name="carry-plans-allocations-export-view"
    ),
    path(
        'participants/<user_id>/allocations/export',
        UserAllocationsExportAPIView.as_view(),
        name="carry-plans-participant-allocations-export-view"
    ),
    path(
        'carry-plan/<int:pk>',
        CarryPlanRetrieveUpdateDestroyAPIView.as_view(),
        name="carry-plan-retrieve-update-delete"
    ),
    path(
        'carry-plan/<int:pk>/allocations',
        CarryPlanAllocationsAPIView.as_view(),
        name="carry-plan-allocations"
    ),
    path(
        'carry-plan/<int:pk>/allocations/<str:allocation_id>',
        CarryPlanAllocationDetailAPIView.as_view(),
        name="carry-plan-single-allocation"
    ),
    path(
        'carry-plan/<int:pk>/company-users',
        CarryPlanCompanyUserWithNoAllocationAPIView.as_view(),
        name="carry-plan-company-users"
    ),
    path(
        'add',
        CarryPoolAddAPIView.as_view(),
        name="carry-pool-add"
    ),
    path(
        'allocations',
        PoolAllocationsAPIView.as_view(),
        name="carry-pool-allocations"
    ),
    path(
        'delete',
        CarryPoolDeleteAPIView.as_view(),
        name="carry-pool-delete"
    ),
    path(
        'allocation-actions',
        AllocationActionListCreateView.as_view(),
        name='allocation-action-list-create'
    ),
    path(
        'allocation-actions/<int:pk>/',
        AllocationActionDetailView.as_view(),
        name='allocation-action-detail'
    ),
    path(
        'participants/entity-types',
        CarryParticipantEntityTypes.as_view(),
        name=PARTICIPANT_ENTITY_TYPES_URL_NAME
    ),
    path(
        'participants',
        UserParticipantsAPIView.as_view(),
        name="participants"
    ),
    path(
        'participants/<user_id>',
        ParticipantAPIView.as_view(),
        name="participant"
    ),
    path(
        'participant-investments/<carry_participant_id>',
        ParticipantInvestmentsView.as_view(),
        name="participant-investments"
    ),
    path(
        'participants/<pk>/profile',
        UserParticipantProfileView.as_view({'get': 'retrieve', 'patch': "update"}),
        name="participant-profile"
    ),
    path(
        'participants/<pk>/employment_record',
        UserParticipantEmploymentRecordView.as_view(),
        name="participant-employment-update"
    ),
    path(
        'participants/<user_id>/compensation_history',
        ParticipantCompensationHistory.as_view(),
        name="participant-compensation-history"
    ),
    path(
        'user-carry-allocations/<int:user_id>',
        UserCarryAllocationAPIView.as_view(),
        name='user-carry-allocations'
    ),
    path(
        'forfeiture/<int:user_id>',
        ForfeitureAPIView.as_view(),
        name='forfeiture'
    ),
    path(
        'forfeitures/by-allocation/<str:allocation_id>/',
        ForfeitureRetrieveAPIView.as_view(),
        name='forfeiture-retrieve-by-allocation'
    ),

    path(
        'forfeitures/<int:pk>/',
        ForfeitureUpdateDeleteAPIView.as_view(),
        name='forfeiture-update-delete'
    ),
    path(
        'forfeitures/<str:allocation_id>/list/',
        ForfeitureListAPIView.as_view(),
        name='forfeiture-list'
    ),
    path(
        'forfeiture/<int:user_id>/calculate',
        ForfeiturePreviewAPIView.as_view(),
        name='forfeiture-preview'
    ),
    path('vesting-schedule/', VestingScheduleListCreateView.as_view(), name='vesting-schedule-list-create'),
    path('vesting-schedule/<int:pk>', VestingScheduleDetailView.as_view(), name='vesting-schedule-detail'),
    path('vesting-schedule/<int:pk>/display', VestingScheduleDisplayView.as_view(), name='vesting-schedule-display'),

    path(
        'vesting-schedule/<int:vesting_id>/time-based/',
        TimeBasedVestingScheduleListCreateView.as_view(),
        name='time-based-vesting-schedule-list-create'
    ),
    path(
        'vesting-schedule/<int:vesting_id>/time-based/<int:pk>/',
        TimeBasedVestingScheduleRetrieveDestroyAPIView.as_view(),
        name='time-based-vesting-schedule-detail'
    ),
    path(
        'vesting-schedule/<int:vesting_id>/milestone-based/',
        MilestoneBasedVestingScheduleListCreateView.as_view(),
        name='milestone-based-vesting-schedule-list-create'
    ),
    path(
        'vesting-schedule/<int:vesting_id>/milestone-based/<int:pk>/',
        MilestoneBasedVestingScheduleRetrieveDestroyAPIView.as_view(),
        name='milestone-based-vesting-schedule-detail'
    ),

    path(
        'vesting-schedule/<int:vesting_id>/milestone/',
        MilestoneListCreateView.as_view(),
        name='milestone-list-create'
    ),
    path(
        'vesting-schedule/<int:vesting_id>/milestone/<int:pk>/',
        MilestoneRetrieveUpdateDestroyAPIView.as_view(),
        name='milestone-detail'
    ),
    path(
        'calculate-vested-points',
        CalculateVestedPoints.as_view(),
        name="calculate-vested-points"
    ),
    path(
        'deals',
        DealsListCreateView.as_view(),
        name="carry-deals"
    ),
    path(
        'investment-tranches',
        InvestmentTrancheListCreateView.as_view(),
        name="carry-investment-tranches"
    ),
    path(
        'investment-tranches/<int:pk>',
        InvestmentTrancheRetrieveUpdateView.as_view(),
        name="investment-tranche-retrieve-update"
    ),
    path(
        'investment-tranches/<int:pk>/allocations',
        InvestmentTrancheAllocationsView.as_view(),
        name="investment-tranche-allocations"
    ),
    path(
        'carry-funds/<int:pk>',
        CarryFundsView.as_view({'patch': 'update'}),
        name="update-carry-funds"
    ),
    path(
        'carry-funds',
        CarryFundsView.as_view({'get': 'list', 'post': "create"}),
        name="carry-funds"
    ),
    path(
        'carry-funds/<int:pk>/allocations',
        CarryFundParticipantsView.as_view(),
        name="carry-fund-participants"
    ),
    path(
        'funds/<int:pk>/deals',
        FundWithDealsListView.as_view(),
        name="funds-deals"
    ),
    path(
        'deals/<int:pk>/investment-tranches',
        DealTranchesListView.as_view(),
        name="funds-deals"
    ),
    path(
        'deal/<int:pk>',
        DealRetrieveUpdateView.as_view(),
        name="deal-retrieve-update"
    ),
    path(
        'deal/<int:pk>/allocations',
        DealAllocationsView.as_view(),
        name="deal-allocations"
    ),
    path(
        'carry-documents',
        CarryDocumentsListCreateAPIView.as_view(),
        name="carry-documents"
    ),
    path(
        'carry-document/<int:pk>',
        CarryDocumentUpdateAPIView.as_view(),
        name="carry-document-get-update"
    ),
    path(
        'carry-document-participants',
        CarryDocumentParticipantsListAPIView.as_view(),
        name="carry-document-participants"
    ),
    path(
        'carry-document-participant/<int:pk>',
        CarryDocumentParticipantsUpdateAPIView.as_view(),
        name="carry-document-participants-retrieve-update"
    ),
    re_path(
        r'^signing_url/(?P<envelope_id>.+)$',
        GetCarryDocumentAdminSigningURLAPIView.as_view(),
        name="carry-get-admin-signing-url-api-view"
    ),
    re_path(
        r'^store_response/(?P<envelope_id>.+)$',
        StoreCarryDocumentAdminSignedResponse.as_view(),
        name="carry-store-response-url-api-view"
    ),
    path(
        'carry-plans/firm-level-overview',
        CarryPlanFirmLevelView.as_view(),
        name="carry-plans-firm-level-api-view"
    ),
    path(
        'carry-plan/<int:pk>/vesting-schedules',
        CarryPlanVestingSchedulesView.as_view(),
        name="carry-plans-vesting-schedules"
    ),
    path(
        'carry-plan-milestone',
        CarryPlanMilestoneView.as_view(),
        name="carry-plan-milestone"
    ),
    path(
        'user-carry-documents/<int:user_id>',
        UserCarryDocumentsView.as_view(),
        name="user-carry-documents"
    ),
    path(
        'carry-participant',
        CarryParticipantCreateAPIView.as_view(),
        name="carry-participant-create"
    ),
    path(
        'distribution/<int:pk>',
        DistributionView.as_view(),
        name='carry-distribution-retrieve-update'
    ),
    path(
        'distributions',
        CarryFundDistributionView.as_view({'get': 'list', 'post': "create"}),
        name='admin-carry-distributions'),
    path(
        'carry-vehicles',
        CarryVehicleCreateAPIView.as_view(),
        name="carry-vehicle-create"
    ),
    path(
        'carry-vehicles/<int:pk>',
        CarryVehicleRetrieveUpdateAPIView.as_view(),
        name="carry-vehicle-update"
    ),
    path(
        'carry-share-class',
        CarryShareClassCreateAPIView.as_view(),
        name="carry-share-class-create"
    ),
    path(
        'carry-share-class/<int:pk>',
        CarryShareClassRetrieveUpdateAPIView.as_view(),
        name="carry-share-class-update"
    ),
    path(
        'carry-plan/<int:pk>/dilute',
        CarryPlanDiluteView.as_view(),
        name="carry-plan-dilute"
    ),
    path(
        'carry-plan/<int:pk>/dilute/calculate',
        CarryPlanPreviewDiluteView.as_view(),
        name="carry-plan-dilute-preview"
    ),
    path(
        'distributions/carry-plan',
        DistributionCarryPlanDetailView.as_view(),
        name='distribution-carry-plan-details'
    ),
    path(
        'carry-plan/<int:pk>/carry-sub-pools',
        CarrySubPoolAPIView.as_view(),
        name='carry-plan-sub-pools'
    ),
    path(
        'carry-plan/carry-sub-pools',
        SubPoolCreateAPIView.as_view(),
        name='carry-plan-sub-pools-create'
    ),
    path(
        'carry-plan/carry-sub-pools/<int:pk>',
        SubPoolUpdateDeleteAPIView.as_view(),
        name='carry-plan-sub-pools-update'
    ),
    path(
        'carry-plan/carry-sub-pools/move-unallocated',
        SubPoolPointsMigrationsAPIView.as_view(),
        name='carry-plan-sub-pools-migration'
    ),
    path(
        'carry-plan/<int:pk>/publish',
        CarryPlanPublishView.as_view(),
        name='carry-plan-publish-view'
    ),
    path(
        'all-users',
        CarryListAllUsersView.as_view(),
        name='carry-list-all-users'
    ),
    path(
        'carry-plan/<int:pk>/submit-for-approval',
        CarryPlanSubmitForApprovalView.as_view(),
        name='carry-plan-submit-for-approval'
    ),
    path(
        'carry-document-participants/release',
        CarryDocumentParticipantsReleaseAPIView.as_view(),
        name="carry-document-participants-release"
    ),
    path(
        'reporting/manager/firm',
        MangerReportingFirmLevelView.as_view(),
        name="manager-firm-level-api-view"
    ),
    path(
        'reporting/manager/<int:carry_participant_id>',
        MangerReportingDetailView.as_view(),
        name="manager-detail-level-api-view"
    ),
    path(
        'carry-gp-commits',
        CarryGpCommitmentListCreateUpdateAPIView.as_view(),
        name="carry-gp-commit-create-update-list"
    ),
    path(
        'carry-gp-commits/detail/<str:source_external_id>/<int:source_type>',
        CarryGpCommitmentDetailAPIView.as_view(),
        name="carry-gp-commit-detail"
    ),
    path(
        'carry-gp-commits/<int:user_id>',
        CarryGpCommitmentParticipantListAPIView.as_view(),
        name="carry-gp-commit-create-list"
    ),
    path(
        'carry-plan/<int:pk>/transfer',
        CarryCreateTransferAPIView.as_view(),
        name="carry-transfer-allocation"
    ),
    path(
        'carry-plan/<int:pk>/hurdle',
        CarryHurdleListCreateAPIView.as_view(),
        name="carry-hurdle-create"
    ),
    path(
        'hurdles/<int:pk>',
        CarryHurdleDetailAPIView.as_view(),
        name="carry-hurdle-detail-delete-edit"
    ),
    path(
        'adjustments/<int:pk>',
        AllocationValueAdjustmentDetailAPIView.as_view(),
        name="adjustment-detail-delete-edit"
    ),
    path(
        'carry-plan/<int:pk>/adjustment',
        AllocationValueAdjustmentListCreateAPIView.as_view(),
        name="carry-value-adjustment-list-create"
    ),
    path(
        'carry-plan/<int:pk>/adjustment-allocations',
        CarryPlanAdjustmentAllocationsAPIView.as_view(),
        name="carry-value-adjustment-allocations-list"
    ),
]
