import re
from collections import defaultdict
from datetime import datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal, ROUND_DOWN
from operator import add, sub, mul, truediv

from django.db.models import Prefetch, Subquery, Sum, Count, OuterRef, Max, F
from pydantic import BaseModel
from rest_framework.generics import get_object_or_404

from api.carry_pools.constants import (DURATION_MAPPING,
                                       DURATION_MAX_DAYS_MAPPING)
from api.carry_pools.models import (AllocationAction, CarryPool, DealCarryPlan,
                                    FundCarryPlan, TimeBasedVestingSchedule,
                                    VestingSchedule, CarryPlan, ParticipantCarryDocument, CarryDocument,
                                    CarryParticipant, FundRealization, DealRealization,
                                    Realization, Distribution, ParticipantDistribution, Deal, CarryPlanMilestone,
                                    CarryParticipantUser, InvestmentTranche, CarryGpCommitment, CarrySubPool)
from api.carry_pools.services.calculate_vested_points import CalculateVestedPointsService
from api.funds.models import Fund
from api.libs.utils.nanoid_generator import generate_nanoid


def operate_on_numbers(operator, *numbers):
    # Check if numbers list is empty
    if not numbers:
        return 0

    # Define mapping of operator symbols to actual functions
    operations = {
        '+': add,
        '-': sub,
        '*': mul,
        '/': truediv
    }

    # Ensure that the provided operator is valid
    if operator not in operations:
        raise ValueError(f"Unsupported operator: {operator}")

    # Convert the first number to Decimal (from string)
    result = Decimal(str(numbers[0]))

    # Apply the operation to all numbers in sequence
    for num in numbers[1:]:
        decimal_num = Decimal(str(num))
        result = operations[operator](result, decimal_num)

    # Convert result back to float before returning
    return result


def find_pool_by_external_id(pool_data_list, external_id):
    for pool_data in pool_data_list:
        if pool_data['external_id'] == external_id:
            return pool_data

        result = find_pool_by_external_id(pool_data.get('pools', []), external_id)
        if result:
            return result

    return None


def get_carry_pool(base_pool_id, company_id):
    return CarryPool.objects.filter(
        external_id=base_pool_id,
        company_id=company_id
    ).latest(
        'created_at'
    )


def get_carry_pool_of_carry_plan(carry_plan_id, company_id):
    return CarryPool.objects.filter(
        carry_plan__id=carry_plan_id,
        company_id=company_id
    ).latest(
        'created_at'
    )


def get_fund_carry_plan(fund_external_id):
    return FundCarryPlan.objects.filter(
        fund__external_id=fund_external_id
    ).latest(
        'created_at'
    )


def get_fund_carry_plan_of_carry_plan(carry_plan_id):
    fund_carry_plan = FundCarryPlan.objects.filter(
        carry_plan_id=carry_plan_id
    )
    if fund_carry_plan:
        return fund_carry_plan.latest(
            'created_at'
        )

    return None


def get_deal_carry_plan_of_carry_plan(carry_plan_id):
    deal_carry_plan = DealCarryPlan.objects.filter(
        carry_plan_id=carry_plan_id
    )
    if deal_carry_plan:
        return deal_carry_plan.latest(
            'created_at'
        )

    return None


def calculate_per_period_percentage(total_percentage, period_count):
    """
    Calculate the per-period percentage and the percentage for the last period.
    e.g. given total_percentage=75 and period_count=36, per-period percentage would be 75/36=2.0833
    But 2.0833 * 36 = 74.9988 . This difference of 75 - 74.9988 = 0.0012 is added in the last period,
    so that the sum of all per-period percentages is equal to total_percentage

    Args:
        total_percentage (float or Decimal): The total percentage to be distributed.
        period_count (int): The total number of periods.

    Returns:
        tuple: A tuple containing the per-period percentage and the percentage for the last period.
    """
    total_percentage_decimal = Decimal(total_percentage)
    period_count__decimal = Decimal(period_count)

    per_period_percentage = total_percentage_decimal / period_count__decimal
    per_period_percentage = per_period_percentage.quantize(Decimal('0.0000'), rounding=ROUND_HALF_UP)

    percentage_for_last_period = total_percentage_decimal - (per_period_percentage * (period_count__decimal - 1))
    percentage_for_last_period = percentage_for_last_period.quantize(Decimal('0.0000'), rounding=ROUND_HALF_UP)

    return per_period_percentage, percentage_for_last_period


