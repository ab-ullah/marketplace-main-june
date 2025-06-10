from datetime import timedelta
from decimal import Decimal
from fractions import Fraction
from django.utils import timezone

from dateutil.parser import parse as dt_parse
from dateutil.relativedelta import relativedelta
from django.utils.datetime_safe import datetime, time

from api.carry_pools.models import AllocationAction, VestingSchedule, CarryPlanMilestone, CarryPlan


class CalculateVestedPointsService:

    def __init__(self, data):
        self.dilutions = None
        self.forfeitures = None
        self.from_transfers = None
        self.to_transfers = None
        self.errors = []
        self.allocation = data.get('allocation')
        self.allocation_action_status = data.get('action_status')
        self.vesting_schedule = self.get_vesting_schedule(
            self.allocation['vesting_schedule_id']['id'] if self.allocation.get('vesting_schedule_id') else
            self.allocation.get('vesting_schedule')
        )
        self.carry_plan = CarryPlan.objects.get(pk=self.allocation['carry_plan_id'])
        self.vesting_start_date = self.get_vesting_start_date()
        self.vesting_calculation_date = CalculateVestedPointsService.get_date(data.get('vesting_calculation_date'))
        self.initialize_allocation_actions()

        # leap year edge case
        if self.vesting_start_date and self.vesting_start_date.month == 2 and self.vesting_start_date.day == 29:
            self.vesting_start_date = self.vesting_start_date.replace(day=28)

        self.total_allocation_bps_calculated = Decimal(str(self.allocation['initial_bps']))

        self.cliff_vested_percentage = Fraction()
        self.time_vested_percentage = Fraction()
        self.milestone_vested_percentage = 0

    def initialize_allocation_actions(self):
        allocation_action_filters = {
            'allocation_id': self.allocation['allocation_id'],
            'type': AllocationAction.Type.FORFEIT.value
        }
        if self.allocation_action_status:
            allocation_action_filters['status'] = self.allocation_action_status

        self.forfeitures = list(AllocationAction.objects.filter(**allocation_action_filters))
        allocation_action_filters['type'] = AllocationAction.Type.DILUTE.value
        self.dilutions = list(AllocationAction.objects.filter(**allocation_action_filters))
        allocation_action_filters['type'] = AllocationAction.Type.TRANSFER_FROM.value
        self.from_transfers = list(AllocationAction.objects.filter(**allocation_action_filters))
        allocation_action_filters['type'] = AllocationAction.Type.TRANSFER_TO.value
        self.to_transfers = list(AllocationAction.objects.filter(**allocation_action_filters))

    def get_vesting_start_date(self):
        if self.allocation.get('vesting_start_date'):
            vesting_start_date = CalculateVestedPointsService.get_date(self.allocation['vesting_start_date'])
            return vesting_start_date

        if not self.carry_plan.effective_date:
            return None

        default_vesting_start_date = self.carry_plan.effective_date.strftime("%Y-%m-%d")
        vesting_start_date = CalculateVestedPointsService.get_date(default_vesting_start_date)
        return vesting_start_date

    def get_vesting_schedule(self, vesting_id):
        try:
            return VestingSchedule.objects.get(pk=vesting_id)
        except VestingSchedule.DoesNotExist:
            self.errors.append(f'Vesting Schedule {vesting_id} does not exists')
            return None

    @staticmethod
    def get_date(date_string):
        try:
            return dt_parse(date_string).date()
        except ValueError:
            return None

    @staticmethod
    def add_period_to_date(current_date, period_duration):
        if period_duration.days == 365:
            new_date = current_date.replace(year=current_date.year + 1)
        elif period_duration.days == 30:
            new_date = current_date + relativedelta(months=1)
        else:
            new_date = current_date + period_duration

        return new_date

    @staticmethod
    def calculate_vested_bps_from_percentage(total_bps, percentage):
        total_bps_decimal = Decimal(str(total_bps))
        vested_bps = (total_bps_decimal * percentage) / 100
        return round(vested_bps, 6)

    @staticmethod
    def calculate_vested_bps_from_fraction(total_bps, percentage_fraction):
        total_bps_fraction = Fraction(str(total_bps))
        vested_bps = (total_bps_fraction * percentage_fraction) / 100
        return vested_bps

    def get_bps_to_subtract(self, start_date, duration):
        forfeited_bps = self.get_forfeited_bps(start_date, duration)
        diluted_bps = self.get_diluted_bps(start_date, duration)
        transferred_from_bps = self.get_from_transfer_bps(start_date, duration)
        bps_to_subtract = forfeited_bps + diluted_bps + transferred_from_bps
        transferred_to_bps = self.get_to_transfer_bps(start_date, duration)
        bps = bps_to_subtract - transferred_to_bps
        return bps

    def get_vested_bps_for_cliff(self):
        vested_bps = Fraction()
        duration_with_cliff = self.get_duration_with_cliff()

        if duration_with_cliff <= self.vesting_calculation_date:
            subtracted_bps = self.get_bps_to_subtract(self.vesting_start_date, duration_with_cliff)
            self.total_allocation_bps_calculated = self.total_allocation_bps_calculated - subtracted_bps

            vested_bps = CalculateVestedPointsService.calculate_vested_bps_from_fraction(
                self.total_allocation_bps_calculated,
                self.vesting_schedule.cliff_vesting_percentage_fraction
            )
            self.cliff_vested_percentage = self.vesting_schedule.cliff_vesting_percentage_fraction

        return vested_bps

    def get_duration_with_cliff(self):
        duration_passed = self.vesting_start_date

        if self.vesting_schedule.cliff_duration:
            duration_passed = CalculateVestedPointsService.add_period_to_date(
                self.vesting_start_date,
                self.vesting_schedule.cliff_duration
            )
        return duration_passed

    @staticmethod
    def get_time_included_dates(start_date, end_date):
        if start_date == end_date:
            start_datetime = datetime.combine(start_date, time.min).replace(tzinfo=timezone.get_current_timezone())
            end_datetime = datetime.combine(end_date, time.max).replace(tzinfo=timezone.get_current_timezone())
        else:
            start_datetime = datetime.combine(start_date, time(tzinfo=timezone.get_current_timezone()))
            end_datetime = datetime.combine(end_date, time(tzinfo=timezone.get_current_timezone())) - timedelta(
                milliseconds=0.001)
        return start_datetime, end_datetime

    def get_forfeited_bps(self, start_date, end_date):
        start_datetime, end_datetime = self.get_time_included_dates(start_date, end_date)
        forfeited_bps = Decimal(0)
        for forfeiture in self.forfeitures:
            if start_datetime <= forfeiture.grant_date <= end_datetime:
                forfeited_bps += Decimal(str(forfeiture.bps))

        return forfeited_bps

    def get_diluted_bps(self, start_date, end_date):
        start_datetime, end_datetime = self.get_time_included_dates(start_date, end_date)
        diluted_bps = Decimal(0)
        for dilution in self.dilutions:
            if start_datetime <= dilution.grant_date <= end_datetime:
                diluted_bps += Decimal(str(dilution.bps))

        return diluted_bps

    def get_from_transfer_bps(self, start_date, end_date):
        start_datetime, end_datetime = self.get_time_included_dates(start_date, end_date)
        transfer_bps = Decimal(0)
        for transfer in self.from_transfers:
            if start_datetime <= transfer.grant_date <= end_datetime:
                transfer_bps += Decimal(str(transfer.bps))

        return transfer_bps

    def get_to_transfer_bps(self, start_date, end_date):
        transfer_bps = Decimal(0)
        start_datetime, end_datetime = self.get_time_included_dates(start_date, end_date)

        if (self.vesting_schedule.cliff_duration is not None and self.vesting_schedule.cliff_duration.days == 0 and
                self.vesting_schedule.cliff_vesting_percentage == Decimal('100')):
            end_datetime = datetime.combine(self.vesting_calculation_date, time.max).replace(
                tzinfo=timezone.get_current_timezone())

        for transfer in self.to_transfers:
            if start_datetime <= transfer.grant_date <= end_datetime:
                transfer_bps += Decimal(str(transfer.bps))

        return transfer_bps

    def get_vested_bps_for_time_based_schedule(self):
        vested_bps = Fraction()

        duration_passed = self.get_duration_with_cliff()

        time_vesting_schedules = self.vesting_schedule.time_vesting_schedules.order_by('sequence')

        for time_schedule in time_vesting_schedules:

            duration_with_added_time = CalculateVestedPointsService.add_period_to_date(
                duration_passed,
                time_schedule.period_duration
            )

            subtracted_bps = self.get_bps_to_subtract(duration_passed, duration_with_added_time)
            self.total_allocation_bps_calculated -= subtracted_bps
            duration_passed = duration_with_added_time

            if duration_passed <= self.vesting_calculation_date:
                vested_bps += CalculateVestedPointsService.calculate_vested_bps_from_fraction(
                    self.total_allocation_bps_calculated,
                    time_schedule.period_vesting_percentage_fraction
                )
                self.time_vested_percentage += time_schedule.period_vesting_percentage_fraction

        return vested_bps

    def get_milestone_vesting_schedules_dict(self):
        milestone_vesting_schedules = self.vesting_schedule.milestone_vesting_schedules.select_related(
            'milestone').all()

        milestone_vesting_schedules_dict = {
            milestone_schedule.milestone.id: {
                'milestone_vesting_percentage': milestone_schedule.milestone_vesting_percentage,
                'is_accelerated': milestone_schedule.is_accelerated
            }
            for milestone_schedule in milestone_vesting_schedules
        }

        return milestone_vesting_schedules_dict

    def get_vested_percentage_for_milestone_based_schedule(self):
        vested_bps = 0
        total_allocation_bps = Decimal(str(self.allocation['initial_bps']))
        is_accelerated = False
        duration_passed = self.vesting_start_date

        milestone_vesting_schedules = self.get_milestone_vesting_schedules_dict()

        carry_plan_milestones = CarryPlanMilestone.objects.filter(
            carry_plan=self.carry_plan,
            milestone__in=milestone_vesting_schedules.keys()
        ).select_related('milestone').order_by('date')

        for carry_plan_milestone in carry_plan_milestones:
            milestone = carry_plan_milestone.milestone
            milestone_schedule = milestone_vesting_schedules.get(milestone.id)

            milestone_date = carry_plan_milestone.date
            milestone_percentage = carry_plan_milestone.vesting_percentage

            if not self.vesting_start_date or not milestone_date or not milestone_percentage:
                continue

            if not (self.vesting_calculation_date >= milestone_date >= self.vesting_start_date):
                continue

            if milestone_schedule['is_accelerated']:
                is_accelerated = True

            subtracted_bps = self.get_bps_to_subtract(duration_passed, milestone_date)
            total_allocation_bps -= subtracted_bps
            duration_passed = milestone_date

            current_vested_point = CalculateVestedPointsService.calculate_vested_bps_from_percentage(
                total_allocation_bps,
                milestone_percentage
            )

            if milestone_schedule['is_accelerated'] and milestone_percentage > vested_bps:
                vested_bps = current_vested_point
                self.milestone_vested_percentage = milestone_percentage
            elif not milestone_schedule['is_accelerated']:
                vested_bps += current_vested_point
                self.milestone_vested_percentage += milestone_percentage

        self.milestone_vested_percentage = Fraction(self.milestone_vested_percentage)
        return vested_bps, is_accelerated

    def calculate_vested_points(self):
        if not self.vesting_start_date or self.allocation['bps'] == 0:
            return {
                "success": True,
                "message": "Calculation successful",
                "vested_points": 0,
                "vested_percentage": 0
            }

        cliff_bps: Fraction = self.get_vested_bps_for_cliff()
        time_bps: Fraction = self.get_vested_bps_for_time_based_schedule()
        vested_bps = time_bps + cliff_bps
        vested_percentage = self.cliff_vested_percentage + self.time_vested_percentage

        # convert to decimal
        vested_bps: Decimal = vested_bps.numerator / Decimal(vested_bps.denominator)

        milestone_bps, is_accelerated = self.get_vested_percentage_for_milestone_based_schedule()

        if not is_accelerated:
            vested_bps += milestone_bps
            vested_percentage += self.milestone_vested_percentage

        if is_accelerated and milestone_bps > vested_bps:
            vested_bps = milestone_bps
            vested_percentage = self.milestone_vested_percentage

        vested_percentage: Decimal = vested_percentage.numerator / Decimal(vested_percentage.denominator)
        vested_bps = min(vested_bps, Decimal(str(self.allocation['bps'])))

        result = {
            "success": True,
            "message": "Calculation successful",
            "vested_points": vested_bps,
            "vested_percentage":str(vested_percentage)
        }
        return result
