import copy
from decimal import Decimal, ROUND_HALF_UP

from api.carry_pools.constants import CARRY_HURDLE_FEATURE
from api.carry_pools.models import CarryHurdle, CarryPool, AllocationValueAdjustment
from api.carry_pools.utils import get_forfeit_dilute_transferred_adjusted_allocations, calculate_vested_percentage, \
    get_carry_pool_of_carry_plan


class EstimatedValuesService:

    def __init__(self, data):
        self.allocation = data.get('allocation')
        self.carry_plan = data.get('carry_plan')
        self.carry_pool = copy.deepcopy(data.get('carry_pool')) if data.get('carry_pool') else None
        self.carry_plan_estimated_value = data.get('carry_plan_estimated_value', 0)
        self.carry_plan_fair_market_value = data.get('carry_plan_fair_market_value', 0)
        self.carry_pool_status = data.get('carry_pool_status')
        self.calculation_date = data.get('calculation_date')
        self.last_carry_pool_bps = data.get('last_carry_pool_bps')
        self.latest_allocations = data.get('latest_allocations')
        self.entity_calculation = data.get('entity_calculation')

        if 'value_adjustments' in data:
            self.value_adjustments = data.get('value_adjustments')
        else:
            self.value_adjustments = self.carry_plan.get_value_adjustments(calculation_date=self.calculation_date)

        self.impacted_allocations = []
        self.current_impacted_allocation = None
        self.source_allocation = None
        self.hurdle = None
        self.post_hurdle_estimated_value = None
        self.post_hurdle_fair_market_value = None
        self.calculation_bps = None

        if not self.carry_pool:
            self.carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, company_id=self.carry_plan.company_id)
        if not self.last_carry_pool_bps:
            self.last_carry_pool_bps = self.carry_pool.bps if self.carry_pool else 0

        self.estimated_value_types = {
            CarryHurdle.AppliesToType.ECV.value: self.carry_plan_estimated_value,
            CarryHurdle.AppliesToType.FMV.value: self.carry_plan_fair_market_value
        }

    def initialize_allocations(self, allocation_ids):
        result_allocations = []
        allocations = self.latest_allocations
        if not allocations:
            carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.carry_plan.company_id)
            self.latest_allocations = allocations = carry_pool.allocations
            if self.carry_pool_status:
                carry_pool = CarryPool.objects.filter(
                    company=self.carry_plan.company,
                    external_id=self.carry_pool.external_id,
                    status=self.carry_pool_status
                )
                if carry_pool.exists():
                    self.carry_pool = carry_pool.latest('created_at')
                    self.latest_allocations = allocations = self.carry_pool.allocations
            get_forfeit_dilute_transferred_adjusted_allocations(allocations, self.calculation_date)

        for allocation in allocations:
            if allocation['allocation_id'] in allocation_ids:
                result_allocations.append(allocation)

        return result_allocations

    def get_unallocated_points(self):
        allocations = self.latest_allocations
        if not allocations:
            allocations = self.carry_pool.allocations
            if self.carry_pool_status:
                carry_pool = CarryPool.objects.filter(
                    company=self.carry_plan.company,
                    external_id=self.carry_pool.external_id,
                    status=self.carry_pool_status
                )
                if carry_pool.exists():
                    self.carry_pool = carry_pool.latest('created_at')
                    allocations = self.carry_pool.allocations
            get_forfeit_dilute_transferred_adjusted_allocations(allocations, self.calculation_date)

        total_points = Decimal(0)
        for allocation in allocations:
            total_points += Decimal(str(allocation['bps']))

        return Decimal('100') - total_points

    @staticmethod
    def calculate_value(points, total_points, estimated_value):
        if not total_points:
            return 0

        if not estimated_value:
            return 0

        return Decimal(str(estimated_value)) * Decimal(str(points)) / Decimal(str(total_points))

    def calculate_share(self, allocation_bps, expected_value_before_hurdle):
        if self.hurdle.impact_type == CarryHurdle.ImpactType.PRO_RATA.value:
            sum_of_all = sum([Decimal(str(allocation['bps'])) for allocation in self.impacted_allocations])
            share_per_alloc = (allocation_bps / sum_of_all) * expected_value_before_hurdle
            return share_per_alloc

        elif self.hurdle.impact_type == CarryHurdle.ImpactType.EVEN.value:
            num_allocations = len(self.impacted_allocations)
            share_per_alloc = expected_value_before_hurdle / (num_allocations or 1)
            return share_per_alloc

    @staticmethod
    def calculate_pro_rata_share(allocation_bps, value_to_distribute, impacted_allocations):
        sum_of_all = sum([Decimal(str(allocation['bps'])) for allocation in impacted_allocations])
        share = (allocation_bps / sum_of_all) * value_to_distribute
        return share

    def is_allocation_in_pro_hurdle_phase(self, hurdle):
        hurdle_rate = hurdle.hurdle_rate
        total_estimated = self.estimated_value_types[hurdle.applies_to]
        supercharge_end_value = hurdle.supercharge_end_value
        if supercharge_end_value and hurdle_rate < total_estimated <= supercharge_end_value:
            return True
        return False

    def get_catch_up_bps_for_current_allocation(self):
        self.impacted_allocations = self.initialize_allocations(self.hurdle.impacted_allocations_ids)
        reallocated_bps = Decimal(0)

        if not self.impacted_allocations:
            return reallocated_bps

        # get all hurdles which have same impacted allocations and are in post hurdle phase only
        hurdles_with_same_impacted_alloc_qs = CarryHurdle.objects.filter(
            carry_plan=self.carry_plan,
            impacted_allocations_ids__contains=self.hurdle.impacted_allocations_ids,
            applies_to=self.hurdle.applies_to,
            is_supercharged=True
        )
        hurdles_with_same_impacted_alloc = list(filter(
            self.is_allocation_in_pro_hurdle_phase,
            hurdles_with_same_impacted_alloc_qs
        ))

        # check if all hurdles with same impacted allocations have crossed post hurdle phase
        if hurdles_with_same_impacted_alloc_qs.count() > 0 and not hurdles_with_same_impacted_alloc:
            hurdles_with_same_impacted_alloc = list(hurdles_with_same_impacted_alloc_qs)

        hurdles_with_same_impacted_alloc_source_allocations = self.initialize_allocations(
            [hurdle.source_allocation_id for hurdle in hurdles_with_same_impacted_alloc]
        )

        impacted_allocations_sum_bps = sum([Decimal(str(allocation['bps'])) for allocation in self.impacted_allocations]
                                           )
        sum_of_hurdles_bps = sum([Decimal(str(allocation['bps'])) for allocation in
                                  hurdles_with_same_impacted_alloc_source_allocations]
                                 )
        total_estimated = self.estimated_value_types[self.hurdle.applies_to]
        pro_hurdle_phse_max_value = self.hurdle.supercharge_end_value - self.hurdle.hurdle_rate
        cp_estd_value_over_hurdle = total_estimated - self.hurdle.hurdle_rate if total_estimated else 0
        excess_value = min(cp_estd_value_over_hurdle, pro_hurdle_phse_max_value)
        pro_rata_reallocated_bps = (self.allocation['bps'] / sum_of_hurdles_bps) * impacted_allocations_sum_bps
        if total_estimated:
            reallocated_bps = (excess_value / total_estimated) * pro_rata_reallocated_bps

        return reallocated_bps

    def get_pro_rata_bps_for_current_allocation(self):
        bps = 0
        estimated_value = self.estimated_value_types[self.hurdle.applies_to]
        if estimated_value:
            excess_value = estimated_value - self.hurdle.supercharge_end_value
            bps = (excess_value / estimated_value) * self.allocation['bps']
        return bps

    def subtract_bps_from_calculated_bps(self):
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.ECV.value:
            self.allocation['ecv_bps'] = self.allocation['ecv_bps'] - self.allocation['bps']
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.FMV.value:
            self.allocation['fmv_bps'] = self.allocation['fmv_bps'] - self.allocation['bps']

    def add_catchup_bps_to_calculated_bps(self, total_catch_up_bps):
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.ECV.value:
            self.allocation['ecv_bps'] = self.allocation['ecv_bps'] + total_catch_up_bps
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.FMV.value:
            self.allocation['fmv_bps'] = self.allocation['fmv_bps'] + total_catch_up_bps

    def update_pre_hurdle_bps_for_impacted_allocation(self):
        self.subtract_bps_from_calculated_bps()

        impacted_hurdles_supercharge = CarryHurdle.objects.filter(
            carry_plan=self.carry_plan,
            impacted_allocations_ids__contains=[self.allocation['allocation_id']],
            is_supercharged=True
        )
        min_hurdle_rate = min([hurdle.hurdle_rate for hurdle in impacted_hurdles_supercharge])
        total_estimated_value = self.estimated_value_types.get(self.hurdle.applies_to)
        pro_rata_before_hurdle = self.calculate_value(
            points=self.allocation.get('bps'),
            total_points=self.last_carry_pool_bps,
            estimated_value=min_hurdle_rate
        )

        total_catch_up_bps = 0
        if total_estimated_value:
            total_catch_up_bps = (pro_rata_before_hurdle / total_estimated_value) * Decimal('100')

        self.add_catchup_bps_to_calculated_bps(total_catch_up_bps)

    def get_bps_for_post_hurdle(self):
        bps = 0
        estimated_value = self.estimated_value_types[self.hurdle.applies_to]
        if estimated_value:
            excess_value = estimated_value - self.hurdle.hurdle_rate
            bps = (excess_value / estimated_value) * self.allocation['bps']
        return bps

    def get_bps_for_post_hurdle_phase(self):
        bps = 0
        estimated_value = self.estimated_value_types[self.hurdle.applies_to]
        if estimated_value:
            excess_value = estimated_value - self.hurdle.hurdle_rate
            max_cap = self.hurdle.supercharge_end_value - self.hurdle.hurdle_rate
            excess_value = min(excess_value, max_cap)
            bps = (excess_value / estimated_value) * self.allocation['bps']
        return bps

    def update_reallocated_amount_from_current_allocation(self):
        ecv_key = 're_allocated_source_hurdle_value_to_allocations_ecv'
        fmv_key = 're_allocated_source_hurdle_value_to_allocations_fmv'

        estimated_value = self.estimated_value_types.get(self.hurdle.applies_to)
        amount = self.calculate_value(
            points=self.allocation['bps'],
            total_points=self.last_carry_pool_bps,
            estimated_value=estimated_value
        ) * -1

        if self.hurdle.applies_to == CarryHurdle.AppliesToType.ECV.value:
            self.allocation[ecv_key] = str(amount)
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.FMV.value:
            self.allocation[fmv_key] = str(amount)

    def calculate_for_current_allocation(self):
        hurdle_trigger_value = self.estimated_value_types.get(self.hurdle.applies_to)
        is_pre_hurdle = hurdle_trigger_value <= self.hurdle.hurdle_rate
        if is_pre_hurdle:
            self.update_reallocated_amount_from_current_allocation()
            self.calculation_bps = 0
            return

        # post hurdle
        if self.hurdle.is_supercharged:
            post_hurdle_bps = self.get_bps_for_post_hurdle_phase()
            catch_up_bps = self.get_catch_up_bps_for_current_allocation()
            pro_rata_phase_bps = 0
            if self.is_pro_rata_phase():
                pro_rata_phase_bps = self.get_pro_rata_bps_for_current_allocation()
            self.calculation_bps = post_hurdle_bps + catch_up_bps + pro_rata_phase_bps
        else:
            self.calculation_bps = self.get_bps_for_post_hurdle()

    def update_re_allocated_values(self, re_allocated_value):
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.ECV.value:
            self.allocation['re_allocated_pre_hurdle_carry'] = (self.allocation.get('re_allocated_pre_hurdle_carry', 0)
                                                                +
                                                                re_allocated_value)
        elif self.hurdle.applies_to == CarryHurdle.AppliesToType.FMV.value:
            self.allocation['re_allocated_pre_hurdle_fmv'] = (self.allocation.get('re_allocated_pre_hurdle_fmv', 0) +
                                                              re_allocated_value)

    def re_allocate_points_to_impacted_allocation(self, post_hurdle=None):
        source_bps = Decimal(str(self.source_allocation['bps']))
        total_estimated_value = self.estimated_value_types.get(self.hurdle.applies_to)
        share_per_receiver_bps = 0

        num_receivers = len(self.hurdle.impacted_allocations_ids)
        if num_receivers:
            if self.hurdle.impact_type == CarryHurdle.ImpactType.PRO_RATA.value:
                self.impacted_allocations = self.initialize_allocations(self.hurdle.impacted_allocations_ids)
                share_per_receiver_bps = self.calculate_pro_rata_share(
                    self.allocation['bps'],
                    source_bps,
                    self.impacted_allocations
                )
            else:
                share_per_receiver_bps = source_bps / Decimal(str(num_receivers))

        re_allocated_value = self.calculate_value(
            points=share_per_receiver_bps,
            total_points=self.last_carry_pool_bps,
            estimated_value=total_estimated_value
        )

        if post_hurdle and share_per_receiver_bps:
            if re_allocated_value:
                re_allocated_value = self.calculate_value(
                    points=share_per_receiver_bps,
                    total_points=self.last_carry_pool_bps,
                    estimated_value=self.hurdle.hurdle_rate
                )
            share_per_receiver_bps = (re_allocated_value / total_estimated_value) * Decimal('100') \
                if total_estimated_value else 0

        self.calculation_bps = self.calculation_bps + share_per_receiver_bps
        self.update_re_allocated_values(re_allocated_value)

    def is_all_related_hurdles_in_pro_rata_phase(self):
        pro_rate_phase = True
        qs = CarryHurdle.objects.filter(
            carry_plan=self.carry_plan,
            impacted_allocations_ids__contains=[self.allocation['allocation_id']],
            is_supercharged=True,
            applies_to=self.hurdle.applies_to
        )
        total_estimated = self.estimated_value_types[self.hurdle.applies_to]
        for hurdle in qs:
            if total_estimated < hurdle.supercharge_end_value:
                pro_rate_phase = False
                break

        return pro_rate_phase

    def add_pro_rata_bps_for_impacted_allocation(self):
        qs = CarryHurdle.objects.filter(
            carry_plan=self.carry_plan,
            impacted_allocations_ids__contains=[self.allocation['allocation_id']],
            is_supercharged=True,
            applies_to=self.hurdle.applies_to
        )
        max_value = max([hurdle.supercharge_end_value for hurdle in qs])
        bps = 0
        estimated_value = self.estimated_value_types[self.hurdle.applies_to]
        if estimated_value:
            excess_value = estimated_value - max_value
            bps = (excess_value / estimated_value) * self.allocation['bps']

        self.calculation_bps += bps

    def calculate_for_impacted_allocation(self):
        self.source_allocation = self.initialize_allocations([self.hurdle.source_allocation_id])[0]
        hurdle_trigger_value = self.estimated_value_types.get(self.hurdle.applies_to)

        is_pre_hurdle = hurdle_trigger_value <= self.hurdle.hurdle_rate
        if is_pre_hurdle:
            self.re_allocate_points_to_impacted_allocation()
            return

        # post hurdle
        if self.hurdle.is_supercharged:
            if self.supercharge_handle is None:
                self.update_pre_hurdle_bps_for_impacted_allocation()
                if self.is_all_related_hurdles_in_pro_rata_phase():
                    self.add_pro_rata_bps_for_impacted_allocation()
                self.supercharge_handle = True

            self.re_allocate_points_to_impacted_allocation(post_hurdle=True)
            return

        self.re_allocate_points_to_impacted_allocation(post_hurdle=True)

    def check_update_hurdle_rate_for_entity(self):
        if self.entity_calculation:
            entity_percentage = 0
            if self.hurdle.applies_to == CarryHurdle.AppliesToType.ECV.value:
                entity_percentage = self.carry_plan_estimated_value / (self.carry_plan.carry_estimated_value or 1)
            elif self.hurdle.applies_to == CarryHurdle.AppliesToType.FMV.value:
                entity_percentage = self.carry_plan_fair_market_value / (self.carry_plan.fair_market_value or 1)
            self.hurdle.hurdle_rate = Decimal(str(entity_percentage)) * self.hurdle.hurdle_rate

    def get_normalization_value(self):
        hurdle_rate = self.hurdle.hurdle_rate
        all_hurdles_in_carry_plan = CarryHurdle.objects.filter(
            carry_plan=self.carry_plan
        )
        allocation_ids = [hurdle.source_allocation_id for hurdle in all_hurdles_in_carry_plan]
        hurdle_allocations = self.initialize_allocations(allocation_ids)
        total_hurdle_points = Decimal(0)
        for allocation in hurdle_allocations:
            total_hurdle_points += Decimal(str(allocation['bps']))
        catch_up_value = total_hurdle_points * hurdle_rate
        needed_value = catch_up_value
        un_allocated_carry_points = self.get_unallocated_points()
        if un_allocated_carry_points:
            needed_value = catch_up_value / un_allocated_carry_points
        value = needed_value + hurdle_rate

        return value

    def set_bps_to_calculate(self, is_source_hurdle):
        if is_source_hurdle is False:
            self.calculation_bps = 0
            return

        if self.hurdle.applies_to == CarryHurdle.AppliesToType.ECV.value:
            self.calculation_bps = self.allocation['ecv_bps']
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.FMV.value:
            self.calculation_bps = self.allocation['fmv_bps']

    def update_bps(self, is_source_hurdle):
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.ECV.value:
            if is_source_hurdle:
                self.allocation['ecv_bps'] = self.calculation_bps
            else:
                self.allocation['ecv_bps'] += self.calculation_bps
        if self.hurdle.applies_to == CarryHurdle.AppliesToType.FMV.value:
            if is_source_hurdle:
                self.allocation['fmv_bps'] = self.calculation_bps
            else:
                self.allocation['fmv_bps'] += self.calculation_bps

    def is_pro_rata_phase(self):
        normalization_value = self.hurdle.supercharge_end_value
        if not normalization_value:
            return False
        estimated_value = self.estimated_value_types.get(self.hurdle.applies_to)
        return estimated_value > normalization_value

    def check_hurdle(self):
        def process_hurdle(hurdle, calculation_method, is_source_hurdle=False):
            self.hurdle = hurdle
            self.check_update_hurdle_rate_for_entity()
            self.set_bps_to_calculate(is_source_hurdle)
            calculation_method()
            self.update_bps(is_source_hurdle)

        allocation_id = self.allocation['allocation_id']
        self.allocation['ecv_bps'] = self.allocation['bps']
        self.allocation['fmv_bps'] = self.allocation['bps']

        # Check if allocation is the source of any hurdle
        allocation_hurdles = CarryHurdle.objects.filter(
            carry_plan=self.carry_plan,
            source_allocation_id=allocation_id
        )
        if allocation_hurdles.exists():
            for hurdle in allocation_hurdles:
                process_hurdle(hurdle, self.calculate_for_current_allocation, True)

        # Check if allocation is impacted by any hurdle
        impacted_hurdles = CarryHurdle.objects.filter(
            carry_plan=self.carry_plan,
            impacted_allocations_ids__contains=[allocation_id]
        )
        if impacted_hurdles.exists():
            self.supercharge_handle = None
            for hurdle in impacted_hurdles:
                process_hurdle(hurdle, self.calculate_for_impacted_allocation)

    def apply_adjustments(self, allocation_id, carry_value, fair_market_value):
        if not self.value_adjustments:
            return carry_value, fair_market_value

        adjustment = self.value_adjustments.get(allocation_id)
        if not adjustment:
            return carry_value, fair_market_value

        fmv_adj = adjustment.get(AllocationValueAdjustment.ValueType.FAIR_MARKET_VALUE.value)
        if fmv_adj:
            fair_market_value += fmv_adj

        ecv_adj = adjustment.get(AllocationValueAdjustment.ValueType.ESTIMATED_VALUE.value)
        if ecv_adj:
            carry_value += ecv_adj

        return carry_value, fair_market_value

    def hurdle_feature_active(self):
        return self.carry_plan.company.is_feature_flag_active(CARRY_HURDLE_FEATURE)

    def calculate(self):
        total_estimated_value = self.carry_plan_estimated_value
        total_fair_market_value = self.carry_plan_fair_market_value

        if self.hurdle_feature_active():
            self.check_hurdle()

        carry_estimated_value = self.calculate_value(
            points=self.allocation.get('ecv_bps', self.allocation['bps']),
            total_points=self.last_carry_pool_bps,
            estimated_value=total_estimated_value
        )
        fair_market_value = self.calculate_value(
            points=self.allocation.get('fmv_bps', self.allocation['bps']),
            total_points=self.last_carry_pool_bps,
            estimated_value=total_fair_market_value
        )
        carry_estimated_value, fair_market_value = self.apply_adjustments(
            self.allocation['allocation_id'],
            carry_estimated_value,
            fair_market_value
        )

        percentage_vested = calculate_vested_percentage(self.allocation)
        vested_carry_estimated_value = (carry_estimated_value * percentage_vested) / Decimal('100')
        un_vested_carry_estimated_value = (carry_estimated_value - vested_carry_estimated_value).quantize(
            Decimal('0.0000'), rounding=ROUND_HALF_UP)
        vested_fair_market_value = (fair_market_value * percentage_vested) / Decimal('100')
        un_vested_fair_market_value = (fair_market_value - vested_fair_market_value).quantize(
            Decimal('0.0000'), rounding=ROUND_HALF_UP)

        response = {
            'carry_estimated_value': carry_estimated_value,
            'vested_carry_estimated_value': vested_carry_estimated_value,
            'un_vested_carry_estimated_value': un_vested_carry_estimated_value,
            'fair_market_value': fair_market_value,
            'vested_fair_market_value': vested_fair_market_value,
            'un_vested_fair_market_value': un_vested_fair_market_value
        }
        return response