def create_periodic_time_vesting_schedule(vesting_schedule, time_vesting_data, sequence):
    period_count = time_vesting_data['period_count']

    per_period_percentage, percentage_for_last_period = calculate_per_period_percentage(
        total_percentage=time_vesting_data['period_vesting_percentage'],
        period_count=period_count
    )
    bulk_create_data = []

    for count in range(1, period_count + 1):
        period_vesting_percentage = percentage_for_last_period if count == period_count else per_period_percentage
        data = {
            'vesting_schedule': vesting_schedule,
            'period_duration': time_vesting_data['period_duration'],
            'period_vesting_percentage': period_vesting_percentage,
            'period_vesting_percentage_numerator': time_vesting_data['period_vesting_percentage'],
            'period_vesting_percentage_denominator': period_count,
            'sequence': sequence
        }
        sequence += 1
        bulk_create_data.append(data)

    TimeBasedVestingSchedule.objects.bulk_create([TimeBasedVestingSchedule(**data) for data in bulk_create_data])
    return sequence


def floor_round(number, decimal_places=4):
    """
    Rounds a floating-point number down (flooring) to a specified number of decimal places.

    Args:
        number (float): The number to be rounded.
        decimal_places (int, optional): The number of decimal places to round to (default is 4).

    Returns:
        float: The rounded number.
    """
    factor = 10 ** decimal_places
    rounded_number = int(number * factor) / factor
    return rounded_number


def deep_copy_allocations(source_carry_plan, destination_carry_plan):
    """
    Deep copy allocations from a source carry plan to a destination carry plan and return the copied allocations.

    Args:
        source_carry_plan (CarryPlan): The source carry plan from which allocations will be copied.
        destination_carry_plan (CarryPlan): The destination carry plan to which allocations will be copied.

    Returns:
        list: A list of dictionaries containing the copied allocations.
    """
    from api.carry_pools.serializers import (AllocationActionSerializer,
                                             AllocationSerializer)

    source_carry_pool = get_carry_pool_of_carry_plan(source_carry_plan.id, source_carry_plan.company.id)
    destination_carry_pool = get_carry_pool_of_carry_plan(destination_carry_plan.id, source_carry_pool.company.id)

    copied_allocations = []

    for source_allocation in source_carry_pool.allocations:
        carry_participant = get_object_or_404(CarryParticipant, id=source_allocation['carry_participant_id'])
        vesting_schedule = get_object_or_404(VestingSchedule, id=source_allocation['vesting_schedule'])

        allocation_id = generate_nanoid()

        allocation_action_data = {
            'bps': Decimal(str(source_allocation['bps'])),
            'carry_participant': carry_participant.id,
            'grant_date': datetime.now(),
            'effective_date': None,
            'base_pool_id': destination_carry_pool.external_id,
            'parent_pool_id': destination_carry_pool.external_id,
            'vesting_schedule': vesting_schedule.id,
            'type': AllocationAction.Type.CREATE.value,
            'company': source_carry_pool.company.id,
            'allocation_id': allocation_id
        }
        serializer = AllocationActionSerializer(data=allocation_action_data)
        allocation_action = serializer.save() if serializer.is_valid(raise_exception=True) else None

        allocation_data = {
            'allocation_action_id': allocation_action.id,
            'carry_participant_id': carry_participant.id,
            'allocation_id': allocation_id,
            'vesting_schedule': vesting_schedule.id,
            'bps': source_allocation['bps'],
            'initial_bps': source_allocation['bps'],
            'grant_date': allocation_action.grant_date.strftime("%Y-%m-%d") if allocation_action.grant_date else None,
            'carry_plan_id': destination_carry_plan.id,
            'vesting_start_date': source_allocation.get('vesting_start_date')
        }
        copied_allocations.append(allocation_data)

    serializer = AllocationSerializer(data=copied_allocations, many=True)

    if serializer.is_valid(raise_exception=True):
        return serializer.validated_data

    return []


def get_allocation_from_pool(base_pool_id, parent_pool_id, allocation_id, company_id, carry_pool=None):
    """
    Retrieve an allocation from a carry pool based on the allocation action ID.

    Args:
        base_pool_id (str): The external ID of the base carry pool.
        parent_pool_id (str): The external ID of the parent pool (if applicable).
        allocation_id (int): The allocation ID to search for.
        company_id (int): The ID of the company associated with the pools.
        carry_pool (class): Carry pool object provided we already have it

    Returns:
        dict or None: The allocation if found, or None if no matching allocation is found.

    Allocation Structure:
    {
        'allocation_id': str (required),
        'allocation_action_id': int (required),
        'user_id': int (required),
        'bps': float (required),
        'forfeited_bps': float (default 0),
        'vested_bps': float (default 0),
        'vesting_schedule': int (required),
        'grant_date': str (optional, allow_null=True),
        'effective_date': Date (optional)
    }
    """
    if not carry_pool:
        carry_pool = get_carry_pool(base_pool_id, company_id)

    if base_pool_id == parent_pool_id:
        allocation = next(
            (allocation for allocation in carry_pool.allocations
             if allocation.get('allocation_id') == allocation_id), None)
    else:
        parent_pool = find_pool_by_external_id(carry_pool.pools, parent_pool_id)
        allocation = next(
            (allocation for allocation in parent_pool('allocations', [])
             if allocation.get('allocation_id') == allocation_id), None)

    return allocation


