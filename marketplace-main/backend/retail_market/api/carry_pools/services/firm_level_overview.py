from datetime import date
from decimal import Decimal

from django.db.models import Subquery

from api.carry_pools.models import CarryPlan, CarryPool, CarryParticipant
from api.carry_pools.serializers import CarryPlanBaseInfoSerializer
from api.carry_pools.services.calculate_estimated_values import EstimatedValuesService
from api.carry_pools.utils import calculate_allocations_by_date_firmview, name_custom_sort_key
from api.employment_records.models import Position


class FirmLevelOverviewService:

    def __init__(self, company):
        self.company = company

    def get_carry_plans(self):
        last_carry_pool = CarryPool.objects.last_carry_pool_qs()
        qs = CarryPlan.objects.filter(company=self.company).annotate(
            last_carry_pool_allocations=Subquery(last_carry_pool.values('allocations')),
            last_carry_pool_bps=Subquery(last_carry_pool.values('bps'))
        )
        return list(qs)

    @staticmethod
    def get_participant_carryplan_map(carry_plans):
        carry_plan_participant_map = {}
        for carry_plan in carry_plans:
            carry_plan_id = carry_plan.id
            for allocation in carry_plan.last_carry_pool_allocations:
                allocated_bps = allocation.get('bps')
                if not allocated_bps:
                    continue

                if 'carry_participant_id' not in allocation:
                    continue

                carry_participant_id = allocation['carry_participant_id']
                if carry_participant_id not in carry_plan_participant_map:
                    carry_plan_participant_map[carry_participant_id] = {}

                current_value = carry_plan_participant_map[carry_participant_id].get(carry_plan_id, 0)
                carry_plan_participant_map[carry_participant_id][carry_plan_id] = current_value + Decimal(
                    str(allocated_bps))

        return carry_plan_participant_map

    @staticmethod
    def prepare_formatted_data_for_participants(participant_carryplan_map):
        participants = []
        carry_participants = CarryParticipant.objects.filter(id__in=participant_carryplan_map.keys())
        for participant in carry_participants:
            carry_plans = []
            carry_plan_bps = participant_carryplan_map[participant.id]
            for key, value in carry_plan_bps.items():
                carry_plans.append({'carry_plan_id': key, 'bps': value})
            participants.append(
                {
                    'name': participant.get_full_name(),
                    'hire_date': date.today(),
                    'carry_plans': carry_plans
                }
            )
        return participants

    def get_overview_data(self):
        carry_plans = self.get_carry_plans()
        participant_carryplan_map = self.get_participant_carryplan_map(carry_plans=carry_plans)
        participants = self.prepare_formatted_data_for_participants(participant_carryplan_map)
        sorted_carry_plans = sorted(carry_plans, key=name_custom_sort_key)
        data = {
            'carry_plans': CarryPlanBaseInfoSerializer(sorted_carry_plans, many=True).data,
            'participants': participants
        }
        return data


