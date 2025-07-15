import csv
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import Count, Subquery, Sum, Prefetch
from django_pglocks import advisory_lock
from django_q.tasks import async_task
from rest_framework import status, mixins
from rest_framework.generics import (CreateAPIView, ListAPIView,
                                     ListCreateAPIView, RetrieveDestroyAPIView,
                                     RetrieveUpdateDestroyAPIView,
                                     get_object_or_404, RetrieveAPIView, RetrieveUpdateAPIView, UpdateAPIView)

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from api.agreements.constants.gp_signers import GP_SIGNER_CLIENT_ID
from api.agreements.serializers import SigningUrlSerializer
from api.carry_pools.models import (AllocationAction, CarryPlan, CarryPool, CarryDocument,
                                    Deal, Milestone, MilestoneBasedVestingSchedule,
                                    TimeBasedVestingSchedule, VestingSchedule,
                                    ParticipantCarryDocument, CarryPlanMilestone, CarryParticipantUser,
                                    CarryParticipant, CarrySubPool, InvestmentTranche, CarryGpCommitment, CarryHurdle,
                                    AllocationValueAdjustment,
                                    )
from api.carry_pools.services.calculate_estimated_values import EstimatedValuesService
from api.carry_pools.services.company_carry_plans_report import async_company_carry_plan_export_task, \
    async_company_allocations_export_task, CreateAllocationsReport
from api.carry_pools.services.constants import ALLOCATIONS_EXPORT_COLUMN_ORDER, ALLOCATIONS_EXPORT_COLUMN_MAPPING
from api.carry_pools.services.dilution import DilutionService
from api.carry_pools.services.gp_commit_service import GpCommitService
from api.carry_pools.services.investor_carry_documents import InvestorCarryDocumentService
from api.carry_pools.services.points_transfer import CarryPlanPointTransferService
from api.companies.models import CompanyUser
from api.carry_pools.serializers import (
    VestingScheduleDisplaySerializer,
    AddAllocationsSerializer, AddPoolSerializer, AllocationActionSerializer, CarryPlanListSerializer,
    CarryPlanSerializer,
    DeletePoolSerializer, CarryFundsSerializer,
    MilestoneBasedVestingScheduleSerializer, MilestoneSerializer,
    ParticipantSerializer, TimeBasedVestingScheduleSerializer,
    VestingScheduleSerializer, CreateUpdateFundSerializer, DealSerializer,
    CarryDocumentSerializer, CarryDocumentParticipantSerializer, ParticipantDetailSerializer,
    SingleCarryPlanListSerializer, UserCarryParticipantSerializer, CarryPlanDiluteSerializer, CarrySubPoolSerializer,
    CarryParticipantSerializer, ProfileSerializer, UpdateProfileSerializer, CarryListAllUsersSerializer,
    UpdateEmploymentSerializer, SubPoolPointsMovingSerializer, CarrySubPoolCreateSerializer,
    AllocationValueAdjustmentSerializer,
    CarryTransferPointsSerializer, InvestmentTrancheSerializer, DealReadSerializer, CarryGpCommitmentSerializer,
    CarryHurdleSerializer, CarryHurdleListSerializer)


from api.carry_pools.services.add_allocations import AddPoolAllocationsService
from api.carry_pools.services.calculate_vested_points import \
    CalculateVestedPointsService
from api.carry_pools.services.carry_plan_vesting_schedule_service import CarryPlanVestingScheduleService
from api.carry_pools.services.delete_pool import DeletePool
from api.carry_pools.services.firm_level_overview import FirmLevelOverviewService, ManagerReportService
from api.carry_pools.services.user_carry_allocation_service import UserCarryAllocationService
from api.carry_pools.services.prepare_allocation_format import \
    PrepareAllocationFormatService
from api.carry_pools.services.process_allocation_action import \
    ProcessAllocationAction
from api.carry_pools.utils import get_carry_pool_of_carry_plan, carry_fund_qs, \
    calculate_allocations_by_date, add_user_info_in_allocations, sum_allocations_by_participant, \
    prepare_estimated_carry_value_for_users, annotate_deal_qs, get_forfeit_dilute_transferred_adjusted_allocations, \
    name_custom_sort_key, custom_sort_list_of_dicts
from api.compensation_records.models import CompensationRecord
from api.compensation_records.serializers import CompensationRecordDetailSerializer
from api.investors.services.calculate_invested_funds import InvestedFundsService
from api.libs.docusign.services import DocumentSigningService
from api.mixins.admin_view_mixin import AdminViewMixin
from api.mixins.serializer_mixin import GetSerializerClassMixin
from api.mixins.vesting_date_mixin import VestingDateViewMixin
from api.page_configs.models import PageConfig
from api.page_configs.services.company_page_config import CompanyPageConfigRetrieval
from api.permissions.is_compensation_admin import IsCompensationAccessAdmin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.carry_pools.services.carry_signed_response import CarrySignedResponseService
from api.carry_pools.services.forfeited_service import ForfeitedService
from api.users.constants import CARRY_MANAGER
from api.users.models import RetailUser
from api.users.selectors.users_in_company_selector import get_users_in_company