def set_allocation_in_pool(base_pool_id, parent_pool_id, allocation_id, company_id, updated_allocation):
    """
    Update an allocation within a carry pool based on the allocation action ID.

    Args:
        base_pool_id (str): The external ID of the base carry pool.
        parent_pool_id (str): The external ID of the parent pool (if applicable).
        allocation_id (int): The allocation ID to search for.
        company_id (int): The ID of the company associated with the pools.
        updated_allocation (dict): The updated allocation data.

    Returns:
        bool: True if the allocation was updated, False otherwise.
    """
    from api.carry_pools.serializers import AllocationSerializer

    carry_pool = get_carry_pool(base_pool_id, company_id)

    if base_pool_id == parent_pool_id:
        allocations = carry_pool.allocations
    else:
        parent_pool = find_pool_by_external_id(carry_pool.pools, parent_pool_id)
        allocations = parent_pool('allocations', [])

    for allocation in allocations:
        if allocation.get('allocation_id') == allocation_id:
            allocation.update(updated_allocation)

            allocation_serializer = AllocationSerializer(data=allocation)
            if allocation_serializer.is_valid(raise_exception=True):
                carry_pool.save()
                return True

    return False


def get_duration_in_years_and_months(duration):
    years, days = divmod(duration.days, 365)
    months = days // 30

    if years > 0:
        if months > 0:
            return f"{years} year{'s' if years > 1 else ''} and {months} month{'s' if months > 1 else ''}"
        else:
            return f"{years} year{'s' if years > 1 else ''}"
    elif months > 0:
        return f"{months} month{'s' if months > 1 else ''}"
    else:
        return "0 months"


def get_duration_type(duration):
    days = duration.days

    for key, max_value in DURATION_MAX_DAYS_MAPPING.items():
        if days <= max_value:
            return key, DURATION_MAPPING[key]

    return 'unknown', 'unknown'


def pluralize_if_needed(value, word):
    if value > 1:
        return f"{word}s"
    else:
        return f"{word}"


# for consistency, I'll keep this here, but should be refactored this into a more OOP way
def carry_fund_qs(company):
    last_carry_pool = CarryPool.objects.last_carry_pool_qs()
    carry_plan_annotate = CarryPlan.objects.annotate(last_carry_pool_bps=Subquery(last_carry_pool.values('bps')),
                                                     last_carry_pool_allocations=Subquery(
                                                         last_carry_pool.values('allocations')))
    carry_plan_prefetch = Prefetch('carry_plan', queryset=carry_plan_annotate)

    participant_distributions_prefetch = Prefetch(
        'distribution_participants',
        queryset=ParticipantDistribution.objects.select_related('distribution', 'participant')
    )

    fund_distributions_prefetch = Prefetch(
        'fund_realizations__realization__distribution_set',
        queryset=Distribution.objects.prefetch_related(participant_distributions_prefetch)
    )

    deal_distributions_prefetch = Prefetch(
        'realizations__realization__distribution_set',
        queryset=Distribution.objects.prefetch_related(participant_distributions_prefetch)
    )

    deal_carry_plans_prefetch = Prefetch(
        'fund_deals',
        queryset=Deal.objects.prefetch_related(deal_distributions_prefetch)
    )

    fund_carry_plans_prefetch = Prefetch(
        'fund_carry_plans',
        queryset=FundCarryPlan.objects.prefetch_related(
            carry_plan_prefetch,
            fund_distributions_prefetch
        )
    )

    qs = Fund.objects.filter(company=company) \
        .prefetch_related(fund_carry_plans_prefetch, deal_carry_plans_prefetch) \
        .annotate(
        deals_fair_market_value=Sum('fund_deals__fair_market_value'),
        deals_estimated_value=Sum('fund_deals__estimated_value'),
        deals_investment_estimated_value=Sum('fund_deals__deal_investment_tranches__estimated_value'),
        deals_investment_fmv=Sum('fund_deals__deal_investment_tranches__fair_market_value'),
        fund_deals_count=Count('fund_deals'),
        deal_investments_count=Count('fund_deals__deal_investment_tranches'),
        deals_latest_estimated_date=Max('fund_deals__estimated_value_date'),
        deals_latest_fair_value_date=Max('fund_deals__fair_market_value_date'),
    )
    return qs


def annotate_deal_qs(qs):
    return qs.annotate(
        investment_fair_market_value=Sum('deal_investment_tranches__fair_market_value'),
        investment_estimated_value=Sum('deal_investment_tranches__estimated_value'),
        deal_investments_count=Count('deal_investment_tranches'),
        investment_latest_estimated_date=Max('deal_investment_tranches__estimated_value_date'),
        investment_latest_fair_value_date=Max('deal_investment_tranches__fair_market_value_date')
    )


