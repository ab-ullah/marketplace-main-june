from api.carry_pools.models import CarryPlan, VestingSchedule, CarryPlanMilestone
from api.carry_pools.serializers import VestingScheduleDisplaySerializer
from api.carry_pools.utils import get_carry_pool_of_carry_plan, update_custom_schedules_dict_with_milestone_data


class CarryPlanVestingScheduleService:

    def __init__(self, company_id, carry_plan_id):
        self.company_id = company_id
        self.carry_plan = CarryPlan.objects.get(pk=carry_plan_id, company=company_id)
        self.carry_plan_milestones = []

    def get_vesting_schedules_for_carry_plan(self):
        carry_pool = get_carry_pool_of_carry_plan(self.carry_plan.id, self.company_id)
        allocations = carry_pool.allocations
        vesting_schedule_ids = set()
        for allocation in allocations:
            vesting_schedule_ids.add(allocation['vesting_schedule'])
        return vesting_schedule_ids

    def get_vesting_schedules_display(self, vesting_schedules):
        schedules = VestingSchedule.objects.filter(
            company_id=self.company_id,
            id__in=vesting_schedules
        ).prefetch_related('time_vesting_schedules') \
            .prefetch_related('milestone_vesting_schedules')

        custom_displayed_schedules = []
        schedules_to_calculate_displays = []
        for schedule in schedules:
            if schedule.custom_display:
                custom_displayed_schedules.append(schedule)
            else:
                schedules_to_calculate_displays.append(schedule)

        serializer = VestingScheduleDisplaySerializer(schedules_to_calculate_displays, many=True)
        calculated_displays = serializer.data
        custom_displays = [schedule.custom_display for schedule in custom_displayed_schedules]
        return calculated_displays + custom_displays

    def insert_milestone_dates(self, data):
        unique_milestones = set()
        for vesting_schedule in data:
            for milestone_schedule in vesting_schedule.get('milestone_vesting_schedules', []):
                milestone = milestone_schedule['milestone']
                carry_milestone = CarryPlanMilestone.objects.filter(
                    carry_plan=self.carry_plan,
                    milestone_id=milestone['id']
                ).first()
                if carry_milestone:
                    milestone['date'] = carry_milestone.date
                    milestone['vesting_percentage'] = carry_milestone.vesting_percentage

                if milestone['id'] not in unique_milestones:
                    self.carry_plan_milestones.append(milestone)
                unique_milestones.add(milestone['id'])
            for custom_displayed_milestone_schedule in vesting_schedule.get('sequenced_vesting_schedules', []):
                milestone_id = custom_displayed_milestone_schedule.get('milestone_id', None)
                if milestone_id:
                    carry_milestone = CarryPlanMilestone.objects.filter(
                        carry_plan=self.carry_plan,
                        milestone_id=milestone_id
                    ).first()
                    if carry_milestone:
                        custom_displayed_milestone_schedule['date'] = carry_milestone.date
                    if milestone_id not in unique_milestones:
                        self.carry_plan_milestones.append({"id": milestone_id,
                                                           "vesting_percentage": carry_milestone.vesting_percentage,
                                                           "name": carry_milestone.milestone.name,
                                                           "date": carry_milestone.date})
                    unique_milestones.add(milestone_id)


    def get_vesting_schedules(self):
        vesting_schedules = self.get_vesting_schedules_for_carry_plan()
        display_data = self.get_vesting_schedules_display(vesting_schedules)
        self.insert_milestone_dates(display_data)

        return {
            'vesting_schedules': display_data,
            'carry_plan_milestones': self.carry_plan_milestones
        }