class CarryPlanListCreateAPIView(AdminViewMixin, VestingDateViewMixin, ListCreateAPIView):

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CarryPlanSerializer
        return CarryPlanListSerializer

    def get_queryset(self):
        last_carry_pool = CarryPool.objects.last_carry_pool_qs()
        qs = CarryPlan.objects.filter(company=self.company) \
            .select_related(
            'default_vesting_schedule',
        ).annotate(
            last_carry_pool_bps=Subquery(last_carry_pool.values('bps')),
            last_carry_pool_allocations=Subquery(last_carry_pool.values('allocations')),
        )
        if self.request.method == 'GET':
            return sorted(qs, key=name_custom_sort_key)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['calculation_date'] = self.calculation_date
        if self.request.method == 'POST':
            return context
        else:
            context['allocation_actions_summary'] = {}
            allocation_actions_for_subtraction = list(
                AllocationAction.objects.filter(
                    company=self.company,
                    type__in=[
                        AllocationAction.Type.FORFEIT.value,
                        AllocationAction.Type.DILUTE.value,
                        AllocationAction.Type.TRANSFER_FROM.value
                    ],
                    grant_date__date__lte=self.calculation_date
                ).values('allocation_id').annotate(subtracted_bps=Sum('bps')))

            context['allocation_actions_summary']['subtraction'] = {
                result['allocation_id']: result['subtracted_bps'] for result in allocation_actions_for_subtraction
            }

            allocation_actions_for_addition = list(
                AllocationAction.objects.filter(
                    company=self.company,
                    type=AllocationAction.Type.TRANSFER_TO.value,
                    grant_date__date__lte=self.calculation_date
                ).values('allocation_id').annotate(added_bps=Sum('bps')))

            context['allocation_actions_summary']['addition'] = {
                result['allocation_id']: result['added_bps'] for result in allocation_actions_for_addition
            }
            return context


class CarryPlanExportAPIView(AdminViewMixin, APIView):
    def post(self, request):
        date = request.data.get('date')
        async_task(
            async_company_carry_plan_export_task,
            date,
            self.company.id,
            request.user.email
        )
        return Response({}, status=status.HTTP_200_OK)


class AllocationsExportAPIView(AdminViewMixin, APIView):
    def post(self, request):
        date = request.data.get('date')
        async_task(
            async_company_allocations_export_task,
            date,
            self.company.id,
            request.user.email
        )
        return Response({}, status=status.HTTP_200_OK)


class UserAllocationsExportAPIView(AdminViewMixin, APIView):
    def post(self, request, user_id):
        # Create the response object
        response = Response(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="allocations.csv"'
        service = CreateAllocationsReport(calculation_date=request.data.get('date'), company=self.company,
                                          email=request.user.email)
        user = get_object_or_404(RetailUser, id=user_id)
        user_carry_participants = user.user_carry_participants.all()
        carry_participant_ids = [user_carry_participant.carry_participant_id for user_carry_participant in
                                 user_carry_participants]
        allocs = service.process_allocations(carry_participant_ids)
        writer = csv.writer(response)
        writer.writerow(ALLOCATIONS_EXPORT_COLUMN_ORDER)
        for row in allocs:
            writer.writerow([row.get(key, '') for key in ALLOCATIONS_EXPORT_COLUMN_MAPPING.keys()])

        return response


class CarryPlanRetrieveUpdateDestroyAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView, VestingDateViewMixin):
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SingleCarryPlanListSerializer
        return CarryPlanSerializer

    def get_object(self):
        carry_plan = get_object_or_404(CarryPlan, id=self.kwargs['pk'])
        return carry_plan

    def destroy(self, request, *args, **kwargs):
        carry_plan = get_object_or_404(CarryPlan, id=self.kwargs['pk'])
        carry_plan.deleted = True
        carry_plan.save()

        CarryPool.objects.filter(carry_plan=carry_plan, company=self.company).update(deleted=True)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['calculation_date'] = self.calculation_date
        return context


class CarryPlanAllocationsAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, pk):
        result = PrepareAllocationFormatService(
            carry_plan_id=pk
        ).get_formatted_data_for_allocations(self.calculation_date)

        return Response(result, status=status.HTTP_200_OK)

    def post(self, request, pk):
        carry_plan = get_object_or_404(CarryPlan, id=pk)
        carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, company_id=carry_plan.company_id)
        allocation_mode = request.data.get('mode')

        serializer = AddAllocationsSerializer(
            data={
                'base_pool_id': carry_pool.external_id,
                'parent_pool_id': carry_pool.external_id,
                'allocations': request.data.get('allocations')
            },
            context={'company': self.company}
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        AddPoolAllocationsService(
            admin_user=self.admin_user,
            base_pool_id=validated_data['base_pool_id'],
            parent_pool_id=validated_data['parent_pool_id'],
            allocations_data=validated_data['allocations']
        ).process(carry_plan, allocation_mode)
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)


class CarryPlanAllocationDetailAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, pk, allocation_id):
        service = UserCarryAllocationService(
            carry_participant_ids=[],
            company_id=self.company.id,
            calculation_date=self.calculation_date
        )
        result = service.get_user_single_allocation_data(
            carry_plan_id=pk,
            allocation_id=allocation_id
        )
        return Response(result, status=status.HTTP_200_OK)


class CarryPlanCompanyUserWithNoAllocationAPIView(AdminViewMixin, APIView):
    def get(self, request, pk):
        result = PrepareAllocationFormatService(
            carry_plan_id=pk
        ).get_company_users_data_with_no_allocations()

        return Response(result, status=status.HTTP_200_OK)


class CarryPoolAddAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = AddPoolSerializer


class CarryPoolDeleteAPIView(AdminViewMixin, APIView):
    def post(self, request):
        data = request.data
        context = {'admin_user': self.admin_user, 'company': self.company}
        serializer = DeletePoolSerializer(data=data, context=context)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        DeletePool(
            admin_user=self.admin_user,
            base_pool_id=validated_data['base_pool_id'],
            pool_id=validated_data['pool_id']
        ).process()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PoolAllocationsAPIView(AdminViewMixin, APIView):
    def post(self, request):
        data = request.data
        context = {'admin_user': self.admin_user, 'company': self.company}
        serializer = AddAllocationsSerializer(data=data, context=context)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        AddPoolAllocationsService(
            admin_user=self.admin_user,
            base_pool_id=validated_data['base_pool_id'],
            parent_pool_id=validated_data['parent_pool_id'],
            allocations_data=validated_data['allocations']
        ).process()
        return Response({'status': 'success'})


class AllocationActionListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = AllocationActionSerializer

    def get_queryset(self):
        return AllocationAction.objects.filter(company=self.company)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # TODO: Only added currently for testing the dilution calculation. Will be removed later on.
        instance = serializer.instance
        ProcessAllocationAction(instance.id, admin_user=self.admin_user).process()

        return Response({'status': 'success'}, status=201)


class AllocationActionDetailView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = AllocationActionSerializer

    def get_queryset(self):
        return AllocationAction.objects.filter(company=self.company)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Check if status is being updated and set to 3 (APPROVED)
        if 'status' in request.data and int(request.data['status']) == AllocationAction.Status.APPROVED:
            ProcessAllocationAction(instance.id, admin_user=None).process()

        self.perform_update(serializer)
        return Response(serializer.data)


class VestingScheduleListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = VestingScheduleSerializer

    def get_queryset(self):
        return VestingSchedule.objects.filter(company=self.company).prefetch_related(
            'time_vesting_schedules',
            'milestone_vesting_schedules'
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['company'] = self.company
        return context


class VestingScheduleDetailView(AdminViewMixin, RetrieveDestroyAPIView):
    serializer_class = VestingScheduleSerializer

    def get_queryset(self):
        return VestingSchedule.objects.filter(company=self.company)


class VestingScheduleDisplayView(AdminViewMixin, RetrieveAPIView):
    serializer_class = VestingScheduleDisplaySerializer

    def get_queryset(self):
        return VestingSchedule.objects.filter(company=self.company) \
            .prefetch_related('time_vesting_schedules') \
            .prefetch_related('milestone_vesting_schedules')

    def retrieve(self, request, *args, **kwargs):
        instance: VestingSchedule = self.get_object()
        if instance.custom_display:
            return Response(instance.custom_display)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class MilestoneBasedVestingScheduleListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = MilestoneBasedVestingScheduleSerializer

    def get_queryset(self):
        return MilestoneBasedVestingSchedule.objects.filter(
            vesting_schedule__id=self.kwargs['vesting_id'],
            vesting_schedule__company=self.company
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['vesting_schedule'] = get_object_or_404(VestingSchedule, id=self.kwargs['vesting_id'])
        return context


class MilestoneBasedVestingScheduleRetrieveDestroyAPIView(AdminViewMixin, RetrieveDestroyAPIView):
    serializer_class = MilestoneBasedVestingScheduleSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return MilestoneBasedVestingSchedule.objects.filter(
            vesting_schedule__id=self.kwargs['vesting_id'],
            vesting_schedule__company=self.company
        )


class TimeBasedVestingScheduleListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = TimeBasedVestingScheduleSerializer

    def get_queryset(self):
        return TimeBasedVestingSchedule.objects.filter(
            vesting_schedule__id=self.kwargs['vesting_id'],
            vesting_schedule__company=self.company
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['vesting_schedule'] = get_object_or_404(VestingSchedule, id=self.kwargs['vesting_id'])
        return context


class TimeBasedVestingScheduleRetrieveDestroyAPIView(AdminViewMixin, RetrieveDestroyAPIView):
    serializer_class = TimeBasedVestingScheduleSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return TimeBasedVestingSchedule.objects.filter(
            vesting_schedule__id=self.kwargs['vesting_id'],
            vesting_schedule__company=self.company
        )


class MilestoneListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = MilestoneSerializer

    def get_queryset(self):
        return Milestone.objects.filter(
            milestone_schedules__vesting_schedule__id=self.kwargs['vesting_id'],
            milestone_schedules__vesting_schedule__company=self.company
        )


class MilestoneRetrieveUpdateDestroyAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = MilestoneSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return Milestone.objects.filter(
            milestone_schedules__vesting_schedule__id=self.kwargs['vesting_id'],
            milestone_schedules__vesting_schedule__company=self.company
        )


class CalculateVestedPoints(AdminViewMixin, APIView):

    def post(self, request):
        data = request.data
        data['company_id'] = self.company.id
        result = CalculateVestedPointsService(data).calculate_vested_points()

        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)


class UserCarryAllocationAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, user_id):
        user = get_object_or_404(RetailUser, id=user_id)
        user_carry_participants = user.user_carry_participants.all()
        carry_participant_ids = [user_carry_participant.carry_participant_id for user_carry_participant in
                                 user_carry_participants]
        service = UserCarryAllocationService(
            carry_participant_ids=carry_participant_ids,
            company_id=self.company.id,
            calculation_date=self.calculation_date
        )
        allocations_response = service.get_user_data()
        sorted_data = custom_sort_list_of_dicts(list(allocations_response), key='carry_plan_name')
        return Response(sorted_data, status=status.HTTP_200_OK)


class ForfeitureAPIView(AdminViewMixin, APIView, VestingDateViewMixin):

    def post(self, request, user_id):
        forfeiture_data = request.data
        user = get_object_or_404(RetailUser, id=user_id)
        user_carry_participants = user.user_carry_participants.all()
        carry_participant_ids = [
            user_carry_participant.carry_participant_id for user_carry_participant in
            user_carry_participants
        ]
        service = UserCarryAllocationService(
            carry_participant_ids=carry_participant_ids,
            company_id=self.company.id,
            calculation_date=self.calculation_date
        )
        allocations_response = service.get_user_data()
        allocations = service.forfeit_allocations(forfeiture_data, allocations_response)
        allocations_response = service.get_user_data(allocations)
        return Response(allocations_response, status=status.HTTP_201_CREATED)


class ForfeitureRetrieveAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    """Retrieve the latest forfeiture action for a given allocation_id."""

    def get(self, request, allocation_id):
        forfeiture_action = AllocationAction.objects.filter(
            company=self.company,
            allocation_id=allocation_id,
            type=AllocationAction.Type.FORFEIT.value,
        ).order_by('-created_at').first()

        if not forfeiture_action:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AllocationActionSerializer(forfeiture_action)
        return Response(serializer.data)


class ForfeitureUpdateDeleteAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    """Update or delete a specific forfeiture action by primary key."""

    def get_forfeiture_action(self, pk):
        return AllocationAction.objects.get(id=pk, company=self.company)

    def patch(self, request, carry_plan_id, pk):
        try:
            forfeiture_action = self.get_forfeiture_action(pk)
            if not forfeiture_action:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = AllocationActionSerializer(forfeiture_action, data=request.data, partial=True)
            if serializer.is_valid():
                bps = serializer.validated_data["bps"]
                forfeited_service = ForfeitedService()
                if forfeited_service.update_forfeiture_action(forfeiture_action, bps, carry_plan_id, self.calculation_date):
                    serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except AllocationAction.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, carry_plan_id, pk):
        try:
            forfeiture_action = self.get_forfeiture_action(pk)
            if not forfeiture_action:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
            forfeited_service = ForfeitedService()
            if forfeited_service.delete_forfeiture_action(forfeiture_action, carry_plan_id, self.calculation_date):
                return Response(status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except AllocationAction.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class ForfeitureListAPIView(AdminViewMixin, APIView):
    """List all forfeiture actions for a given allocation_id."""

    def get(self, request, allocation_id):
        forfeitures = AllocationAction.objects.filter(
            company=self.company,
            allocation_id=allocation_id,
            type=AllocationAction.Type.FORFEIT.value,
        ).order_by('-created_at')

        serializer = AllocationActionSerializer(forfeitures, many=True)
        return Response(serializer.data)


class ForfeiturePreviewAPIView(AdminViewMixin, APIView, VestingDateViewMixin):

    def post(self, request, user_id):
        forfeiture_data = request.data
        user = get_object_or_404(RetailUser, id=user_id)
        user_carry_participants = user.user_carry_participants.all()
        carry_participant_ids = [
            user_carry_participant.carry_participant_id for user_carry_participant in
            user_carry_participants
        ]
        service = UserCarryAllocationService(
            carry_participant_ids=carry_participant_ids,
            company_id=self.company.id,
            calculation_date=self.calculation_date
        )
        allocations_response = service.get_user_data()
        service.calculate_forfeit_allocations_by_dates(forfeiture_data, allocations_response)
        return Response(allocations_response, status=status.HTTP_200_OK)


class ParticipantsAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request):
        carry_participants = CarryParticipant.objects.filter(
            company=self.company
        )
        serializer_context = {
            'calculation_date': self.calculation_date,
            'company': self.company
        }
        result = ParticipantSerializer(carry_participants, context=serializer_context, many=True).data
        return Response(result, status=status.HTTP_200_OK)


class UserParticipantsAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, **kwargs):
        user_carry_participants_prefetch = Prefetch("user_carry_participants",
                                                    CarryParticipantUser.objects.select_related("carry_participant"))
        company_user_prefetch = Prefetch("associated_company_users", CompanyUser.objects.all())
        users = get_users_in_company(company=self.company).filter(
            user_carry_participants__isnull=False
        ).select_related('user_participant_profile').prefetch_related(company_user_prefetch,
                                                                      user_carry_participants_prefetch).distinct('id')

        estimated_value_dict = prepare_estimated_carry_value_for_users(
            users,
            self.company,
            self.calculation_date
        )
        serializer_context = {
            'estimated_value_dict': estimated_value_dict
        }
        result = UserCarryParticipantSerializer(users, many=True, context=serializer_context).data
        return Response(result, status=status.HTTP_200_OK)


class ParticipantAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get_latest_compensation_data(self, user):
        latest_compensation = CompensationRecord.objects.filter(
            user=user,
            company=self.company
        ).order_by('-year').first()
        if not latest_compensation:
            return None

        page_config = CompanyPageConfigRetrieval(
            company=self.company,
            page_type=PageConfig.PageTypes.COMPENSATION_VIEW.value
        ).get_config()
        benefits_breakdown = None
        if page_config:
            benefits_breakdown = page_config.get('benefits_breakdown', [])

        compensation_data = CompensationRecordDetailSerializer(
            latest_compensation,
            context={'benefits_breakdown': benefits_breakdown}
        ).data

        return compensation_data

    def get(self, request, user_id):
        user = get_object_or_404(RetailUser, id=user_id)

        serializer_context = {
            'company': self.company,
            'latest_compensation': self.get_latest_compensation_data(user=user)
        }
        result = ParticipantDetailSerializer(user, context=serializer_context).data
        return Response(result, status=status.HTTP_200_OK)


class ProfileAPIView(AdminViewMixin, RetrieveUpdateAPIView, VestingDateViewMixin):
    pass


class DealsListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = DealSerializer

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DealReadSerializer
        return DealSerializer

    def get_queryset(self):
        qs = Deal.objects.filter(
            company=self.company
        ).select_related('fund').prefetch_related('deal_carry_plan')
        deals = annotate_deal_qs(qs)
        if self.request.method == 'GET':
            return sorted(deals, key=name_custom_sort_key)
        return deals


class InvestmentTrancheListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = InvestmentTrancheSerializer

    def get_queryset(self):
        qs = InvestmentTranche.objects.filter(
            company=self.company
        ).select_related('deal').prefetch_related('investment_tranche_carry_plan')
        if self.request.method == 'GET':
            return sorted(qs, key=name_custom_sort_key)
        return qs