def get_forfeit_dilute_transferred_adjusted_allocations(allocations, calculation_date):
    allocation_ids = [allocation['allocation_id'] for allocation in allocations]

    # include forfeited bps (we need it separately for FE)
    forfeited_actions = AllocationAction.objects.filter(
        allocation_id__in=allocation_ids,
        type=AllocationAction.Type.FORFEIT.value,
        grant_date__date__lte=calculation_date
    ).values('allocation_id').annotate(forfeited_bps=Sum('bps'))

    forfeited_bps_map = {action['allocation_id']: action['forfeited_bps'] or 0 for action in forfeited_actions}

    # include diluted bps (we need it separately for FE)
    dilute_actions = AllocationAction.objects.filter(
        allocation_id__in=allocation_ids,
        type=AllocationAction.Type.DILUTE.value,
        grant_date__date__lte=calculation_date
    ).values('allocation_id').annotate(diluted_bps=Sum('bps'))
    diluted_bps_map = {action['allocation_id']: action['diluted_bps'] or 0 for action in dilute_actions}

    transfer_from_actions = AllocationAction.objects.filter(
        allocation_id__in=allocation_ids,
        type=AllocationAction.Type.TRANSFER_FROM.value,
        grant_date__date__lte=calculation_date
    ).values('allocation_id').annotate(transferred_bps=Sum('bps'))
    transferred_from_bps_map = {action['allocation_id']: action['transferred_bps'] or 0 for action in transfer_from_actions}

    transfer_to_actions = AllocationAction.objects.filter(
        allocation_id__in=allocation_ids,
        type=AllocationAction.Type.TRANSFER_TO.value,
        grant_date__date__lte=calculation_date
    ).values('allocation_id').annotate(transferred_to_bps=Sum('bps'))
    transferred_to_bps_map = {action['allocation_id']: action['transferred_to_bps'] or 0 for action in transfer_to_actions}

    for allocation in allocations:
        allocation_id = allocation['allocation_id']
        forfeited_bps = forfeited_bps_map.get(allocation_id, 0)
        diluted_bps = diluted_bps_map.get(allocation_id, 0)
        transferred_from_bps = transferred_from_bps_map.get(allocation_id, 0)
        transferred_to_bps = transferred_to_bps_map.get(allocation_id, 0)
        allocation['forfeited_bps'] = forfeited_bps
        allocation['diluted_bps'] = diluted_bps
        allocation['transferred_from_bps'] = transferred_from_bps
        allocation['transferred_to_bps'] = transferred_to_bps
        forfeited_bps_decimal = Decimal(str(forfeited_bps))
        diluted_bps_decimal = Decimal(str(diluted_bps))
        transferred_from_bps_decimal = Decimal(str(transferred_from_bps))
        transferred_to_bps_decimal = Decimal(str(transferred_to_bps))
        remaining_bps_decimal = Decimal(str(allocation['bps'])) - (
                forfeited_bps_decimal + diluted_bps_decimal + transferred_from_bps_decimal) + transferred_to_bps_decimal
        allocation['bps'] = remaining_bps_decimal


def get_allocated_points(allocations, calculation_date):
    allocation_ids = [allocation['allocation_id'] for allocation in allocations]

    allocation_actions = AllocationAction.objects.filter(
        allocation_id__in=allocation_ids,
        type__in=[AllocationAction.Type.FORFEIT.value, AllocationAction.Type.DILUTE.value],
        grant_date__date__lte=calculation_date
    ).values('allocation_id').annotate(subtracted_bps=Sum('bps'))

    subtracted_bps_bps_dict = {action['allocation_id']: action['subtracted_bps'] for action in allocation_actions}

    sum_bps = Decimal(0)
    for allocation in allocations:
        subtracted_bps = subtracted_bps_bps_dict.get(allocation['allocation_id'], 0)
        bps = Decimal(str(allocation['bps'])) - Decimal(str(subtracted_bps))
        sum_bps += bps

    return float(sum_bps)


def get_allocated_points_after_adjusting_allocation_actions(allocations, allocation_actions_summary):
    sum_bps = Decimal(0)
    for allocation in allocations:
        subtracted_bps = allocation_actions_summary['subtraction'].get(allocation['allocation_id'], 0)
        bps = Decimal(str(allocation['bps'])) - Decimal(str(subtracted_bps))
        added_bps = allocation_actions_summary['addition'].get(allocation['allocation_id'], 0)
        bps = bps + Decimal(str(added_bps))
        sum_bps += bps
    return sum_bps


def update_vested_points(allocations, calculation_date):
    allocation_ids = [allocation['allocation_id'] for allocation in allocations]
    allocation_actions = AllocationAction.objects.filter(
        allocation_id__in=allocation_ids,
        type=AllocationAction.Type.CREATE.value
    ).values('id', 'base_pool_id', 'company_id', 'allocation_id')
    allocation_action_dict = {action['allocation_id']: action for action in allocation_actions}

    for allocation in allocations:
        if allocation['bps'] == 0:
            continue

        if not allocation_action_dict.get(allocation['allocation_id']):
            continue

        if not allocation.get('initial_bps'):
            allocation['initial_bps'] = allocation['bps']

        result = CalculateVestedPointsService({
                'vesting_calculation_date': calculation_date,
                'allocation': allocation
            }).calculate_vested_points()

        allocation['vested_bps'] = result['vested_points']
        allocation['vested_percentage_display'] = result['vested_percentage']


