from datetime import date
from decimal import Decimal

from rest_framework.generics import get_object_or_404

from api.carry_pools.models import CarryPlan, VestingSchedule, CarryParticipant, AllocationAction, CarrySubPool, \
    CarryVehicle, CarryShareClass, ParticipantDistribution, CarryPool, CarryHurdle, AllocationValueAdjustment
from api.carry_pools.serializers import (VestingScheduleBaseInfoSerializer, DealSerializer,
                                         SingleCarryPlanListSerializer, CarrySubPoolSerializer, CarryVehicleSerializer,
                                         CarryShareClassSerializer, InvestmentTrancheSerializer, DealReadSerializer)
from api.carry_pools.utils import get_carry_pool_of_carry_plan, \
    calculate_allocations_by_date, get_forfeit_dilute_transferred_adjusted_allocations
from api.carry_pools.services.calculate_estimated_values import EstimatedValuesService


class PrepareAllocationFormatService:

    def __init__(self, carry_plan_id=None, deal=None, investment_tranche=None):
        self.carry_plan = None
        self.carry_pool = None
        self.company = None
        if deal:
            self.deal = deal
            self.company = self.deal.company
            deal_carry_plan = deal.deal_carry_plan.exists()
            if deal_carry_plan:
                self.carry_plan = deal.deal_carry_plan.first().carry_plan

        if investment_tranche:
            self.investment_tranche = investment_tranche
            self.company = self.investment_tranche.company
            self.carry_plan = None
            if hasattr(self.investment_tranche, 'investment_tranche_carry_plan'):
                self.carry_plan = self.investment_tranche.investment_tranche_carry_plan.carry_plan

        if carry_plan_id:
            self.carry_plan = get_object_or_404(CarryPlan, id=carry_plan_id)
            self.company = self.carry_plan.company

    def get_company_users_data_with_no_allocations(self):
        carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.carry_plan.company_id)
        carry_participant_ids = [allocation.get('carry_participant_id') for allocation in carry_pool.allocations]

        carry_participants = CarryParticipant.objects.filter(
            company=self.carry_plan.company
        ).exclude(id__in=carry_participant_ids)

        default_vesting_schedule = self.carry_plan.default_vesting_schedule
        vesting_schedule_data = VestingScheduleBaseInfoSerializer(default_vesting_schedule).data

        formatted_users = []
        for participant in carry_participants:
            formatted_users.append({
                'carry_participant_id': participant.id,
                'name': participant.get_full_name(),
                'bps': 0,
                'vesting_schedule': vesting_schedule_data,
                'allocation_id': None,
                'hire_date': date.today(),
                'status': 'Active',
                'award_letter': None
            })

        return formatted_users

    def get_carry_pool_allocation(self, carry_pool=None):
        if carry_pool is None:
            carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.carry_plan.company_id)

        formatted_allocation = []
        for allocation in carry_pool.allocations:
            carry_participant_id = allocation.get('carry_participant_id')
            carry_participant = get_object_or_404(CarryParticipant, id=carry_participant_id)

            vesting_schedule = VestingSchedule.objects.get(id=allocation['vesting_schedule'])
            vesting_schedule_data = VestingScheduleBaseInfoSerializer(vesting_schedule).data

            vehicle_data = {}
            share_class_data = {}
            if allocation.get('vehicle'):
                vehicle = CarryVehicle.objects.get(id=allocation['vehicle'])
                vehicle_data = CarryVehicleSerializer(vehicle).data

            if allocation.get('share_class'):
                share_class = CarryShareClass.objects.get(id=allocation['share_class'])
                share_class_data = CarryShareClassSerializer(share_class).data

            sub_pool_name = None
            sub_pool_id = allocation.get('sub_pool_id')
            if sub_pool_id:
                carry_sub_pool = CarrySubPool.objects.get(pk=sub_pool_id)
                sub_pool_name = carry_sub_pool.name

            hurdle_ecv = CarryHurdle.objects.filter(
                carry_plan=self.carry_plan,
                source_allocation_id=allocation.get('allocation_id'),
                applies_to=CarryHurdle.AppliesToType.ECV.value
            ).first()
            hurdle_fmv = CarryHurdle.objects.filter(
                carry_plan=self.carry_plan,
                source_allocation_id=allocation.get('allocation_id'),
                applies_to=CarryHurdle.AppliesToType.FMV.value
            ).first()

            formatted_allocation.append({
                'carry_participant_id': carry_participant.id,
                'name': carry_participant.get_full_name(),
                'bps': allocation['bps'],
                'vesting_schedule': vesting_schedule_data,
                'allocation_id': allocation['allocation_id'],
                'issue_date': allocation['grant_date'],
                'grant_date': allocation['grant_date'],
                'vesting_start_date': allocation.get('vesting_start_date'),
                'vehicle': vehicle_data,
                'share_class': share_class_data,
                'sub_pool_id': sub_pool_id,
                'sub_pool_name': sub_pool_name,
                'ecv_hurdle': True if hurdle_ecv else False,
                'fmv_hurdle': True if hurdle_fmv else False,
                # Dummy fields
                'hire_date': date.today(),
                'status': 'Active',
                'award_letter': None,
            })

        return formatted_allocation

    def get_sub_pools_info(self, allocations):
        sub_pools = self.carry_plan.carry_plan_subpools.select_related(
            'template_share_class',
            'vesting_schedule',
            'vehicle'
        )
        sub_pools = CarrySubPoolSerializer(sub_pools, many=True).data
        for sub_pool in sub_pools:
            total_points = Decimal(str(sub_pool['bps']))
            allocation_points = [Decimal(str(allocation['bps'])) for allocation in allocations if
                                 allocation.get('sub_pool_id', 0) == sub_pool['id']]
            allocated_points = sum(allocation_points)
            sub_pool['allocated'] = str(allocated_points)
            sub_pool['un_allocated'] = str(total_points - allocated_points)

        return sub_pools

    def get_last_approved_carry_pool(self):
        carry_pool = CarryPool.objects.filter(
            carry_plan__id=self.carry_plan.id,
            company=self.company,
            status__in=[CarryPool.Status.APPROVED, CarryPool.Status.PUBLISHED]
        ).order_by(
            '-status',  # Prioritizes APPROVED (higher integer value) over PUBLISHED
            '-created_at'
        )

        return carry_pool.first() if carry_pool.exists() else None

    def get_formatted_data_for_allocations(self, calculation_date):
        allocations = self.get_carry_pool_allocation()
        get_forfeit_dilute_transferred_adjusted_allocations(allocations, calculation_date)

        last_approved_allocations = []
        last_approved_carry_pool = self.get_last_approved_carry_pool()
        if last_approved_carry_pool:
            last_approved_allocations = self.get_carry_pool_allocation(carry_pool=last_approved_carry_pool)
            last_calculation_date = last_approved_carry_pool.modified_at.strftime('%Y-%m-%d')
            get_forfeit_dilute_transferred_adjusted_allocations(last_approved_allocations, last_calculation_date)

        response = {
            'carry_pool': SingleCarryPlanListSerializer(
                self.carry_plan,
                context={'calculation_date': calculation_date}
            ).data,
            'allocations': allocations,
            'last_approved_allocations': last_approved_allocations
        }
        response['carry_pool']['sub_pools'] = self.get_sub_pools_info(allocations)
        total_points = Decimal(response['carry_pool'].get('total_points', 100))
        allocation_points = [allocation['bps'] for allocation in allocations]
        allocated_points = sum(allocation_points)
        response['allocated'] = str(allocated_points)
        response['un_allocated'] = str(total_points - allocated_points)
        for allocation in allocations:
            allocation['bps'] = str(allocation['bps'])

        for last_allocation in last_approved_allocations:
            last_allocation['bps'] = str(last_allocation['bps'])

        return response

    def get_carry_pool_allocations_for_deal(self):
        formatted_allocation = []
        if self.carry_plan:
            self.carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.carry_plan.company_id)
            for allocation in self.carry_pool.allocations:
                carry_participant_id = allocation.get('carry_participant_id')
                carry_participant = get_object_or_404(CarryParticipant, id=carry_participant_id)
                allocation['name'] = carry_participant.get_full_name()
                formatted_allocation.append(allocation)

        return formatted_allocation

    def get_carry_pool_allocations_for_investment_tranche(self):
        formatted_allocation = []
        if self.carry_plan:
            self.carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.carry_plan.company_id)
            for allocation in self.carry_pool.allocations:
                carry_participant_id = allocation.get('carry_participant_id')
                carry_participant = get_object_or_404(CarryParticipant, id=carry_participant_id)
                allocation['name'] = carry_participant.get_full_name()
                formatted_allocation.append(allocation)

        return formatted_allocation

    def add_distributions_info(self, allocations_by_id):
        allocation_ids = list(allocations_by_id.keys())
        participant_distributions = ParticipantDistribution.objects.filter(
            company=self.company,
            allocation_id__in=allocation_ids
        )
        for participant_distribution in participant_distributions.all():
            if 'distributions' not in allocations_by_id[participant_distribution.allocation_id]:
                allocations_by_id[participant_distribution.allocation_id][
                    'distributions'] = participant_distribution.amount
            else:
                allocations_by_id[participant_distribution.allocation_id][
                    'distributions'] += participant_distribution.amount

    def get_formatted_data_for_deal_allocations(self, calculation_date):
        allocations = self.get_carry_pool_allocations_for_deal()
        allocations = calculate_allocations_by_date(allocations, calculation_date)
        deal_estimated_value = self.deal.carry_estimated_value
        deal_fair_market_value = self.deal.carry_fair_market_value
        value_adjustments = self.carry_plan.get_adjustments_by_allocations(calculation_date=calculation_date) \
            if self.carry_plan else None
        for allocation in allocations:
            estimated_values = EstimatedValuesService(
                {
                    'allocation': allocation,
                    'carry_plan': self.carry_plan,
                    'carry_pool': self.carry_pool,
                    'latest_allocations': allocations,
                    'carry_plan_estimated_value': deal_estimated_value,
                    'carry_plan_fair_market_value': deal_fair_market_value,
                    'calculation_date': calculation_date,
                    'entity_calculation': True,
                    'value_adjustments': value_adjustments
                }
            ).calculate()
            un_vested_bps =  Decimal(str(allocation['bps'])) - Decimal(str(allocation['vested_bps']))
            allocation['un_vested_bps'] = un_vested_bps
            allocation['vested_percentage'] = allocation.get('vested_percentage_display', '0')
            allocation['estimated_value'] = estimated_values['carry_estimated_value']
            allocation['estimated_value_date'] = self.deal.estimated_value_date
            allocation['fair_market_value'] = estimated_values['fair_market_value']
            allocation['fair_market_value_date'] = self.deal.fair_market_value_date
            allocation['bps'] = str(allocation['bps'])
            allocation['distributions'] = 0
        allocations_by_id = {allocation['allocation_id']: allocation for allocation in allocations}
        self.add_distributions_info(allocations_by_id)

        return {
            'deal': DealReadSerializer(self.deal).data,
            'total_points': self.carry_pool.bps if self.carry_pool else 0,
            'participants': list(allocations_by_id.values())
        }

    def get_formatted_data_for_investment_tranche_allocations(self, calculation_date):
        if not self.carry_plan:
            return {
                'investment_tranche': InvestmentTrancheSerializer(self.investment_tranche).data,
                'total_points': 0,
                'participants': []
            }

        allocations = self.get_carry_pool_allocations_for_investment_tranche()
        allocations = calculate_allocations_by_date(allocations, calculation_date)
        investment_estimated_value = self.investment_tranche.estimated_value
        investment_fair_market_value = self.investment_tranche.fair_market_value
        value_adjustments = self.carry_plan.get_adjustments_by_allocations(calculation_date=calculation_date)\
            if self.carry_plan else None
        for allocation in allocations:
            estimated_values = EstimatedValuesService(
                {
                    'allocation': allocation,
                    'carry_plan': self.carry_plan,
                    'carry_pool': self.carry_pool,
                    'carry_plan_estimated_value': investment_estimated_value,
                    'latest_allocations': allocations,
                    'carry_plan_fair_market_value': investment_fair_market_value,
                    'calculation_date': calculation_date,
                    'entity_calculation': True,
                    'value_adjustments': value_adjustments
                }
            ).calculate()
            un_vested_bps =  Decimal(str(allocation['bps'])) - Decimal(str(allocation['vested_bps']))
            allocation['un_vested_bps'] = un_vested_bps
            allocation['vested_percentage'] = allocation.get('vested_percentage_display', '0')
            allocation['estimated_value'] = estimated_values['carry_estimated_value']
            allocation['estimated_value_date'] = self.investment_tranche.estimated_value_date
            allocation['fair_market_value'] = estimated_values['fair_market_value']
            allocation['fair_market_value_date'] = self.investment_tranche.fair_market_value_date
            allocation['bps'] = str(allocation['bps'])
            allocation['distributions'] = 0
        allocations_by_id = {allocation['allocation_id']: allocation for allocation in allocations}
        self.add_distributions_info(allocations_by_id)

        return {
            'investment_tranche': InvestmentTrancheSerializer(self.investment_tranche).data,
            'total_points': self.carry_pool.bps if self.carry_pool else 0,
            'participants': list(allocations_by_id.values())
        }

    def get_carry_plan_allocations_with_adjustments(self, calculation_date):
        allocations = []
        self.carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.carry_plan.company_id)
        for allocation in self.carry_pool.allocations:
            carry_participant_id = allocation.get('carry_participant_id')
            carry_participant = get_object_or_404(CarryParticipant, id=carry_participant_id)
            allocation['name'] = carry_participant.get_full_name()
            allocations.append(allocation)

        adjustments = self.carry_plan.get_adjustments()
        allocations = calculate_allocations_by_date(allocations, calculation_date)
        estimated_value = self.carry_plan.carry_estimated_value
        fair_market_value = self.carry_plan.fair_market_value
        value_adjustments = self.carry_plan.get_adjustments_by_allocations(calculation_date=calculation_date)

        for allocation in allocations:
            estimated_values = EstimatedValuesService(
                {
                    'allocation': allocation,
                    'carry_plan': self.carry_plan,
                    'carry_pool': self.carry_pool,
                    'carry_plan_estimated_value': estimated_value,
                    'carry_plan_fair_market_value': fair_market_value,
                    'latest_allocations': allocations,
                    'calculation_date': calculation_date,
                    'entity_calculation': True,
                    'value_adjustments': value_adjustments
                }
            ).calculate()
            un_vested_bps =  Decimal(str(allocation['bps'])) - Decimal(str(allocation['vested_bps']))
            allocation['un_vested_bps'] = un_vested_bps
            allocation['vested_percentage'] = allocation.get('vested_percentage_display', '0')
            allocation['estimated_value'] = estimated_values['carry_estimated_value']
            allocation['estimated_value_date'] = self.carry_plan.estimated_value_date
            allocation['fair_market_value'] = estimated_values['fair_market_value']
            allocation['adjusted_estimated_value'] = value_adjustments.get(allocation['allocation_id'], {}).get(AllocationValueAdjustment.ValueType.ESTIMATED_VALUE.value, 0)
            allocation['adjusted_fair_market_value'] = value_adjustments.get(allocation['allocation_id'], {}).get(AllocationValueAdjustment.ValueType.FAIR_MARKET_VALUE.value, 0)
            allocation['fair_market_value_date'] = self.carry_plan.fair_market_value_date
            allocation['bps'] = str(allocation['bps'])
            allocation['distributions'] = 0
            allocation['adjustments'] = adjustments.get(allocation['allocation_id'], [])


        response = {
            'allocations': allocations,
        }
        return response
