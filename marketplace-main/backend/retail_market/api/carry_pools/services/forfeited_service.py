from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db.models import Sum

from api.carry_pools.models import AllocationAction


class ForfeitedService:

    def validate_forfeited_deletion(self, record_to_delete):
        if record_to_delete.type != AllocationAction.Type.FORFEIT:
            return False

        base_pool_id = record_to_delete.base_pool_id
        related_records = AllocationAction.objects.filter(
            base_pool_id=base_pool_id,
            deleted=False
        )
        total_bps = Decimal('0')
        for allocation in related_records.values_list('allocation_id', flat=True).distinct():
            original_bps = related_records.filter(
                allocation_id=allocation,
                type=AllocationAction.Type.CREATE
            ).aggregate(bps=Sum('bps'))['bps'] or Decimal('0')

            forfeited_bps = related_records.filter(
                allocation_id=allocation,
                type=AllocationAction.Type.FORFEIT
            ).aggregate(bps=Sum('bps'))['bps'] or Decimal('0')

            net_bps = original_bps - forfeited_bps
            total_bps += net_bps

        # 2. Add the bps of the record we are about to delete (it will be "re-added" to pool)
        total_bps += record_to_delete.bps

        if total_bps > 100:
            raise ValidationError(f"Cannot delete forfeited record: total BPS would exceed 100 ({total_bps})")
        return True

    def delete_forfeiture_action(self, record):
        if not self.validate_forfeited_deletion(record):
            return False
        record.deleted = True
        record.save(update_fields=["deleted"])
        return True