class ParticipantInvestmentsView(AdminViewMixin, APIView):
    def get(self, request, carry_participant_id):
        user = get_object_or_404(RetailUser, id=carry_participant_id)
        company_users = user.associated_company_users.filter(company=self.company).all()
        company_user_ids = [cu.id for cu in company_users]
        response_data = {
            **InvestedFundsService(
                company_user_ids=company_user_ids,
            ).compile()
        }
        return Response(response_data)


class CarryFundsView(GetSerializerClassMixin, AdminViewMixin, mixins.CreateModelMixin, mixins.ListModelMixin,
                     mixins.UpdateModelMixin, VestingDateViewMixin,
                     GenericViewSet):
    serializer_action_classes = {
        'create': CreateUpdateFundSerializer,
        'update': CreateUpdateFundSerializer,
        'list': CarryFundsSerializer
    }

    def get_queryset(self):
        qs = carry_fund_qs(self.company).annotate(
            carry_plan_count=Count('fund_carry_plans')
        )
        # TODO: this is hacky, return type should be polymorphic with Queryset instead of list, find a better solution
        if self.action == 'list':
            return sorted(qs, key=name_custom_sort_key)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['calculation_date'] = self.calculation_date
        return context


class CarryFundParticipantsView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, pk):
        result = []
        fund = get_object_or_404(carry_fund_qs(self.company), id=pk)
        fund_carry_plan_qs = fund.fund_carry_plans
        if fund_carry_plan_qs.exists():
            fund_carry_plan = fund_carry_plan_qs.first()
            allocations = fund_carry_plan.carry_plan.last_carry_pool_allocations
            calculate_allocations_by_date(allocations, self.calculation_date)
            carry_plan = fund_carry_plan.carry_plan
            carry_pool = get_carry_pool_of_carry_plan(carry_plan.id, carry_plan.company_id)
            value_adjustments = carry_plan.get_adjustments_by_allocations(
                calculation_date=self.calculation_date
            )
            for allocation in allocations:
                estimated_values = EstimatedValuesService(
                    {
                        'allocation': allocation,
                        'carry_plan': carry_plan,
                        'carry_pool': carry_pool,
                        'carry_plan_estimated_value': fund.carry_estimated_value,
                        'carry_plan_fair_market_value': fund.carry_fair_market_value,
                        'calculation_date': self.calculation_date,
                        'entity_calculation': True,
                        'value_adjustments': value_adjustments,
                    }
                ).calculate()
                allocation['estimated_value'] = estimated_values['carry_estimated_value']
                allocation['fair_market_value'] = estimated_values['fair_market_value']

            add_user_info_in_allocations(allocations, self.company)
            result = sum_allocations_by_participant(
                allocations=allocations,
                fund_carry_plan=fund_carry_plan,
                pool_bps=fund_carry_plan.carry_plan.last_carry_pool_bps
            )
        return Response(result, status=status.HTTP_200_OK)


class FundWithDealsListView(AdminViewMixin, ListAPIView):
    serializer_class = DealSerializer

    def get_queryset(self):
        qs = Deal.objects.filter(
            company=self.company,
            fund_id=self.kwargs['pk']
        ).select_related('fund')
        return qs


class DealTranchesListView(AdminViewMixin, ListAPIView):
    serializer_class = InvestmentTrancheSerializer

    def get_queryset(self):
        return InvestmentTranche.objects.filter(
            company=self.company,
            deal_id=self.kwargs['pk']
        ).select_related('deal').prefetch_related('investment_tranche_carry_plan')


class DealRetrieveUpdateView(AdminViewMixin, RetrieveUpdateAPIView):
    serializer_class = DealSerializer

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DealReadSerializer
        return DealSerializer

    def get_queryset(self):
        qs = Deal.objects.filter(
            company=self.company
        )
        return annotate_deal_qs(qs)


class DealAllocationsView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, pk):
        deal_qs = Deal.objects.filter(
            company=self.company
        )
        deal_qs = annotate_deal_qs(deal_qs)
        deal = get_object_or_404(deal_qs, id=pk)
        result = PrepareAllocationFormatService(
            deal=deal
        ).get_formatted_data_for_deal_allocations(self.calculation_date)
        return Response(result, status=status.HTTP_200_OK)


class InvestmentTrancheRetrieveUpdateView(AdminViewMixin, RetrieveUpdateAPIView):
    serializer_class = InvestmentTrancheSerializer

    def get_queryset(self):
        return InvestmentTranche.objects.filter(
            company=self.company
        )


class InvestmentTrancheAllocationsView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, pk):
        investment_tranche = get_object_or_404(InvestmentTranche, id=pk)
        result = PrepareAllocationFormatService(
            investment_tranche=investment_tranche
        ).get_formatted_data_for_investment_tranche_allocations(self.calculation_date)
        return Response(result, status=status.HTTP_200_OK)


class CarryDocumentsListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = CarryDocumentSerializer

    def get_queryset(self):
        return CarryDocument.objects.filter(company=self.company, deleted=False) \
            .select_related('document') \
            .prefetch_related('carry_plans')


class CarryDocumentUpdateAPIView(AdminViewMixin, RetrieveUpdateAPIView):
    serializer_class = CarryDocumentSerializer

    def get_queryset(self):
        return CarryDocument.objects.filter(company=self.company, deleted=False)


class CarryDocumentParticipantsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = CarryDocumentParticipantSerializer

    def get_queryset(self):
        return ParticipantCarryDocument.objects.filter(
            company=self.company
        ).select_related(
            'carry_document__document',
            'user',
            'signed_document'
        )


