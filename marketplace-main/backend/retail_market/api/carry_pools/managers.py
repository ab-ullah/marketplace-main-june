from django.db.models import OuterRef
from core.managers.has_company_filter_manager import HasCompanyFilterManager


class CarryPoolManager(HasCompanyFilterManager):

    def last_carry_pool_qs(self):
        return self.get_queryset().filter(
            carry_plan=OuterRef('pk'),
        ).order_by('-created_at')[:1]

    def last_carry_pool_for_user_qs(self, user_id):
        return self.get_queryset().filter(
            carry_plan=OuterRef('pk'),
            allocations__contains=[{'user_id': user_id}],
        ).order_by('-created_at')[:1]


class ParticipantCarryDocumentManager(HasCompanyFilterManager):
    def get_queryset(self):
        return super().get_queryset().filter(
            deleted=False,
            carry_document__document__deleted=False
        ).exclude(
            signed_document__deleted=True
        )
