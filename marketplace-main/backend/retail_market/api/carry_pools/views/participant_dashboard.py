from django.db.models import Q
from rest_framework import status
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.carry_pools.entities import AllocationsOverview, DistributionsAdminOverview
from api.carry_pools.models import CarryPool, CarryPlan, VestingSchedule, CarryParticipantUser, ParticipantDistribution
from api.carry_pools.serializers import VestingScheduleDisplaySerializer
from api.carry_pools.services.gp_commit_service import GpCommitService
from api.carry_pools.services.investor_carry_documents import InvestorCarryDocumentService
from api.carry_pools.services.user_carry_allocation_service import UserCarryAllocationService
from api.carry_pools.utils import calculate_forecasted_value, get_all_latest_published_pools_for_company, \
    update_custom_schedules_dict_with_milestone_data, custom_sort_list_of_dicts
from api.carry_pools.views.carry_documents import ParticipantCarryDocumentUpdateAPIView
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.mixins.vesting_date_mixin import VestingDateViewMixin

DocumentsView = ParticipantCarryDocumentUpdateAPIView


class AllocationsView(CompanyUserViewMixin, APIView, VestingDateViewMixin):

    def get(self, request):
        user_carry_participants = CarryParticipantUser.objects.filter(
            user_id=self.view_as_user.id
        ).select_related("carry_participant")
        carry_participant_ids = [user_carry_participant.carry_participant_id for user_carry_participant in user_carry_participants]
        service = UserCarryAllocationService(
            carry_participant_ids=carry_participant_ids,
            company_id=self.companies[0].id,
            calculation_date=self.calculation_date
        )
        allocations_response = service.get_investor_data()
        sorted_data = custom_sort_list_of_dicts(list(allocations_response), key='carry_plan_name')
        return Response(sorted_data, status=status.HTTP_200_OK)


class OverviewView(CompanyUserViewMixin, APIView, VestingDateViewMixin):

    def get(self, request):
        user_id = self.view_as_user.id
        carry_participant_ids = CarryParticipantUser.objects.filter(
            user_id=user_id
        ).values_list('carry_participant_id', flat=True)

        latest_carry_pools = get_all_latest_published_pools_for_company(self.company_ids)

        q_objects = Q()
        for carry_participant_id in carry_participant_ids:
            q_objects |= Q(allocations__contains=[{'carry_participant_id': carry_participant_id}])

        participant_distributions = (
            ParticipantDistribution.objects
            .filter(company_id__in=self.company_ids, participant_id__in=carry_participant_ids)
        )

        total_amount = sum(participant_distribution.amount for participant_distribution in participant_distributions)

        matching_carry_pools = latest_carry_pools.filter(q_objects)
        allocations_count = CarryPlan.objects.filter(
            company_id__in=self.company_ids,
            carry_pools__in=matching_carry_pools
        ).count()

        estimated_unvested_value = 0
        estimated_vested_value = 0
        fair_market_vested_value = 0
        fair_market_unvested_value = 0
        for company_id in self.company_ids:
            forecast_values = calculate_forecasted_value(
                carry_participant_ids,
                company_id,
                self.calculation_date,
                CarryPool.Status.PUBLISHED.value
            )
            estimated_unvested_value += forecast_values.total_unvested_forecast
            estimated_vested_value += forecast_values.total_vested_forecast
            fair_market_vested_value += forecast_values.total_vested_fair_market_value_forecast
            fair_market_unvested_value += forecast_values.total_unvested_fair_market_value_forecast

        res = {
            'allocations_count': allocations_count,
            'total_estimated_value': estimated_unvested_value + estimated_vested_value,
            'estimated_vested_value': estimated_vested_value,
            'estimated_unvested_value': estimated_unvested_value,
            'total_fair_market_value': fair_market_vested_value + fair_market_unvested_value,
            'fair_market_vested_value': fair_market_vested_value,
            'fair_market_unvested_value': fair_market_unvested_value,
            'total_distributions': total_amount,
        }
        return Response(res, status=status.HTTP_200_OK)


