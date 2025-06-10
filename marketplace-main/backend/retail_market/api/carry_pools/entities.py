from datetime import datetime, date
from typing import List, Optional

from _decimal import Decimal
from pydantic import BaseModel

from api.carry_pools.models import ParticipantDistribution, VestingSchedule
from api.carry_pools.services.calculate_estimated_values import EstimatedValuesService
from api.carry_pools.utils import calculate_allocations_by_date


class Allocation(BaseModel):
    carry_participant_id: int
    bps: int


class ParticipantAllocation(BaseModel):
    carry_recipient_name: str
    allocation_id: str
    vested_points: float
    unvested_points: float
    pool_percentage: float
    grant_date: date
    points: float
    vesting_start_date: Optional[date]
    estimated_value: float
    estimated_value_date: Optional[date]
    fair_market_value_date: Optional[date]
    vested_value: float
    unvested_value: float
    fair_market_value: float
    distributions: float
    vesting_schedule_name: Optional[str]


class AllocationsOverview(BaseModel):
    points: str
    unvested_points: float
    vested_points: float
    vesting_plan: str
    vesting_schedule_id: int
    carry_plan_name: str
    carry_pool_points: float
    carry_plan_estimated_value: float
    carry_plan_fair_market_value: float
    allocations: List[ParticipantAllocation]
    pool_percentage: float
    external_id: str
    distributions: float
    vested_value: float
    unvested_value: float
    estimated_value_date: Optional[date]
    fair_market_value_date: Optional[date]

    @classmethod
    def from_carry_pool(cls, carry_pool, carry_participants, calculation_date=None):
        carry_plan = carry_pool.carry_plan
        carry_participants_ids = {participant.id for participant in carry_participants}
        my_allocations = [
            item for item in carry_pool.allocations if item.get('carry_participant_id') in carry_participants_ids
        ]

        if not my_allocations:
            return None

        names_by_id = {item.id: item.get_full_name() for item in carry_participants}

        if calculation_date:
            my_allocations = calculate_allocations_by_date(my_allocations, calculation_date)

        total_pool_percentage = 0
        total_unvested_points = Decimal(0)
        total_bps = Decimal(0)
        total_vested_points = Decimal(0)
        allocations = []
        estimated_carry_value = carry_pool.carry_plan.carry_estimated_value
        fair_market_value = carry_pool.carry_plan.fair_market_value
        results = (
            ParticipantDistribution.objects
            .filter(participant__in=carry_participants, company_id=carry_pool.company_id)
        )
        distributions_by_allocation = dict()
        for participant_distribution in results:
            if participant_distribution.allocation_id not in distributions_by_allocation:
                distributions_by_allocation[participant_distribution.allocation_id] = participant_distribution.amount
            else:
                distributions_by_allocation[participant_distribution.allocation_id] += participant_distribution.amount

        fair_market_value_date = carry_plan.fair_market_value_date
        estimated_value_date = carry_plan.estimated_value_date

        vesting_schedules_ids = list(allocation['vesting_schedule'] for allocation in my_allocations)
        all_allocations_vesting_schedules = VestingSchedule.objects.filter(
            company=carry_plan.company,
            id__in=vesting_schedules_ids
        )
        vesting_schedules_by_allocation_id = dict()
        for allocation in my_allocations:
            vesting_schedules_by_allocation_id[allocation.get('allocation_id')] = next(
                vesting_schedule.name for vesting_schedule in all_allocations_vesting_schedules.all()
                if vesting_schedule.id == allocation.get('vesting_schedule'))

        value_adjustments = carry_plan.get_adjustments_by_allocations(
            calculation_date=calculation_date
        )
        for allocation in my_allocations:
            estimated_values = EstimatedValuesService(
                {
                    'allocation': allocation,
                    'carry_plan': carry_plan,
                    'carry_pool': carry_pool,
                    'carry_plan_estimated_value': estimated_carry_value,
                    'carry_plan_fair_market_value': fair_market_value,
                    'calculation_date': calculation_date,
                    'value_adjustments': value_adjustments
                }
            ).calculate()

            pool_percentage = (allocation.get('bps') / Decimal(str(carry_pool.bps))) * 100
            total_pool_percentage = total_pool_percentage + pool_percentage
            unvested_points = Decimal(str(allocation.get('bps', 0))) - Decimal(str(allocation.get('vested_bps', 0)))
            total_unvested_points = total_unvested_points + unvested_points
            total_bps = total_bps + Decimal(str(allocation.get('bps')))
            total_vested_points = total_vested_points + Decimal(str(allocation.get('vested_bps')))

            participant_estimated_carry = estimated_values['carry_estimated_value']
            participant_fair_market_carry = estimated_values['fair_market_value']
            vested_carry_value = estimated_values['vested_carry_estimated_value']
            un_vested_forecast = estimated_values['un_vested_carry_estimated_value']

            allocations.append({
                "carry_recipient_name": names_by_id[allocation.get('carry_participant_id')],
                "vesting_schedule_name": vesting_schedules_by_allocation_id.get(allocation.get('allocation_id'), ""),
                "vested_points": allocation.get('vested_bps'),
                "allocation_id": allocation.get('allocation_id'),
                "grant_date": allocation.get('grant_date'),
                "unvested_points": unvested_points,
                "points": allocation.get('bps'),
                "pool_percentage": pool_percentage,
                "vesting_start_date": allocation.get('vesting_start_date'),
                "estimated_value": participant_estimated_carry,
                "vested_value": vested_carry_value,
                "unvested_value": un_vested_forecast,
                "fair_market_value": participant_fair_market_carry,
                "fair_market_value_date": fair_market_value_date,
                "estimated_value_date": estimated_value_date,
                "distributions": distributions_by_allocation[allocation['allocation_id']] if allocation['allocation_id'] in distributions_by_allocation else 0,
            })
        res = cls.model_validate({
            "carry_plan_name": carry_pool.name,
            "points": str(total_bps),
            "pool_percentage": total_pool_percentage,
            "unvested_points": total_unvested_points,
            "vested_points": total_vested_points,
            "vesting_plan": carry_pool.carry_plan.default_vesting_schedule.name,
            "vesting_schedule_id": carry_pool.carry_plan.default_vesting_schedule.id,
            "carry_pool_points": carry_pool.bps,
            "carry_plan_estimated_value": sum(alloc['estimated_value'] for alloc in allocations),
            "carry_plan_fair_market_value": sum(alloc['fair_market_value'] for alloc in allocations),
            "fair_market_value_date": fair_market_value_date,
            "estimated_value_date": estimated_value_date,
            "allocations": allocations,
            "external_id": carry_pool.external_id,
            "distributions": sum(alloc['distributions'] for alloc in allocations),
            "vested_value": sum(alloc['vested_value'] for alloc in allocations),
            "unvested_value": sum(alloc['unvested_value'] for alloc in allocations),
        })

        return res