def calculate_allocations_by_date(allocations, calculation_date):
    """
    We will use this method everytime we want allocations with updated
    values(bps, vested bps, forfeited etc.) for a given calculation date
    """
    allocations = allocations.copy()
    get_forfeit_dilute_transferred_adjusted_allocations(allocations, calculation_date)
    update_vested_points(allocations, calculation_date)
    return allocations


def calculate_allocations_by_date_firmview(carry_plan_allocations_map, calculation_date, vesting):
    all_allocations = []
    for _, allocations in carry_plan_allocations_map.items():
        for allocation in allocations:
            all_allocations.append(allocation)

    get_forfeit_dilute_transferred_adjusted_allocations(all_allocations, calculation_date)
    if vesting:
        update_vested_points(all_allocations, calculation_date)
    return all_allocations


def associate_with_carry_document(carry_plan, carry_participant, company, for_document_type, allocation_id,
                                  sub_pool_id=None):
    """
    Method to associate a participant with a carry template document for given document type
    """
    if not carry_plan:
        return

    carry_documents = carry_plan.associated_carry_documents.all()

    if sub_pool_id:
        sub_pool = CarrySubPool.objects.get(id=sub_pool_id)
        if sub_pool.subpool_carry_documents.exists():
            carry_documents = sub_pool.subpool_carry_documents.all()

    for document in carry_documents:
        carry_users = carry_participant.carry_participant_user.all()
        for carry_user in carry_users:
            if not document.document_type == for_document_type:
                continue
            if not document.document_status:
                continue
            if document.document_type == CarryDocument.DocumentType.CARRY_AWARD.value:
                if not document.show_everytime:
                    record = ParticipantCarryDocument.objects.filter(
                        user__id=carry_user.user.id,
                        carry_document=document,
                        company=company
                    ).exists()
                    if record:
                        continue

            carry_participant_data = {
                'user_id': carry_user.user.id,
                'carry_document': document,
                'carry_plan_id': carry_plan.id,
                'company': company,
                'allocation_id': allocation_id
            }
            ParticipantCarryDocument.objects.create(**carry_participant_data)


def get_salary_from_user_id(user_id: int):
    is_odd = bool(user_id % 2)
    multiplier = 500 if is_odd else 700
    return 150000 + multiplier * (user_id % 10 + user_id)


def get_bonus_from_user_id(user_id: int):
    is_odd = bool(user_id % 2)
    multiplier = 600 if is_odd else 800
    return 200000 + multiplier * (user_id % 10 + user_id)


class ForecastedValues(BaseModel):
    total_vested_forecast: float
    total_unvested_forecast: float
    total_vested_fair_market_value_forecast: float
    total_unvested_fair_market_value_forecast: float


def calculate_forecasted_value(carry_participant_ids, company, calculation_date=None, carry_pool_status=None):
    if not calculation_date:
        calculation_date = datetime.now().strftime("%Y-%m-%d")
    from api.carry_pools.services.user_carry_allocation_service import UserCarryAllocationService
    user_carry_allocation_service = UserCarryAllocationService(
        carry_participant_ids=carry_participant_ids,
        company_id=company,
        calculation_date=calculation_date,
        carry_pool_status=carry_pool_status
    )
    allocations_response = user_carry_allocation_service.get_user_data()
    total_vested_forecast = 0
    total_forecast = 0
    total_fair_market_forecast = 0
    total_vested_fair_market_forecast = 0
    for allocation in allocations_response:
        total_forecast = total_forecast + Decimal(allocation.get('participant_estimated_carry', 0))
        total_fair_market_forecast = total_fair_market_forecast + Decimal(allocation.get('participant_fair_market_value', 0))
        vested_carry_value = Decimal(allocation.get('participant_estimated_carry_vested', 0))
        vested_carry_fair_market_value = Decimal(allocation.get('participant_fair_market_value_vested', 0))
        total_vested_forecast = total_vested_forecast + vested_carry_value
        total_vested_fair_market_forecast = total_vested_fair_market_forecast + vested_carry_fair_market_value

    total_un_vested_forecast = operate_on_numbers('-', total_forecast, total_vested_forecast)
    total_un_vested_fair_market_forecast = operate_on_numbers(
        '-',
        total_fair_market_forecast,
        total_vested_fair_market_forecast
    )

    return ForecastedValues(
        total_vested_forecast=total_vested_forecast,
        total_unvested_forecast=total_un_vested_forecast,
        total_vested_fair_market_value_forecast=total_vested_fair_market_forecast,
        total_unvested_fair_market_value_forecast=total_un_vested_fair_market_forecast,
    )


