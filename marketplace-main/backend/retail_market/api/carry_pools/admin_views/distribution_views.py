from decimal import Decimal

from rest_framework import mixins, status
from rest_framework.generics import get_object_or_404, RetrieveUpdateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response

from api.carry_pools.entities import DistributionsAdminOverview
from api.carry_pools.models import FundCarryPlan, \
    DealCarryPlan, CarryPool, CarryParticipant, Deal, InvestmentTrancheCarryPlan, InvestmentTranche, Distribution, ParticipantDistribution
from api.carry_pools.serializers import AdminCreateDistributionSerializer, DistributionSerializer
from api.carry_pools.utils import distribution_qs, get_forfeit_dilute_transferred_adjusted_allocations
from api.mixins.admin_view_mixin import AdminViewMixin


class CarryFundDistributionView(
    AdminViewMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    GenericViewSet
):
    serializer_class = AdminCreateDistributionSerializer

    def get_queryset(self):
        qs = distribution_qs().filter(company=self.company)
        return qs

    def list(self, request, *args, **kwargs):
        distributions = self.get_queryset()
        overview = DistributionsAdminOverview.from_queryset(distributions)
        return Response(overview.model_dump(), status=status.HTTP_200_OK)


class DistributionCarryPlanDetailView(AdminViewMixin, APIView):
    def get_deal_carry_plan(self, external_id):
        deal_carry_plan = DealCarryPlan.objects.filter(
            deal__company=self.company,
           deal__external_id=external_id
        ).first()
        if deal_carry_plan:
            return deal_carry_plan.carry_plan
        else:
            deal_qs = Deal.objects.filter(company=self.company, external_id=external_id)
            if deal_qs.exists():
                deal = deal_qs.first()
                deal_fund = deal.fund
                if deal_fund and deal_fund.fund_carry_plans.exists():
                    return deal_fund.fund_carry_plans.first().carry_plan

    def get_investment_tranche_carry_plan(self, external_id):
        investment_tranche_carry_plan = InvestmentTrancheCarryPlan.objects.filter(
           investment_tranche__company=self.company,
           investment_tranche__external_id=external_id
        ).first()
        if investment_tranche_carry_plan:
            return investment_tranche_carry_plan.carry_plan
        else:
            investment_tranche = InvestmentTranche.objects.filter(company=self.company, external_id=external_id)
            if investment_tranche.exists():
                deal = investment_tranche.first().deal
                deal_carry_plan = deal.deal_carry_plan.first()
                if deal_carry_plan:
                    return deal_carry_plan.carry_plan
                deal_fund = deal.fund
                if deal_fund and deal_fund.fund_carry_plans.exists():
                    return deal_fund.fund_carry_plans.first().carry_plan

    def post(self, request, *args, **kwargs):
        required_params = {'external_id', 'distribution_date'}
        missing_params = required_params - request.data.keys()

        if missing_params:
            return Response({'Error': f"Required parameters missing: {', '.join(missing_params)}"},
                            status=status.HTTP_400_BAD_REQUEST)

        external_id = request.data['external_id']
        distribution_date = request.data['distribution_date'].split('T')[0]

        fund_carry_plan = FundCarryPlan.objects.filter(fund__company=self.company, fund__external_id=external_id).first()
        if fund_carry_plan:
            carry_plan = fund_carry_plan.carry_plan
        else:
            carry_plan = self.get_deal_carry_plan(external_id=external_id)
            if not carry_plan:
                carry_plan = self.get_investment_tranche_carry_plan(external_id=external_id)

            if not carry_plan:
                return Response({'Error': 'No Carry Plan found against fund/deal'},
                                status=status.HTTP_400_BAD_REQUEST)

        matching_carry_pool = CarryPool.objects.filter(
            carry_plan=carry_plan,
            company=self.company
        ).order_by('-created_at').first()

        if not matching_carry_pool:
            return Response({'Error': 'No carry pool found'},
                            status=status.HTTP_400_BAD_REQUEST)
        allocations = matching_carry_pool.allocations
        get_forfeit_dilute_transferred_adjusted_allocations(allocations=allocations, calculation_date=distribution_date)

        total_points = Decimal(str(matching_carry_pool.bps))
        allocated_points = 0
        for allocation in allocations:
            allocated_points += allocation['bps']
            carry_participant_id = allocation.get('carry_participant_id')
            carry_participant = get_object_or_404(CarryParticipant, id=carry_participant_id)
            allocation['full_name'] = carry_participant.get_full_name()

        for allocation in allocations:
            allocation['bps'] = str(allocation['bps'])

        response = {
            'carry_plan_name': carry_plan.name,
            'total_points': total_points,
            'unallocated_points': str(total_points- allocated_points),
            'allocated_points': str(allocated_points),
            'total_participants': len(allocations),
            'allocations': allocations
        }
        return Response(response, status=status.HTTP_200_OK)


class DistributionView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = DistributionSerializer

    def get_queryset(self):
        qs = distribution_qs().filter(company=self.company).prefetch_related('distribution_participants')
        return qs

    def perform_destroy(self, instance: Distribution):
        realization = instance.realization

        if hasattr(realization, 'investment_tranche_realization'):
            investment_tranche_realization = realization.investment_tranche_realization
            investment_tranche_realization.deleted = True
            investment_tranche_realization.save()

        if hasattr(realization, 'deal_realization'):
            deal_realization = realization.deal_realization
            deal_realization.deleted = True
            deal_realization.save()

        if hasattr(realization, 'fund_realization'):
            fund_realization = realization.fund_realization
            fund_realization.deleted = True
            fund_realization.save()

        instance.realization.deleted = True
        instance.realization.save()

        for participant_distribution in ParticipantDistribution.objects.filter(
                distribution=instance,
                company=self.company
        ):
            participant_distribution.deleted = True
            participant_distribution.save()

        instance.deleted = True
        instance.save()