class GetCarryDocumentAdminSigningURLAPIView(AdminViewMixin, RetrieveAPIView):
    serializer_class = SigningUrlSerializer

    def get_gp_signer_details(self, envelop_id, generic_email):
        docusign_service = DocumentSigningService()
        envelop_recipients = docusign_service.get_envelop_recipients_list(envelop_id)
        gp_signer = next(item for item in envelop_recipients["signers"] if item["role_name"] == "gp_signer")

        if gp_signer["email"] == generic_email:
            return generic_email, gp_signer['name'], GP_SIGNER_CLIENT_ID
        else:
            return gp_signer['email'], gp_signer['name'], gp_signer['client_user_id']

    def get_object(self):
        envelope_id = self.kwargs.get('envelope_id')
        participant_carry_document = get_object_or_404(
            ParticipantCarryDocument,
            envelope_id=envelope_id
        )
        participant_carry_document_id = participant_carry_document.id
        signer_email, signer_name, client_id = (
            self.get_gp_signer_details(envelope_id, f'gp-signers+{participant_carry_document_id}@navable.com'))
        envelope_payload = {
            "signer_email": signer_email,
            "signer_name": signer_name,
            "signer_client_id": client_id,
            "envelope_id": envelope_id,
            "ds_return_url": self.request.query_params['return_url'],
        }

        docusign_service = DocumentSigningService()
        results = docusign_service.send_embedded(envelope_payload)
        return {'signing_url': results['redirect_url']}


class StoreCarryDocumentAdminSignedResponse(AdminViewMixin, APIView):

    def get(self, request, *args, **kwargs):
        envelope_id = self.kwargs.get('envelope_id')
        participant_carry_document = get_object_or_404(
            ParticipantCarryDocument,
            envelope_id=envelope_id
        )
        if participant_carry_document.completed and participant_carry_document.gp_signing_complete:
            return Response({'status': 'success'})

        company = participant_carry_document.company
        with advisory_lock(envelope_id, wait=False) as acquired:
            if acquired:
                signed_response_service = CarrySignedResponseService(
                    envelope_id=envelope_id,
                    instance=participant_carry_document,
                    document_title=participant_carry_document.carry_document.document.title,
                    company=company
                )
                signed_response_service.process()
            else:
                return Response({'status': 'Another request in process'})

        participant_carry_document.gp_signing_complete = True
        participant_carry_document.save()

        return Response({'status': 'success'})


class ParticipantCompensationHistory(AdminViewMixin, ListAPIView):
    serializer_class = CompensationRecordDetailSerializer
    permission_classes = (IsSidecarAdminUser, IsCompensationAccessAdmin)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        page_config = CompanyPageConfigRetrieval(
            company=self.company,
            page_type=PageConfig.PageTypes.COMPENSATION_VIEW.value
        ).get_config()
        if not page_config:
            return context

        context['benefits_breakdown'] = page_config.get('benefits_breakdown', [])
        return context

    def get_queryset(self):
        carry_users = CarryParticipantUser.objects.filter(user_id=self.kwargs['user_id'])
        # assuming 1:1 mapping for now
        user_id = carry_users.first().user.id
        return CompensationRecord.objects.filter(
            user_id=user_id,
            company=self.company
        ).select_related('cash', 'insurance_benefits', 'misc_benefits', 'taxes', 'currency').order_by('-year')


class CarryPlanFirmLevelView(AdminViewMixin, APIView):
    def get(self, request):
        result = FirmLevelOverviewService(
            company=self.company
        ).get_overview_data()
        return Response(result, status=status.HTTP_200_OK)


class CarryPlanVestingSchedulesView(AdminViewMixin, APIView):
    def get(self, request, pk):
        result = CarryPlanVestingScheduleService(
            company_id=self.company.id,
            carry_plan_id=pk
        ).get_vesting_schedules()
        return Response(result, status=status.HTTP_200_OK)


class CarryPlanMilestoneView(AdminViewMixin, APIView):
    def patch(self, request):
        data = request.data

        carry_milestone = CarryPlanMilestone.objects.filter(
            carry_plan_id=data['carry_plan_id'],
            milestone_id=data['milestone_id']
        ).first()
        if carry_milestone:
            if data.get('date'):
                carry_milestone.date = data.get('date')
            if data.get('vesting_percentage'):
                carry_milestone.vesting_percentage = data.get('vesting_percentage')
            carry_milestone.save()
        else:
            CarryPlanMilestone.objects.create(**data)
        return Response({'msg': 'Success'}, status=status.HTTP_200_OK)


class UserCarryDocumentsView(AdminViewMixin, APIView):
    def get(self, request, user_id):
        company_user = get_object_or_404(CompanyUser, company=self.company, user_id=user_id)
        response_data = InvestorCarryDocumentService(
            companies=[self.company],
            company_users=[company_user]
        ).compile()

        return Response(response_data)


class CarryParticipantCreateAPIView(AdminViewMixin, CreateAPIView, ListAPIView):
    serializer_class = CarryParticipantSerializer

    def get_queryset(self):
        return CarryParticipant.objects.filter(company=self.company)


class CarryPlanDiluteView(AdminViewMixin, APIView):
    def post(self, request, pk):
        serializer = CarryPlanDiluteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        result = DilutionService(
            company=self.company,
            carry_plan_id=pk,
            dilute_date=validated_data['dilute_date'],
            dilute_points=validated_data['dilute_points'],
            allocations=validated_data['allocations'],
            mode=validated_data['mode']
        ).dilute_carry_plan()

        return Response(result, status=status.HTTP_200_OK)


