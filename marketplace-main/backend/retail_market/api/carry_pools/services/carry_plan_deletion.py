from django.db.transaction import atomic

from api.carry_pools.models import CarryPlan, FundCarryPlan, DealCarryPlan, AllocationAction, CarryDocument, \
    ParticipantCarryDocument, FundRealization, CarryPool
from api.companies.models import Company


class CarryPlanDeletion:
    def __init__(self, carry_plan: CarryPlan, company: Company):
        self.company = company
        self.carry_plan = carry_plan

    def delete(self):
        carry_plan = self.carry_plan

        with atomic():
            FundRealization.objects.filter(
                fund_carry_plan__carry_plan=carry_plan,
                company=self.company
            ).update(deleted=True)

            FundCarryPlan.objects.filter(
                carry_plan=carry_plan
            ).update(deleted=True)

            DealCarryPlan.objects.filter(
                carry_plan=carry_plan
            ).update(deleted=True)

            ParticipantCarryDocument.objects.filter(
                carry_plan=carry_plan,
                company=self.company
            ).update(deleted=True)

            for carry_pool in carry_plan.carry_pools.all():
                AllocationAction.objects.filter(base_pool_id=carry_pool.external_id).update(deleted=True)

            carry_plan.carry_pools.update(deleted=True)
            for carry_document in carry_plan.associated_carry_documents.all():
                # For soft deleting this we will need to add a bridge table and bigger refactor
                # we can add back document to carry plan if needed
                carry_document.carry_plans.remove(carry_plan)

            carry_plan.deleted = True
            carry_plan.save()
