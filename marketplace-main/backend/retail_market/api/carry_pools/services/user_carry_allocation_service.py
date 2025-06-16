from datetime import datetime
from decimal import Decimal

from django.db.models import Sum, Max
from django.http import Http404
from rest_framework.generics import get_object_or_404

from api.carry_pools.models import AllocationAction, CarryPlan, CarryDocument, CarryParticipant, \
    ParticipantDistribution, CarryPool, CarryHurdle
from api.carry_pools.serializers import (AllocationActionSerializer,
                                         UserCarryDetailSerializer, UserCarryWithVestingDetailSerializer,
                                         ParticipantDistributionSerializer, CarryHurdleSerializer)
from api.carry_pools.services.calculate_estimated_values import EstimatedValuesService
from api.carry_pools.services.calculate_vested_points import \
    CalculateVestedPointsService
from api.carry_pools.services.investor_carry_documents import InvestorCarryDocumentService
from api.carry_pools.utils import (get_allocation_from_pool,
                                   associate_with_carry_document, get_carry_pool_of_carry_plan, operate_on_numbers,
                                   get_all_latest_published_pools_for_company, calculate_allocations_by_date)
from api.companies.models import Company


class UserCarryAllocationService:
    def __init__(self, carry_participant_ids, company_id, calculation_date, carry_pool_status=None, allocation_id=None):
        self.transferred_to_bps_dict = {}
        self.transferred_from_bps_dict = {}
        self.carry_participant_ids = carry_participant_ids
        self.company_id = company_id
        self.calculation_date = calculation_date
        self.forfeited_bps_dict = {}
        self.diluted_bps_dict = {}
        self.carry_pool_status = carry_pool_status
        self.single_allocation_id = allocation_id

    def get_create_allocation_action_for_user(self):
        allocation_action_filters = {
            'carry_participant_id__in': self.carry_participant_ids,
            'type': AllocationAction.Type.CREATE.value,
            'company_id':self.company_id
        }
        if self.single_allocation_id:
            allocation_action_filters['allocation_id'] = self.single_allocation_id

        return AllocationAction.objects.filter(**allocation_action_filters)\
            .select_related('carry_participant')\
            .values('id', 'base_pool_id', 'parent_pool_id', 'allocation_id', 'created_at', 'carry_participant_id',
                    'carry_participant__entity_name', 'carry_participant__first_name', 'carry_participant__last_name')\
            .distinct()

    def prepare_latest_carry_pools(self, allocation_actions):
        base_pool_ids = [action['base_pool_id'] for action in allocation_actions]
        latest_pools = (
            CarryPool.objects.filter(
                external_id__in=base_pool_ids,
                company_id=self.company_id
            )
            .values('external_id')
            .annotate(latest_created_at=Max('created_at'))
        )
        latest_carry_pools = CarryPool.objects.filter(
            external_id__in=base_pool_ids,
            company_id=self.company_id,
            created_at__in=[pool['latest_created_at'] for pool in latest_pools]
        ).select_related('carry_plan')
        carry_pool_dict = {
            pool.external_id: pool
            for pool in latest_carry_pools
        }

        return carry_pool_dict

    def get_user_data(self, allocations_data=None, carry_plan_data=None):
        if allocations_data is None:
            allocations_data = []
        allocation_actions = self.get_create_allocation_action_for_user()
        self.prepare_allocation_actions([item['allocation_id'] for item in allocation_actions])
        latest_carry_pools = self.prepare_latest_carry_pools(allocation_actions)
        carry_plan_ids = [item.carry_plan_id for item in latest_carry_pools.values()]

        if carry_plan_data:
            bulk_estimated_values = CarryPlan.get_carry_estimated_values(
                [carry_plan_data.get('carry_plan_id')],
                carry_plan_data.get('start_date'),
                carry_plan_data.get('end_date'),
                self.calculation_date
                )
        else:
            bulk_estimated_values = CarryPlan.get_bulk_carry_estimated_values(carry_plan_ids)

        participant_distributions = ParticipantDistribution.objects.filter(
            company_id=self.company_id,
            participant_id__in=
            self.carry_participant_ids
        )

        distributions_totals_by_allocation = dict()
        for distribution in participant_distributions.all():
            if distribution.allocation_id not in distributions_totals_by_allocation:
                distributions_totals_by_allocation[distribution.allocation_id] = distribution.amount
            else:
                distributions_totals_by_allocation[distribution.allocation_id] += distribution.amount

        allocations = []
        for allocation_action in allocation_actions:
            # match the allocation object if allocations are given
            allocation = None
            for item in allocations_data:
                if item['allocation_id'] == allocation_action['allocation_id']:
                    allocation = item
                    allocation['vesting_schedule'] = allocation['vesting_schedule_id']['id']
                    break

            carry_pool = latest_carry_pools[allocation_action['base_pool_id']]
            carry_plan = carry_pool.carry_plan
            if carry_plan_data:
                carry_plan = CarryPlan.objects.get(id=carry_plan_data.get('carry_plan_id'))

            allocation = self.get_updated_vested_points(
                allocation_id=allocation_action['allocation_id'],
                base_pool_id=allocation_action['base_pool_id'],
                parent_pool_id=allocation_action['parent_pool_id'],
                create_date=allocation_action['created_at'],
                allocation=allocation,
            )

            if not allocation:
                continue
            value_adjustments = carry_plan.get_adjustments_by_allocations(
                calculation_date=self.calculation_date
            )
            estimated_values = EstimatedValuesService(
                {
                    'allocation': allocation,
                    'carry_plan': carry_plan,
                    'carry_pool': carry_pool,
                    'carry_plan_estimated_value': bulk_estimated_values.get(carry_plan.id, 0),
                    'carry_plan_fair_market_value': carry_plan.fair_market_value,
                    'carry_pool_status': self.carry_pool_status,
                    'calculation_date': self.calculation_date,
                    'value_adjustments': value_adjustments
                }
            ).calculate()

            un_vested_bps = Decimal(str(allocation['bps'])) - Decimal(str(allocation['vested_bps']))
            carry_plan_estimated_value = bulk_estimated_values.get(carry_plan.id, 0)
            carry_pool_bps = carry_pool.bps if carry_pool else 0

            if carry_plan_data and carry_pool.carry_plan == carry_plan:
                estimated_values_dict = {
                        'carry_plan_id': carry_plan.id,
                        'carry_estimated_value': estimated_values['carry_estimated_value'],
                        'fair_market_value': estimated_values['fair_market_value']
                    }
            appendable = {
                **allocation,
                'carry_plan_name': carry_plan.name,
                'un_vested_bps': un_vested_bps,
                'percentage_vested': allocation['vested_percentage_display'],
                'base_pool_id': allocation_action['base_pool_id'],
                'parent_pool_id': allocation_action['parent_pool_id'],
                'carry_pool_points': carry_pool_bps,
                'carry_plan_estimated_value': carry_plan_estimated_value,
                'estimated_value_date': carry_plan.estimated_value_date,
                'fair_market_value_date': carry_plan.fair_market_value_date,
                'external_id': carry_pool.external_id,
                'carry_plan_fair_market_value': carry_plan.fair_market_value,
                'carry_plan_id': carry_plan.id,
                'participant_estimated_carry': str(estimated_values['carry_estimated_value']),
                'participant_estimated_carry_vested': str(estimated_values['vested_carry_estimated_value']),
                'participant_estimated_carry_un_vested': str(estimated_values['un_vested_carry_estimated_value']),
                'participant_fair_market_value': str(estimated_values['fair_market_value']),
                'participant_fair_market_value_vested': str(estimated_values['vested_fair_market_value']),
                'participant_fair_market_value_un_vested': str(estimated_values['un_vested_fair_market_value']),
                'entity_name': allocation_action['carry_participant__entity_name'],
                'full_name': f"{allocation_action['carry_participant__first_name']} {allocation_action['carry_participant__last_name']}",
                'carry_participant_id': allocation_action['carry_participant_id'],
                'distributions': distributions_totals_by_allocation[allocation['allocation_id']] if allocation['allocation_id'] in distributions_totals_by_allocation else 0
            }

            allocations.append(appendable)
        if carry_plan_data:
            return estimated_values_dict
        serializer = UserCarryDetailSerializer(allocations, many=True)
        return serializer.data
    
    def get_investor_data(self):
        user_data = self.get_user_data()
        published_pools = get_all_latest_published_pools_for_company([self.company_id]).values_list('external_id', flat=True)
        published_user_data = [u for u in user_data if u['external_id'] in published_pools]
        return published_user_data

    @staticmethod
    def calculate_value(points, total_points, estimated_value):
        if not total_points:
            return 0
        return Decimal(str(estimated_value)) * Decimal(str(points))/Decimal(str(total_points))

    def get_allocation_documents(self, allocation_id):
        return InvestorCarryDocumentService(
            companies=Company.objects.filter(id=self.company_id),
            company_users=[],
            released_filter=True
        ).compile_by_allocation_id(allocation_id)


    def get_action_details(self, allocation):
        current_points = 0
        formatted_actions = []
        actions = AllocationAction.objects.filter(
            allocation_id=allocation['allocation_id'],
            grant_date__lte=self.calculation_date
        ).exclude(type=AllocationAction.Type.EDIT.value).order_by('grant_date')

        has_transfer_to_action = AllocationAction.objects.filter(
            allocation_id=allocation['allocation_id'],
            type=AllocationAction.Type.TRANSFER_TO
        ).exists()

        for action in actions:
            if action.type == AllocationAction.Type.TRANSFER_TO:
                current_points += action.bps
                change = action.bps
            elif action.type == AllocationAction.Type.CREATE:
                if has_transfer_to_action:
                    if not Decimal(str(allocation['initial_bps'])):
                        continue
                current_points += Decimal(str(allocation['initial_bps']))
                change = str(allocation['initial_bps'])
            else:
                current_points -= action.bps
                change = str(action.bps)
            formatted_actions.append({
                'date': action.grant_date.strftime("%m/%d/%Y") if action.grant_date else '',
                'event_type': action.action_display_name,
                'change': change,
                'total': str(current_points)
            })

        formatted_actions.append(
            {
                'change': str(current_points),
                'event_type': 'Current Points',
                'is_total_row': True
            }
        )
        return formatted_actions

    @staticmethod
    def add_hurdles_data(allocation_data, allocation, carry_plan):
        ecv_hurdle = CarryHurdle.objects.filter(
            carry_plan=carry_plan,
            source_allocation_id=allocation['allocation_id'],
            applies_to=CarryHurdle.AppliesToType.ECV.value
        ).first()
        fmv_hurdle = CarryHurdle.objects.filter(
            carry_plan=carry_plan,
            source_allocation_id=allocation['allocation_id'],
            applies_to=CarryHurdle.AppliesToType.FMV.value
        ).first()

        allocation_data['re_allocated_pre_hurdle_carry'] = allocation.get('re_allocated_pre_hurdle_carry')
        allocation_data['re_allocated_pre_hurdle_fmv'] = allocation.get('re_allocated_pre_hurdle_fmv')
        allocation_data['ecv_hurdle'] = CarryHurdleSerializer(ecv_hurdle).data if ecv_hurdle else None
        allocation_data['fmv_hurdle'] = CarryHurdleSerializer(fmv_hurdle).data if fmv_hurdle else None

        hurdle_keys = {
            'ecv_hurdle' :'re_allocated_source_hurdle_value_to_allocations_ecv',
            'fmv_hurdle' : 're_allocated_source_hurdle_value_to_allocations_fmv'
        }
        for hurdle_type in ('ecv_hurdle', 'fmv_hurdle'):
            if allocation_data.get(hurdle_type):
                value = allocation.get(hurdle_keys.get(hurdle_type))
                allocation_data[hurdle_type]['re_allocated_hurdle_value'] = value


    def get_user_single_allocation_data(self, carry_plan_id, allocation_id):
        self.prepare_allocation_actions(allocation_ids=[allocation_id])
        carry_plan = get_object_or_404(CarryPlan, id=carry_plan_id)
        carry_pool = get_carry_pool_of_carry_plan(carry_plan_id, carry_plan.company_id)
        if self.carry_pool_status:
            allocation = self.get_allocation_from_pool_with_status(
                base_pool_id=carry_pool.external_id,
                parent_pool_id=carry_pool.external_id,
                allocation_id=allocation_id
            )
        else:
            allocation = get_allocation_from_pool(
                base_pool_id=carry_pool.external_id,
                parent_pool_id=carry_pool.external_id,
                allocation_id=allocation_id,
                company_id=carry_plan.company.id
            )
        if not allocation:
            raise Http404('Allocation not found')
        participant = CarryParticipant.objects.get(pk=allocation['carry_participant_id'])
        allocation_action = get_object_or_404(AllocationAction, id=allocation['allocation_action_id'])

        self.adjust_allocation_actions(allocation)
        allocation = self.get_updated_vested_points(
            allocation_id=allocation_id,
            base_pool_id=carry_pool.external_id,
            parent_pool_id=carry_pool.external_id,
            create_date=allocation_action.created_at.strftime("%Y-%m-%d"),
            allocation=allocation,
        )
        value_adjustments = carry_plan.get_adjustments_by_allocations(calculation_date=self.calculation_date)
        estimated_values = EstimatedValuesService(
            {
                'allocation': allocation,
                'carry_plan': carry_plan,
                'carry_pool': carry_pool,
                'carry_plan_estimated_value': carry_plan.carry_estimated_value,
                'carry_plan_fair_market_value': carry_plan.fair_market_value,
                'carry_pool_status': self.carry_pool_status,
                'calculation_date': self.calculation_date,
                'value_adjustments': value_adjustments,
            }
        ).calculate()

        allocation.update({
            'carry_plan_name': carry_plan.name,
            'participant_name': participant.get_full_name(),
            'base_pool_id': carry_pool.external_id,
            'parent_pool_id': carry_pool.external_id,
            'carry_pool_points': carry_pool.bps if carry_pool else 0,
            'carry_plan_estimated_value': carry_plan.carry_estimated_value,
            'carry_plan_id': carry_plan.id,
            'estimated_value_date': carry_plan.estimated_value_date,
            'fair_market_value_date': carry_plan.fair_market_value_date,
            'participant_ecv': estimated_values['carry_estimated_value'],
            'participant_ecv_vested': estimated_values['vested_carry_estimated_value'],
            'participant_ecv_un_vested': estimated_values['un_vested_carry_estimated_value'],
            'participant_fmv': estimated_values['fair_market_value'],
            'participant_fmv_vested': estimated_values['vested_fair_market_value'],
            'participant_fmv_un_vested': estimated_values['un_vested_fair_market_value'],
            'carry_plan_fair_market_value': carry_plan.fair_market_value,
            'percentage_vested': allocation['vested_percentage_display'],
            'un_vested_bps': Decimal(str(allocation['bps'])) - Decimal(str(allocation['vested_bps'])),
            'external_id': carry_pool.external_id
        })

        serializer = UserCarryWithVestingDetailSerializer(allocation)
        allocation_data = serializer.data

        allocation_data['distributions'] = self.get_participant_distributions(allocation_id, carry_plan.company)
        allocation_data['actions'] = self.get_action_details(allocation=allocation)
        allocation_data['documents'] = self.get_allocation_documents(allocation_id=allocation_id)
        self.add_hurdles_data(allocation_data, allocation, carry_plan)

        return allocation_data

    def get_participant_distributions(self, allocation_id, company):
        participant_distributions = ParticipantDistribution.objects.filter(
            allocation_id=allocation_id,
            company=company
        )
        participant_distributions_data = ParticipantDistributionSerializer(participant_distributions, many=True).data
        return participant_distributions_data

    def get_allocation_from_pool_with_status(self, base_pool_id, parent_pool_id, allocation_id):
        carry_pool = CarryPool.objects.filter(
            company_id=self.company_id,
            external_id=base_pool_id,
            status=self.carry_pool_status
        )
        if carry_pool.exists():
            carry_pool = carry_pool.latest('created_at')
            allocation = get_allocation_from_pool(
                base_pool_id=base_pool_id,
                parent_pool_id=parent_pool_id,
                allocation_id=allocation_id,
                company_id=self.company_id,
                carry_pool=carry_pool
            )
            return allocation

        return None

    def get_updated_vested_points(self, allocation_id, base_pool_id, parent_pool_id, create_date,
                                  allocation=None):

        if allocation is None:
            if self.carry_pool_status:
                allocation = self.get_allocation_from_pool_with_status(base_pool_id, parent_pool_id, allocation_id)

            else:
                allocation = get_allocation_from_pool(
                    base_pool_id=base_pool_id,
                    parent_pool_id=parent_pool_id,
                    allocation_id=allocation_id,
                    company_id=self.company_id
                )

            self.adjust_allocation_actions(allocation)

        if not allocation:
            return

        if not allocation.get('grant_date'):
            allocation['grant_date'] = create_date.strftime("%Y-%m-%d")

        if not allocation.get('initial_bps'):
            allocation['initial_bps'] = allocation['bps']

        result = CalculateVestedPointsService({
            'base_pool_id': base_pool_id,
            'parent_pool_id': parent_pool_id,
            'allocation_id': allocation_id,
            'company_id': self.company_id,
            'vesting_calculation_date': self.calculation_date,
            'allocation': allocation
        }).calculate_vested_points()

        allocation['vested_bps'] = float(result['vested_points'])
        allocation['vested_percentage_display'] = result['vested_percentage']
        return allocation

    def forfeit_allocations(self, forfeiture_data, allocations):
        allocations_list = []
        for forfeit_record in forfeiture_data:
            if not forfeit_record.get('bps', 0):
                continue

            allocation = None
            for item in allocations:
                if item['allocation_id'] == forfeit_record['allocation_id']:
                    allocation = item
                    break

            if (not allocation or Decimal(str(allocation['bps'])) == Decimal('0') or
                    Decimal(str(forfeit_record['bps'])) > Decimal(str(allocation['bps']))):
                continue

            carry_participant_id = allocation['carry_participant_id']
            forfeiture_date = forfeit_record.get('forfeiture_date')
            if forfeiture_date:
                forfeiture_date = datetime.strptime(forfeiture_date.split(' ')[0], "%m/%d/%Y")
            else:
                forfeiture_date = datetime.strptime(self.calculation_date,  "%Y-%m-%d")

            allocation_action_data = {
                'bps': Decimal(str(forfeit_record['bps'])),
                'carry_participant': carry_participant_id,
                'grant_date': forfeiture_date,
                'effective_date': None,
                'base_pool_id': forfeit_record['base_pool_id'],
                'parent_pool_id': forfeit_record['parent_pool_id'],
                'allocation_id': forfeit_record['allocation_id'],
                'vesting_schedule_id': allocation['vesting_schedule_id'],
                'type': AllocationAction.Type.FORFEIT.value,
                'company': self.company_id
            }
            serializer = AllocationActionSerializer(data=allocation_action_data)

            if serializer.is_valid(raise_exception=True):
                serializer.save()

                allocation['forfeited_bps'] = operate_on_numbers(
                    '+',
                    allocation.get('forfeited_bps', 0),
                    forfeit_record['bps']
                )
                allocation['bps'] = operate_on_numbers(
                    '-',
                    allocation['bps'],
                    forfeit_record['bps']
                )
                un_vested_bps = operate_on_numbers(
                    '-',
                    allocation['bps'],
                    allocation.get('vested_bps', 0)
                )

                # In rare cases, where forfeited points are greater than un_vested point,
                # the un_vested can result into negative points. In that scenario,
                # un_vested_points are set to 0 and the remaining points are forfeited from vested points.

                if un_vested_bps < 0:
                    allocation['vested_bps'] = operate_on_numbers(
                '+',
                allocation.get('vested_bps', 0),
                         un_vested_bps
                    )
                allocations_list.append(allocation)

                carry_plan = CarryPlan.objects.get(pk=allocation['carry_plan_id'])
                company = Company.objects.get(pk=self.company_id)
                carry_participant = CarryParticipant.objects.get(pk=carry_participant_id)
                associate_with_carry_document(
                    carry_plan,
                    carry_participant,
                    company,
                    CarryDocument.DocumentType.CARRY_FORFEITURE.value,
                    forfeit_record['allocation_id']
                )

                if carry_plan.status != CarryPlan.Status.PENDING_APPROVAL.value:
                    carry_plan.status = CarryPlan.Status.UNPUBLISHED_CHANGE.value
                    carry_plan.save()

        return allocations_list

    def calculate_forfeit_allocations_by_dates(self, forfeiture_data, allocations):
        for forfeit_record in forfeiture_data:
            forfeiture_date = forfeit_record.get('forfeiture_date')
            if not forfeiture_date:
                continue

            allocation = None
            for item in allocations:
                if item['allocation_id'] == forfeit_record['allocation_id']:
                    allocation = item
                    break

            if not allocation:
                continue

            forfeiture_date_obj = datetime.strptime(forfeiture_date, '%m/%d/%Y')
            forfeiture_date_string = forfeiture_date_obj.strftime('%Y-%m-%d')
            self.calculation_date = forfeiture_date_string
            self.single_allocation_id = forfeit_record['allocation_id']
            new_allocation_data = self.get_user_data()
            new_allocation_data[0]['forfeiture_date'] = forfeiture_date
            allocation.update(new_allocation_data[0])

    def adjust_allocation_actions(self, allocation):
        if allocation:
            diluted_bps = self.diluted_bps_dict.get(allocation['allocation_id'], 0)
            allocation['diluted_bps'] = diluted_bps
            diluted_bps_decimal = Decimal(str(diluted_bps))
            bps_decimal = Decimal(str(allocation['bps']))
            remainder_decimal = bps_decimal - diluted_bps_decimal
            allocation['bps'] = remainder_decimal

            forfeited_bps = self.forfeited_bps_dict.get(allocation['allocation_id'], 0)
            allocation['forfeited_bps'] = forfeited_bps
            forfeited_bps_decimal = Decimal(str(forfeited_bps))
            bps_decimal = Decimal(str(allocation['bps']))
            remainder_decimal = bps_decimal - forfeited_bps_decimal
            allocation['bps'] = remainder_decimal

            transferred_from_bps = self.transferred_from_bps_dict.get(allocation['allocation_id'], 0)
            allocation['transferred_from_bps'] = transferred_from_bps
            transferred_from_bps_decimal = Decimal(str(transferred_from_bps))
            bps_decimal = Decimal(str(allocation['bps']))
            remainder_decimal = bps_decimal - transferred_from_bps_decimal
            allocation['bps'] = remainder_decimal

            transferred_to_bps = self.transferred_to_bps_dict.get(allocation['allocation_id'], 0)
            allocation['transferred_to_bps'] = transferred_to_bps
            transferred_bps_bps_decimal = Decimal(str(transferred_to_bps))
            allocation['bps'] += transferred_bps_bps_decimal

    def prepare_allocation_actions(self, allocation_ids):
        forfeiture_data = AllocationAction.objects.filter(
            allocation_id__in=allocation_ids,
            type=AllocationAction.Type.FORFEIT.value,
            grant_date__date__lte=self.calculation_date
        ).values('allocation_id').annotate(forfeited_bps=Sum('bps'))

        self.forfeited_bps_dict = {item['allocation_id']: item['forfeited_bps'] for item in forfeiture_data}

        diluted_data = AllocationAction.objects.filter(
            allocation_id__in=allocation_ids,
            type=AllocationAction.Type.DILUTE.value,
            grant_date__date__lte=self.calculation_date
        ).values('allocation_id').annotate(diluted_bps=Sum('bps'))

        self.diluted_bps_dict = {item['allocation_id']: item['diluted_bps'] for item in diluted_data}

        transfer_from_points_data = AllocationAction.objects.filter(
            allocation_id__in=allocation_ids,
            type=AllocationAction.Type.TRANSFER_FROM.value,
            grant_date__date__lte=self.calculation_date
        ).values('allocation_id').annotate(transfer_bps=Sum('bps'))

        self.transferred_from_bps_dict = {item['allocation_id']: item['transfer_bps'] for item in transfer_from_points_data}

        transfer_to_points_data = AllocationAction.objects.filter(
            allocation_id__in=allocation_ids,
            type=AllocationAction.Type.TRANSFER_TO.value,
            grant_date__date__lte=self.calculation_date
        ).values('allocation_id').annotate(transfer_bps=Sum('bps'))

        self.transferred_to_bps_dict = {item['allocation_id']: item['transfer_bps'] for item in transfer_to_points_data}