def get_total_distributions_by_allocation(company, carry_participant_ids):
    distribution_totals_by_allocation = dict()
    participant_distributions = ParticipantDistribution.objects.filter(
        company=company,
        participant_id__in=carry_participant_ids
    ).all()
    for participant_distribution in participant_distributions:
        if participant_distribution.allocation_id not in distribution_totals_by_allocation:
            distribution_totals_by_allocation[participant_distribution.allocation_id] = participant_distribution.amount
        else:
            distribution_totals_by_allocation[participant_distribution.allocation_id] += participant_distribution.amount

    return distribution_totals_by_allocation


def add_user_info_in_allocations(allocations, company):
    carry_participant_ids = [allocation['carry_participant_id'] for allocation in allocations]
    users = CarryParticipant.objects.filter(pk__in=carry_participant_ids)
    users_full_names = {user.pk: user.get_full_name() for user in users}
    distributions_by_allocation = get_total_distributions_by_allocation(company, carry_participant_ids)
    for allocation in allocations:
        allocation['full_name'] = users_full_names.get(allocation['carry_participant_id'])
        allocation['distributions'] = distributions_by_allocation.get(allocation['allocation_id'], 0)
        allocation['user_id'] = None
        carry_participant_user = CarryParticipantUser.objects.filter(
            carry_participant_id=allocation['carry_participant_id']
        ).first()
        if carry_participant_user:
            allocation['user_id'] = carry_participant_user.user.id
            allocation['user_name'] = carry_participant_user.user.get_full_name()


def add_carry_participant_details(data, company, calculation_date):
    """
    Use this method to include any additional data for a user
    that affects performance of serializer
    """
    carry_participant_id = data['id']

    forecast_values = calculate_forecasted_value(
        [carry_participant_id],
        company,
        calculation_date
    )
    vested_forecast, un_vested_forecast = forecast_values.total_vested_forecast, forecast_values.total_unvested_forecast
    data['vested_forecasted_value'] = vested_forecast
    data['unvested_forecasted_value'] = un_vested_forecast


def add_carry_participant_details_for_ids(data, company, calculation_date, carry_participant_ids):
    """
    Use this method to include any additional data for a user
    that affects performance of serializer given a set of carry participant ids
    """

    forecast_values = calculate_forecasted_value(
        carry_participant_ids,
        company,
        calculation_date
    )
    vested_forecast, un_vested_forecast = forecast_values.total_vested_forecast, forecast_values.total_unvested_forecast
    data['vested_forecasted_value'] = vested_forecast
    data['unvested_forecasted_value'] = un_vested_forecast


def get_hire_date_from_user_id(user_id: int, date_joined):
    is_odd = bool(user_id % 2)
    year_diff = 2 if is_odd else 1
    hire_date = date_joined - timedelta(days=(year_diff * 365) + user_id)
    return hire_date


def get_all_latest_published_pools_for_company(company_ids):
    latest_carry_pool_subquery = CarryPool.objects.filter(
        company_id__in=company_ids,
        status=CarryPool.Status.PUBLISHED.value,
        external_id=OuterRef('external_id')
    ).order_by('-created_at').values('id')[:1]
    last_carry_pools = CarryPool.objects.filter(
        company_id__in=company_ids,
        id=Subquery(latest_carry_pool_subquery)
    ).order_by('external_id', '-created_at').distinct('external_id')
    return last_carry_pools


# for consistency, I'll keep this here, but should be refactored this into a more OOP way
def distribution_qs():
    fund_realizations = FundRealization.objects.select_related('fund_carry_plan__fund')
    deal_realizations = DealRealization.objects.select_related('deal_carry_plan__deal')
    realizations = Realization.objects.prefetch_related(
        Prefetch('fund_realizations', queryset=fund_realizations, to_attr='fund_realizations'),
        Prefetch('deal_realizations', queryset=deal_realizations, to_attr='deal_realizations')
    )
    qs = Distribution.objects.select_related('realization').prefetch_related('distribution_participants').prefetch_related(
        Prefetch('realization', queryset=realizations)
    ).order_by('-id')
    return qs