class CarryPlanPreviewDiluteView(AdminViewMixin, APIView):
    def post(self, request, pk):
        serializer = CarryPlanDiluteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        dilution_service = DilutionService(
            company=self.company,
            carry_plan_id=pk,
            dilute_date=validated_data['dilute_date'],
            dilute_points=validated_data['dilute_points'],
            allocations=validated_data['allocations'],
            mode=validated_data['mode']
        )
        allocations = dilution_service.get_allocations_with_reduced_points()
        errors = dilution_service.errors

        result = {
            'allocations': allocations,
            'errors': errors
        }
        return Response(result, status=status.HTTP_200_OK)


class CarrySubPoolAPIView(AdminViewMixin, ListAPIView, VestingDateViewMixin):
    serializer_class = CarrySubPoolSerializer

    def get_queryset(self):
        return CarrySubPool.objects.filter(carry_plan=self.kwargs['pk']).select_related(
            'template_share_class',
            'vesting_schedule',
            'vehicle'
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        carry_plan = get_object_or_404(CarryPlan, id=self.kwargs['pk'])
        try:
            carry_pool = get_carry_pool_of_carry_plan(
                carry_plan.id,
                company_id=carry_plan.company_id
            )
        except CarryPool.DoesNotExist:
            return context

        sub_pools_details = {}
        allocations = carry_pool.allocations
        get_forfeit_dilute_transferred_adjusted_allocations(allocations, self.calculation_date)
        for allocation in allocations:
            sub_pool_id = allocation.get('sub_pool_id')
            if sub_pool_id:
                if sub_pool_id in sub_pools_details:
                    sub_pools_details[sub_pool_id] += Decimal(str(allocation['bps']))
                else:
                    sub_pools_details[sub_pool_id] = Decimal(str(allocation['bps']))

        context['sub_pools_details'] = sub_pools_details
        return context


class SubPoolCreateAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = CarrySubPoolCreateSerializer

    def get_queryset(self):
        return CarrySubPool.objects.filter(carry_plan__company=self.company)


class SubPoolUpdateDeleteAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = CarrySubPoolCreateSerializer

    def get_queryset(self):
        return CarrySubPool.objects.filter(carry_plan__company=self.company)

    def perform_destroy(self, instance: CarrySubPool):
        instance.deleted = True
        instance.save()


class SubPoolPointsMigrationsAPIView(AdminViewMixin, CreateAPIView, VestingDateViewMixin):
    serializer_class = SubPoolPointsMovingSerializer

    def get_queryset(self):
        return CarrySubPool.objects.filter(carry_plan__company=self.company)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['calculation_date'] = self.calculation_date
        return context


class UserParticipantProfileView(AdminViewMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin,
                                 GetSerializerClassMixin, GenericViewSet):
    serializer_action_classes = {
        'update': UpdateProfileSerializer,
        'retrieve': ProfileSerializer,
    }

    def get_queryset(self):
        user_carry_participants_prefetch = Prefetch("user_carry_participants",
                                                    CarryParticipantUser.objects.select_related("carry_participant"))
        company_user_prefetch = Prefetch("associated_company_users", CompanyUser.objects.all())
        return get_users_in_company(company=self.company) \
            .filter(user_carry_participants__isnull=False) \
            .select_related('user_participant_profile__employment_record') \
            .prefetch_related(company_user_prefetch, user_carry_participants_prefetch).distinct('id')


class UserParticipantEmploymentRecordView(AdminViewMixin, UpdateAPIView):
    serializer_class = UpdateEmploymentSerializer

    def get_queryset(self):
        user_carry_participants_prefetch = Prefetch("user_carry_participants",
                                                    CarryParticipantUser.objects.select_related("carry_participant"))
        company_user_prefetch = Prefetch("associated_company_users", CompanyUser.objects.all())
        return get_users_in_company(company=self.company) \
            .filter(user_carry_participants__isnull=False) \
            .select_related('user_participant_profile__employment_record') \
            .prefetch_related(company_user_prefetch, user_carry_participants_prefetch).distinct('id')


class UserParticipantProfileView2(AdminViewMixin, mixins.ListModelMixin, mixins.UpdateModelMixin,
                                  GetSerializerClassMixin, GenericViewSet):
    serializer_action_classes = {
        'update': UpdateProfileSerializer,
        'list': ProfileSerializer
    }

    def get_queryset(self):
        user_carry_participants_prefetch = Prefetch("user_carry_participants",
                                                    CarryParticipantUser.objects.select_related("carry_participant"))
        company_user_prefetch = Prefetch("associated_company_users", CompanyUser.objects.all())
        return get_users_in_company(company=self.company) \
            .filter(user_carry_participants__isnull=False) \
            .select_related('user_participant_profile__employment_record') \
            .prefetch_related(company_user_prefetch, user_carry_participants_prefetch).distinct('id')


class CarryListAllUsersView(AdminViewMixin, ListAPIView):
    serializer_class = CarryListAllUsersSerializer

    def get_queryset(self):
        return CompanyUser.objects.filter(company=self.company).select_related('user').prefetch_related(
            'user__user_carry_participants'
        ).order_by('user__email')


class CarryDocumentParticipantsReleaseAPIView(AdminViewMixin, APIView):
    def post(self, request):
        ParticipantCarryDocument.objects.filter(
            company=self.company,
            is_released=False
        ).update(is_released=True)

        return Response({'msg': 'success'}, status=status.HTTP_200_OK)


class CarryDocumentParticipantsUpdateAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = CarryDocumentParticipantSerializer

    def get_queryset(self):
        return ParticipantCarryDocument.objects.filter(company=self.company)

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save()


class MangerReportingFirmLevelView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request):
        is_manager = self.admin_user.groups.filter(name=CARRY_MANAGER).exists()
        result = ManagerReportService(
            company=self.company,
            calculation_date=self.calculation_date,
            user=self.request.user,
            is_manager=is_manager
        ).get_manager_data()
        return Response(result, status=status.HTTP_200_OK)