class AllocationOverviewView(CompanyUserViewMixin, APIView, VestingDateViewMixin):

    def get(self, request, external_id):
        carry_participants = CarryParticipantUser.objects.filter(
            user_id=self.view_as_user.id
        ).select_related("carry_participant")
        q_objects = Q()
        carry_participants = [carry_participant.carry_participant for carry_participant in carry_participants]
        for carry_participant in carry_participants:
            q_objects |= Q(allocations__contains=[{'carry_participant_id': carry_participant.id}])

        matching_carry_pools = CarryPool.objects.filter(
            company_id__in=self.company_ids,
            external_id=external_id,
            status=CarryPool.Status.PUBLISHED.value
        ).filter(q_objects).select_related(
            'carry_plan', 'carry_plan__default_vesting_schedule'
        ).order_by('-created_at')[:1]

        if not matching_carry_pools.exists():
            return Response({'error': f"No carry plan for {request.user.id} and external id: {external_id}"})
        carry_pool = matching_carry_pools.first()
        res = AllocationsOverview.from_carry_pool(
            carry_pool=carry_pool,
            carry_participants=carry_participants,
            calculation_date=self.calculation_date
        )
        return Response(res.model_dump(), status=status.HTTP_200_OK)


class ParticipantVestingScheduleDisplayView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = VestingScheduleDisplaySerializer

    def get_queryset(self):
        return VestingSchedule.objects.filter(company_id__in=self.company_ids) \
            .prefetch_related('time_vesting_schedules') \
            .prefetch_related('milestone_vesting_schedules')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        external_id = request.query_params.get('external_id')
        carry_pool = CarryPool.objects.filter(company_id__in=self.company_ids, external_id=external_id).select_related('carry_plan').first()
        carry_plan_id = carry_pool.carry_plan.id
        if instance.custom_display:
            update_custom_schedules_dict_with_milestone_data(carry_plan_id, instance.custom_display)
            return Response(instance.custom_display)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CarryDocumentsAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        response_data = InvestorCarryDocumentService(
            companies=self.companies,
            company_users=self.company_users,
            released_filter=True
        ).compile_by_external_id(external_id=request.query_params['external_id'])

        return Response(response_data)


class CarryPoolAllocationDetailAPIView(CompanyUserViewMixin, APIView, VestingDateViewMixin):
    def get(self, request, external_id, allocation_id):
        matching_carry_pools = CarryPool.objects.filter(
            company_id__in=self.company_ids,
            external_id=external_id
        )
        carry_pool = matching_carry_pools.first()
        carry_plan = carry_pool.carry_plan
        service = UserCarryAllocationService(
            carry_participant_ids=[],
            company_id=carry_plan.company_id,
            calculation_date=self.calculation_date,
            carry_pool_status=CarryPool.Status.PUBLISHED.value
        )
        result = service.get_user_single_allocation_data(
            carry_plan_id=carry_plan.id,
            allocation_id=allocation_id
        )
        return Response(result, status=status.HTTP_200_OK)


class ParticipantDistributionsView(CompanyUserViewMixin, ListAPIView):

    def list(self, request, *args, **kwargs):
        user_id = self.view_as_user.id
        carry_participant_ids = CarryParticipantUser.objects.filter(
            user_id=user_id
        ).values_list('carry_participant_id', flat=True)

        participant_distributions = ParticipantDistribution.objects.filter(
            participant__in=carry_participant_ids,
            company_id__in=self.company_ids
        )
        return Response(DistributionsAdminOverview.from_queryset_investor(participant_distributions).model_dump(),
                        status=status.HTTP_200_OK)


class CarryGpCommitmentsListAPIView(CompanyUserViewMixin, APIView):
    def get(self, request):
        user = request.user
        user_carry_participants = user.user_carry_participants.all()
        carry_participant_ids = [
            user_carry_participant.carry_participant_id for user_carry_participant in user_carry_participants]
        data = GpCommitService.prepare_formatted_data_for_investor_dashboard(
            carry_participant_ids=carry_participant_ids,
            company_ids=self.company_ids,
        )
        return Response(data, status=status.HTTP_200_OK)
