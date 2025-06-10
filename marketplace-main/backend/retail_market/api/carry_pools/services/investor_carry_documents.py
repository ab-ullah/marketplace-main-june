from api.carry_pools.models import ParticipantCarryDocument, VestingSchedule, CarryPlan, CarryPool, \
    CarryParticipantUser, CarryParticipant
from api.carry_pools.serializers import CarryDocumentParticipantSerializer, VestingScheduleBaseInfoSerializer


class InvestorCarryDocumentService:
    def __init__(self, company_users, companies, released_filter=None):
        self.companies = companies
        self.company_users = company_users
        self.users = [company_user.user.id for company_user in self.company_users]
        self.released_filter = released_filter

    @staticmethod
    def get_allocation_for_user(allocations, user_id, allocation_id):
        if allocation_id:
            for item in allocations:
                if item['allocation_id'] == allocation_id:
                    return item

        for item in allocations:
            carry_participant_user = CarryParticipantUser.objects.filter(
                user_id=user_id,
                carry_participant=item['carry_participant_id']
            ).first()
            if carry_participant_user:
                if item['carry_participant_id'] == carry_participant_user.carry_participant.id:
                    return item
        return None

    @staticmethod
    def get_vesting_schedule_info(vesting_schedule):
        return VestingScheduleBaseInfoSerializer(vesting_schedule).data

    @staticmethod
    def get_latest_carry_pools(carry_plan_ids, companies):
        carry_pools = CarryPool.objects.filter(
            carry_plan__id__in=carry_plan_ids,
            company__in=companies
        ).order_by('carry_plan_id', 'company_id', '-created_at')

        latest_carry_pools = {}
        for carry_pool in carry_pools:
            key = (carry_pool.carry_plan_id, carry_pool.company_id)
            if key not in latest_carry_pools:
                latest_carry_pools[key] = carry_pool

        return latest_carry_pools

    def add_allocation_info(self, data):
        carry_plan_pks = set(item.get('carry_plan') for item in data)
        carry_plans = CarryPlan.objects.filter(pk__in=carry_plan_pks).in_bulk()
        latest_carry_pools = self.get_latest_carry_pools(carry_plan_pks, self.companies)
        vesting_schedules = VestingSchedule.objects.filter(company__in=self.companies).in_bulk()

        for item in data:
            carry_plan = carry_plans.get(item.get('carry_plan'))
            if carry_plan:
                carry_pool = latest_carry_pools[(carry_plan.id, carry_plan.company_id)]
                allocation = self.get_allocation_for_user(
                    carry_pool.allocations,
                    item['user'],
                    item['allocation_id']
                )

                item['carry_plan_name'] = carry_plan.name
                if allocation:
                    vesting_schedule_id = allocation['vesting_schedule']
                    vesting_schedule = vesting_schedules[vesting_schedule_id]
                    carry_participant = CarryParticipant.objects.get(id=allocation['carry_participant_id'])
                    item['bps'] = allocation.get('bps', 0)
                    item['display_name'] = carry_participant.get_full_name()
                    item['vesting_schedule'] = self.get_vesting_schedule_info(vesting_schedule)
                    item['entity'] = carry_participant.get_entity_display()
                else:
                    item['bps'] = 0
                    item['display_name'] = 'Unavailable'
                    item['vesting_schedule'] = 'Unavailable'

    def compile(self):
        data = []
        participant_carry_documents = ParticipantCarryDocument.objects.filter(
            company__in=self.companies,
            user_id__in=self.users
        )
        if self.released_filter:
            participant_carry_documents = participant_carry_documents.filter(is_released=True)
        participant_carry_documents = participant_carry_documents.select_related(
            'carry_document__document',
            'user',
            'signed_document'
        )
        if participant_carry_documents.exists():
            data = CarryDocumentParticipantSerializer(
                participant_carry_documents,
                many=True).data
            self.add_allocation_info(data)
        return data

    def compile_by_allocation_id(self, allocation_id):
        data = []
        participant_carry_documents = ParticipantCarryDocument.objects.filter(
            allocation_id=allocation_id,
            is_released=True,
            company__in=self.companies
        )
        participant_carry_documents = participant_carry_documents.select_related(
            'carry_document__document',
            'user',
            'signed_document'
        )
        if participant_carry_documents.exists():
            data = CarryDocumentParticipantSerializer(
                participant_carry_documents,
                many=True).data
            self.add_allocation_info(data)
        return data

    def compile_by_external_id(self, external_id):
        data = []
        carry_pool = CarryPool.objects.filter(
            company__in=self.companies,
            external_id=external_id
        ).order_by('-created_at')[:1]
        if not carry_pool.exists():
            return data

        carry_plan = carry_pool.first().carry_plan
        participant_carry_documents = ParticipantCarryDocument.objects.filter(
            company__in=self.companies,
            user_id__in=self.users,
            carry_plan=carry_plan
        )
        if self.released_filter:
            participant_carry_documents = participant_carry_documents.filter(is_released=True)

        participant_carry_documents = participant_carry_documents.select_related(
            'carry_document__document',
            'user',
            'signed_document'
        )

        if participant_carry_documents.exists():
            data = CarryDocumentParticipantSerializer(
                participant_carry_documents,
                many=True).data
            self.add_allocation_info(data)
        return data

    def pending_documents_count(self):
        qs = ParticipantCarryDocument.objects.filter(
            company__in=self.companies,
            user_id__in=self.users,
            is_released=True
        )
        acknowledgment_count = qs.filter(
            carry_document__require_signature=False
        ).count()
        pending_acknowledgment_count = qs.filter(
            carry_document__require_signature=False, is_acknowledged=False
        ).count()
        pending_signature_count = qs.filter(
            completed=False, carry_document__require_signature=True
        ).count()
        return {
            'count': pending_acknowledgment_count + pending_signature_count,
            'acknowledgment_count': acknowledgment_count,
            'pending_acknowledgment_count': pending_acknowledgment_count,
            'pending_signature_count': pending_signature_count
        }