class MangerReportingDetailView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, carry_participant_id):
        carry_participant = get_object_or_404(CarryParticipant, id=carry_participant_id)
        retail_user = carry_participant.carry_participant_user.first().user
        user_carry_participants = retail_user.user_carry_participants.all()
        carry_participant_ids = [user_carry_participant.carry_participant_id for user_carry_participant in
                                 user_carry_participants]
        service = UserCarryAllocationService(
            carry_participant_ids=carry_participant_ids,
            company_id=self.company.id,
            calculation_date=self.calculation_date
        )
        allocations = service.get_user_data()
        data = {
            'employment_record': ProfileSerializer(retail_user).data,
            'allocations': allocations
        }
        return Response(data, status=status.HTTP_200_OK)


class CarryGpCommitmentListCreateUpdateAPIView(AdminViewMixin, APIView):
    def get(self, request):
        service = GpCommitService(self.company)
        data = service.prepare_formatted_data()
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        request.data['company'] = self.company.id
        serializer = CarryGpCommitmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        gp_commit = get_object_or_404(CarryGpCommitment, id=request.data.get('id'))
        request.data['company'] = self.company.id
        serializer = CarryGpCommitmentSerializer(gp_commit, request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CarryGpCommitmentDetailAPIView(AdminViewMixin, APIView):
    def get(self, request, source_external_id, source_type):
        service = GpCommitService(self.company)
        data = service.prepare_formatted_data_participants(source_external_id, source_type)
        return Response(data, status=status.HTTP_200_OK)

    def delete(self, request, source_external_id, source_type):
        service = GpCommitService(self.company)
        data = service.delete_for_participants(source_external_id, source_type)
        return Response(data, status=status.HTTP_200_OK)


class CarryGpCommitmentParticipantListAPIView(AdminViewMixin, APIView):
    def get(self, request, user_id):
        user = get_object_or_404(RetailUser, id=user_id)
        user_carry_participants = user.user_carry_participants.all()
        carry_participant_ids = [user_carry_participant.carry_participant_id for user_carry_participant in
                                 user_carry_participants]
        service = GpCommitService(self.company)
        data = service.prepare_formatted_data_for_user(carry_participant_ids)
        return Response(data, status=status.HTTP_200_OK)


class CarryParticipantEntityTypes(AdminViewMixin, APIView):
    def get(self, request):
        entity_types = [
            {"id": choice.value, "name": choice.label}
            for choice in CarryParticipant.EntityType
        ]
        return Response(entity_types, status=status.HTTP_200_OK)


class CarryCreateTransferAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def post(self, request, pk):
        carry_plan = get_object_or_404(CarryPlan, id=pk)
        serializer = CarryTransferPointsSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            service = CarryPlanPointTransferService(
                self.company,
                carry_plan,
                validated_data['transfer_to_allocations'],
                validated_data['transfer_from_allocation'],
                self.admin_user
            )
            data = service.transfer_points_in_carry_plan()
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CarryHurdleListCreateAPIView(AdminViewMixin, ListCreateAPIView, VestingDateViewMixin):
    serializer_class = CarryHurdleSerializer

    def is_create_request(self):
        return self.request.method == 'POST'

    def get_serializer_class(self):
        if self.is_create_request():
            return CarryHurdleSerializer
        return CarryHurdleListSerializer

    def get_queryset(self):
        return CarryHurdle.objects.filter(
            carry_plan_id=self.kwargs['pk'],
            carry_plan__company=self.company
        ).select_related('carry_plan')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['carry_plan'] = get_object_or_404(CarryPlan, id=self.kwargs.get('pk'))
        if self.is_create_request():
            context['impacted_allocations'] = self.request.data['impacted_allocations']
            context['source_allocations'] = self.request.data['source_allocations']
        else:
            allocations = PrepareAllocationFormatService(
                carry_plan_id=self.kwargs.get('pk')
            ).get_formatted_data_for_allocations(self.calculation_date)
            allocations_map = {
                allocation['allocation_id']: allocation for allocation in allocations['allocations']
            }
            context['allocations_map'] = allocations_map
        return context


class CarryHurdleDetailAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView, VestingDateViewMixin):
    serializer_class = CarryHurdleSerializer

    def get_queryset(self):
        return CarryHurdle.objects.filter(
            id=self.kwargs['pk'],
            carry_plan__company=self.company
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method in ('POST', 'PATCH'):
            context['impacted_allocations'] = self.request.data['impacted_allocations']
            context['source_allocation'] = self.request.data['source_allocation']
        return context

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save(update_fields=['deleted'])



class AllocationValueAdjustmentListCreateAPIView(AdminViewMixin, ListCreateAPIView, VestingDateViewMixin):
    serializer_class = AllocationValueAdjustmentSerializer

    def get_queryset(self):
        return AllocationValueAdjustment.objects.filter(
            carry_plan_id=self.kwargs['pk'],
            carry_plan__company=self.company
        ).select_related('carry_plan')



class AllocationValueAdjustmentDetailAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView, VestingDateViewMixin):
    serializer_class = AllocationValueAdjustmentSerializer

    def get_queryset(self):
        return AllocationValueAdjustment.objects.filter(
            id=self.kwargs['pk'],
            carry_plan__company=self.company
        )

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save(update_fields=['deleted'])


class CarryPlanAdjustmentAllocationsAPIView(AdminViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, pk):
        result = PrepareAllocationFormatService(
            carry_plan_id=pk
        ).get_carry_plan_allocations_with_adjustments(self.calculation_date)

        return Response(result, status=status.HTTP_200_OK)