def sum_allocations_by_participant(allocations, fund_carry_plan: FundCarryPlan, pool_bps=None):
    cumulative_results = defaultdict(lambda: {'bps': Decimal(0), 'vested_bps': Decimal(0),
                                              'distributions': Decimal(0), 'full_name': '',
                                              'un_vested_bps': Decimal(0), 'user_id': '',
                                              'user_name': '', 'estimated_value': Decimal(0),
                                              'fair_market_value': Decimal(0),
                                              })

    fund = fund_carry_plan.fund
    carry_participant_ids= [item['carry_participant_id'] for item in allocations]
    gp_commits = CarryGpCommitment.objects.filter(
        carry_participant_id__in=carry_participant_ids,
        source_external_id=fund_carry_plan.fund.external_id,
        source_type=CarryGpCommitment.SourceType.FUND.value
    ).values(
        'carry_participant_id',
    ).annotate(
        total_capital_commit_sum=Sum('total_capital_commit'),
        cashless_commit_sum=Sum('cashless_commit'),
        management_fee_offset_sum=Sum('management_fee_offset'),
        salary_reduction_sum=Sum('salary_reduction')
    )
    gp_commits_dict = {
        item['carry_participant_id']: 
            (item['total_capital_commit_sum']     or Decimal('0')) +
            (item['cashless_commit_sum']          or Decimal('0')) +
            (item['management_fee_offset_sum']    or Decimal('0')) +
            (item['salary_reduction_sum']         or Decimal('0'))
        for item in gp_commits
    }

    for allocation in allocations:
        participant_id = allocation['carry_participant_id']
        cumulative_results[participant_id]['estimated_value'] += Decimal(str(allocation['estimated_value']))
        cumulative_results[participant_id]['fair_market_value'] += Decimal(str(allocation['fair_market_value']))
        cumulative_results[participant_id]['bps'] += Decimal(str(allocation['bps']))
        cumulative_results[participant_id]['vested_bps'] += Decimal(str(allocation['vested_bps']))
        cumulative_results[participant_id]['un_vested_bps'] = (cumulative_results[participant_id]['bps'] -
                                                               cumulative_results[participant_id]['vested_bps'])
        cumulative_results[participant_id]['distributions'] += Decimal(str(allocation['distributions']))
        cumulative_results[participant_id]['full_name'] = allocation['full_name']
        cumulative_results[participant_id]['user_id'] = allocation['user_id']
        cumulative_results[participant_id]['user_name'] = allocation['user_name']

    final_results = [
        {
            'full_name': values['full_name'],
            'user_id': values['user_id'],
            'user_name': values['user_name'],
            'carry_participant_id': participant_id,
            'bps': str(values['bps']),
            'vested_bps': str(values['vested_bps']),
            'vested_percentage': str(calculate_vested_percentage(values)),
            'un_vested_bps': str(values['un_vested_bps']),
            'distributions': float(values['distributions']),
            'estimated_value': str(values['estimated_value']),
            'estimated_value_date': fund.estimated_value_date if fund else None,
            'fair_market_value': str(values['fair_market_value']),
            'fair_market_value_date': fund.fair_market_value_date if fund else None,
            'total_gp_commitment': gp_commits_dict.get(participant_id, 0)
        }
        for participant_id, values in cumulative_results.items()
    ]
    return final_results


def get_deal_distributions_for_fund(fund):
    total = 0
    fund_deals = fund.fund_deals.all()
    for fund_deal in fund_deals:
        for realization in fund_deal.realizations.all():
            realization = realization.realization
            for distribution in realization.distribution_set.all():
                total += distribution.amount
    return total


def get_total_distributions_fund(fund):
    total = 0
    fund_carry_plans = fund.fund_carry_plans.all()
    for fund_carry_plan in fund_carry_plans:
        for realization in fund_carry_plan.fund_realizations.all():
            realization = realization.realization
            for distribution in realization.distribution_set.all():
                total += distribution.amount
    total += get_deal_distributions_for_fund(fund)
    return total


def update_custom_schedules_dict_with_milestone_data(carry_plan_id, custom_display):
    custom_displayed_vesting_schedules = custom_display.get('sequenced_vesting_schedules', [])
    for custom_displayed_milestone_schedule in custom_displayed_vesting_schedules:
        milestone_id = custom_displayed_milestone_schedule.get('milestone_id', None)
        if milestone_id:
            carry_milestone = CarryPlanMilestone.objects.filter(
                carry_plan=carry_plan_id,
                milestone_id=milestone_id
            ).first()
            if carry_milestone:
                custom_displayed_milestone_schedule['date'] = carry_milestone.date


def calculate_vested_percentage(allocation):
    if allocation.get('bps'):
        percentage = Decimal(str(allocation['vested_bps'])) / Decimal(str(allocation['bps']))
        percentage = percentage * Decimal('100')
        return percentage.quantize(Decimal('0.0000'), rounding=ROUND_HALF_UP)
    return 0