class DistributionModel(BaseModel):
    id: int
    amount: Decimal
    date: datetime
    escrow: Decimal
    source: str


class DistributionsAdminOverview(BaseModel):
    distributions_count: int
    carry_distributions: Decimal
    current_carry_in_escrow: Decimal
    unallocated_carry_value: Decimal
    distributions: List[DistributionModel]

    @classmethod
    def from_queryset(cls, distributions):
        distributions_count = distributions.count()
        carry_distributions = sum(distribution.amount for distribution in distributions)
        current_carry_in_escrow = sum(distribution.escrow for distribution in distributions)

        unallocated_carry_value = 0
        for distribution in distributions:
            if not distribution.is_manual:
                participant_distributions = distribution.distribution_participants.all()
                total_points = 0
                for participant_distribution in participant_distributions:
                    total_points = total_points + participant_distribution.points
                un_allocated_points = 100 - total_points
                un_allocated_carry = (Decimal(str(un_allocated_points)) * distribution.amount) / Decimal(100)
                unallocated_carry_value = unallocated_carry_value + un_allocated_carry

        return cls.model_validate({
            'distributions_count': distributions_count,
            'carry_distributions': carry_distributions,
            'current_carry_in_escrow': current_carry_in_escrow,
            'unallocated_carry_value': unallocated_carry_value,
            'distributions': [{
                "id": distribution.id,
                "amount": distribution.amount,
                "escrow": distribution.escrow,
                "date": distribution.date,
                "source": distribution.source_name()
            } for distribution in distributions]
        })

    @classmethod
    def from_queryset_investor(cls, distributions):
        distributions_count = distributions.count()
        carry_distributions = sum(distribution.amount for distribution in distributions)
        current_carry_in_escrow = sum(distribution.escrow for distribution in distributions)
        unallocated_carry_value = carry_distributions - current_carry_in_escrow
        return cls.model_validate({
            'distributions_count': distributions_count,
            'carry_distributions': carry_distributions,
            'current_carry_in_escrow': current_carry_in_escrow,
            'unallocated_carry_value': unallocated_carry_value,
            'distributions': [{
                "id": distribution.id,
                "amount": distribution.amount,
                "escrow": distribution.escrow,
                "date": distribution.date,
                "source": distribution.source_name()
            } for distribution in distributions]
        })

    @classmethod
    def from_response(cls, response):
        content = response.json()
        return cls.model_validate(content)