class ManagerReportService(FirmLevelOverviewService):

    def __init__(self, company, user, is_manager, calculation_date):
        super().__init__(company)
        self.user = user
        self.is_manager = is_manager
        self.calculation_date = calculation_date
        self.positions_map = self.create_employee_positions_map()

    def create_employee_positions_map(self):
        positions = Position.objects.filter(
            company=self.company,
            end_date=None
        ).order_by('-employment_record').distinct('employment_record')
        positions_map = {}
        for position in positions:
            positions_map[position.employment_record_id] = position
        return positions_map

    def get_participant_filters(self, carry_participant):
        filters = {
            'departments': None,
            'job_bands': None,
            'office_locations': None,
            'cost_centers': None,
            'business_units': None,
            'company_roles': None,
            'titles': None
        }

        carry_participant_user = carry_participant.carry_participant_user.first()
        if not carry_participant_user:
            return filters
        retail_user = carry_participant_user.user
        employment_record = retail_user.user_participant_profile.employment_record
        if not employment_record:
            return filters
        current_position = self.positions_map.get(employment_record.id)
        filters['departments'] = employment_record.department_id
        filters['job_bands'] = employment_record.job_band_id
        filters['office_locations'] = employment_record.office_location_id
        if current_position:
            filters['cost_centers'] = current_position.cost_center_id
            filters['business_units'] = current_position.business_unit_id
            filters['company_roles'] = current_position.functional_role_id
            filters['titles'] = current_position.title

        return filters

    def prepare_formatted_data_for_managers(self, participant_carryplan_map):
        participants = []

        if self.is_manager:
            manager_carry_participant = self.user.user_carry_participants.first().carry_participant
            manager_reports = manager_carry_participant.get_direct_reports()
            all_reports = [item for item in manager_reports]

            while True:
                if len(manager_reports) == 0:
                    break
                report_id = manager_reports.pop()
                report = CarryParticipant.objects.get(pk=report_id)
                direct_reports = report.get_direct_reports()
                for item in direct_reports:
                    all_reports.append(item)
                    if item != report_id:
                        manager_reports.append(item)

            all_reports = list(set(all_reports))
            selected_carry_participants = all_reports

        else:
            selected_carry_participants = participant_carryplan_map.keys()

        selected_carry_participants = CarryParticipant.objects.filter(
            id__in=selected_carry_participants).prefetch_related(
            'carry_participant_user__user__user_participant_profile__employment_record'
        ).all()

        for participant in selected_carry_participants:
            carry_plans = []
            carry_plan_bps = participant_carryplan_map.get(participant.id)
            if not carry_plan_bps:
                continue

            participant_total_values_dict = {}
            for key, value in carry_plan_bps.items():
                carry_plans.append({'carry_plan_id': key, 'value': self.stringify_dict(value)})
                participant_total_values_dict = self.sum_decimal_dicts(participant_total_values_dict, value)
            filters = self.get_participant_filters(participant)
            participants.append(
                {
                    'name': participant.get_full_name(),
                    'hire_date': date.today(),
                    'carry_plans': carry_plans,
                    'total': self.stringify_dict(participant_total_values_dict),
                    'carry_participant_id': participant.id,
                    **filters
                }
            )

        return participants

    @staticmethod
    def sum_decimal_dicts(dict1, dict2):
        result = {}
        for key, value in dict2.items():
            result[key] = dict1.get(key, Decimal('0')) + value
        return result

    @staticmethod
    def stringify_dict(input_dict):
        return {key: str(value) for key, value in input_dict.items()}

    def get_participant_carryplan_map(self, carry_plans):
        carry_plan_participant_map = {}
        carry_plan_allocations_map = {}
        for carry_plan in carry_plans:
            carry_plan_allocations_map[carry_plan.id] = carry_plan.last_carry_pool_allocations

        calculate_allocations_by_date_firmview(
            carry_plan_allocations_map,
            self.calculation_date,
            True
        )

        for carry_plan in carry_plans:
            carry_plan_id = carry_plan.id
            allocations = carry_plan_allocations_map[carry_plan.id]
            carry_pool_bps = Decimal(str(carry_plan.last_carry_pool_bps or 0))
            carry_plan_estimated_value = carry_plan.carry_estimated_value
            carry_plan_fair_market_value = carry_plan.fair_market_value
            value_adjustments = carry_plan.get_adjustments_by_allocations(
                calculation_date=self.calculation_date
            )

            for allocation in allocations:
                if not allocation.get('bps'):
                    continue

                estimated_values = EstimatedValuesService(
                    {
                        'allocation': allocation,
                        'carry_plan': carry_plan,
                        'latest_allocations': allocations,
                        'last_carry_pool_bps': carry_pool_bps,
                        'carry_plan_estimated_value': carry_plan_estimated_value,
                        'carry_plan_fair_market_value': carry_plan_fair_market_value,
                        'calculation_date': self.calculation_date,
                        'value_adjustments': value_adjustments,
                    }
                ).calculate()

                allocation['bps'] = Decimal(str(allocation['bps']))
                allocation['vested_bps'] = Decimal(str(allocation['vested_bps']))

                participant_estimated_carry = estimated_values['carry_estimated_value']
                vested_carry_value = estimated_values['vested_carry_estimated_value']
                un_vested_carry_value = estimated_values['un_vested_carry_estimated_value']
                un_vested_bps = allocation.get('bps', 0) - allocation.get('vested_bps', 0)

                participant_fair_market_carry = estimated_values['fair_market_value']
                vested_carry_fair_market_value = estimated_values['vested_fair_market_value']
                un_vested_carry_fair_market_value = estimated_values['un_vested_fair_market_value']

                value_map = {
                    'all_bps': allocation.get('bps', 0),
                    'vested_bps': allocation.get('vested_bps', 0),
                    'un_vested_bps': un_vested_bps,
                    'all_estimated_value': participant_estimated_carry,
                    'vested_estimated_value': vested_carry_value,
                    'un_vested_estimated_value': un_vested_carry_value,
                    'all_fair_market_value': participant_fair_market_carry,
                    'vested_fair_market_value': vested_carry_fair_market_value,
                    'un_vested_fair_market_value': un_vested_carry_fair_market_value
                }

                if 'carry_participant_id' not in allocation:
                    continue

                carry_participant_id = allocation['carry_participant_id']
                if carry_participant_id not in carry_plan_participant_map:
                    carry_plan_participant_map[carry_participant_id] = {}

                current_value_dict = carry_plan_participant_map[carry_participant_id].get(carry_plan_id, {})
                summed_dict = self.sum_decimal_dicts(current_value_dict, value_map)
                carry_plan_participant_map[carry_participant_id][carry_plan_id] = summed_dict

        return carry_plan_participant_map

    def get_manager_data(self):
        carry_plans = self.get_carry_plans()
        participant_carry_plan_map = self.get_participant_carryplan_map(carry_plans=carry_plans)
        participants = self.prepare_formatted_data_for_managers(participant_carry_plan_map)
        sorted_carry_plans = sorted(carry_plans, key=name_custom_sort_key)
        data = {
            'carry_plans': CarryPlanBaseInfoSerializer(sorted_carry_plans, many=True).data,
            'participants': participants
        }
        return data