def prepare_estimated_carry_value_for_users(users, company_id, calculation_date):
    """
    Returns a dict of estimated carry values by carry participant ID for given company
    Use this method to fetch estimated values by best possible optimization

    Response:
        {
            user_id:
                {
                  carry_participant_id: estimated carry value
                }
        }
    """
    from api.carry_pools.services.calculate_estimated_values import EstimatedValuesService

    user_participants = CarryParticipantUser.objects.filter(user__in=users)
    carry_participant_ids = [user_participant.carry_participant_id for user_participant in user_participants]

    participant_estimated_values = {}
    allocations = []
    data = {user.id: {} for user in users}

    allocation_actions = AllocationAction.objects.filter(
        carry_participant_id__in=carry_participant_ids,
        type=AllocationAction.Type.CREATE.value,
        company_id=company_id
    ).values('id', 'base_pool_id', 'allocation_id', 'carry_participant_id').distinct()

    base_pool_ids = [action['base_pool_id'] for action in allocation_actions]
    latest_pools = (
        CarryPool.objects.filter(
            external_id__in=base_pool_ids,
            company_id=company_id
        )
        .values('external_id')
        .annotate(latest_created_at=Max('created_at'))
    )
    latest_carry_pools = CarryPool.objects.filter(
        external_id__in=base_pool_ids,
        company_id=company_id,
        created_at__in=[pool['latest_created_at'] for pool in latest_pools]
    ).select_related('carry_plan')
    carry_pool_dict = {
        pool.external_id: pool
        for pool in latest_carry_pools
    }

    carry_plan_ids = []
    for allocation_action in allocation_actions:
        carry_pool = carry_pool_dict[allocation_action['base_pool_id']]
        carry_plan_ids.append(carry_pool.carry_plan.id)
        carry_pool_allocations = carry_pool.allocations
        for allocation in carry_pool_allocations:
            if allocation['allocation_id'] == allocation_action['allocation_id']:
                allocation['carry_pool'] = carry_pool
                allocations.append(allocation)

    get_forfeit_dilute_transferred_adjusted_allocations(allocations, calculation_date)
    bulk_estimated_values = CarryPlan.get_bulk_carry_estimated_values(carry_plan_ids)


    for allocation in allocations:
        carry_pool = allocation['carry_pool']
        carry_plan = carry_pool.carry_plan
        carry_plan_estimated_value = bulk_estimated_values.get(carry_plan.id, 0)
        value_adjustments = carry_plan.get_adjustments_by_allocations(
            calculation_date=calculation_date
        )
        estimated_values = EstimatedValuesService(
            {
                'allocation': allocation,
                'carry_plan': carry_plan,
                'carry_pool': carry_pool,
                'carry_plan_estimated_value': carry_plan_estimated_value,
                'calculation_date': calculation_date,
                'value_adjustments': value_adjustments,
            }
        ).calculate()
        participant_estimated_carry = estimated_values['carry_estimated_value']

        if participant_estimated_values.get(allocation['carry_participant_id']):
            current_value = participant_estimated_values.get(allocation['carry_participant_id'])
            sum = current_value + participant_estimated_carry
            participant_estimated_values[allocation['carry_participant_id']] = sum
        else:
            participant_estimated_values[allocation['carry_participant_id']] = participant_estimated_carry

    for participant in user_participants:
        data[participant.user_id][participant.carry_participant_id] = participant_estimated_values.get(
            participant.carry_participant_id, Decimal(0))

    return data


def get_allocated_unallocated_point_sub_pool(sub_pool, calculation_date):
    carry_plan = sub_pool.carry_plan
    carry_pool = get_carry_pool_of_carry_plan(
        carry_plan.id,
        company_id=carry_plan.company_id
    )
    allocated_points = 0
    allocations = carry_pool.allocations

    get_forfeit_dilute_transferred_adjusted_allocations(allocations, calculation_date)
    for allocation in allocations:
        if allocation.get('sub_pool_id') == sub_pool.id:
            allocated_points += Decimal(str(allocation['bps']))

    return {
        'allocated_points': allocated_points,
        'unallocated_points': Decimal(str(sub_pool.bps)) - Decimal(str(allocated_points))
    }


def name_custom_sort_key(obj, key_name='name'):
    if isinstance(obj, dict):
        name = obj.get(key_name, "").strip()
    else:
        name = obj.name.strip()
    first_char = name[0] if name else ''

    if first_char.isdigit():
        number_match = re.match(r"(\d+)", name)
        number_value = int(number_match.group(0)) if number_match else float('inf')
        return (1, number_value, name.lower())

    elif first_char.isalpha():
        return (2, name.lower())

    else:
        return (3, name.lower())



def custom_sort_list_of_dicts(list_of_dicts, key):
    return sorted(list_of_dicts, key=lambda x: name_custom_sort_key(x, key))


def get_gp_commit_source_name(source_type, external_id, company):
    model_map = {
        CarryGpCommitment.SourceType.FUND.value: Fund,
        CarryGpCommitment.SourceType.DEAL.value: Deal,
        CarryGpCommitment.SourceType.INVESTMENT_TRANCHE.value: InvestmentTranche
    }

    model = model_map.get(source_type)
    if not model:
        return ""

    source = model.objects.filter(
        company=company,
        external_id=external_id
    ).only('name').first()
    return getattr(source, 'name', "")


def format_decimal_for_docs(value):
    if value == Decimal('0'):
        return '0'
    return str(value.quantize(Decimal('0.00000001'), rounding=ROUND_DOWN))


def format_four_decimals_for_docs(value):
    if value == Decimal('0'):
        return '0'
    return str(value.quantize(Decimal('0.0001'), rounding=ROUND_DOWN))
