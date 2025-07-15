from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db.models import Sum

from api.carry_pools.models import AllocationAction
from api.carry_pools.services.prepare_allocation_format import PrepareAllocationFormatService


class ForfeitedService:

    def _validate_total_bps(self, current_bps, carry_plan_id, calculation_date):
        """
        Validates that the total BPS after including current_bps does not exceed 100.
        """
        result = PrepareAllocationFormatService(
            carry_plan_id=carry_plan_id
        ).get_formatted_data_for_allocations(calculation_date)

        total_bps = Decimal(result['allocated']) + Decimal(current_bps)
        if total_bps > 100:
            raise ValidationError(
                f"Total BPS would exceed 100: {total_bps}"
            )
        return True

    def delete_forfeiture_action(self, record, carry_plan_id, calculation_date):
        """
        Deletes the forfeited record after validation.
        """
        if record.type != AllocationAction.Type.FORFEIT:
            return False
        if not self._validate_total_bps(record.bps, carry_plan_id, calculation_date):
            return False
        record.deleted = True
        record.save(update_fields=["deleted"])
        return True

    def _validate_update_bps(self,record, new_bps, carry_plan_id, calculation_date):
        """
        Validates that the total BPS after including current_bps does not exceed 100.
        """
        result = PrepareAllocationFormatService(
            carry_plan_id=carry_plan_id
        ).get_formatted_data_for_allocations(calculation_date)

        total_bps = Decimal(result['allocated']) + Decimal(record.bps) - Decimal(new_bps)
        if total_bps > 100:
            raise ValidationError(
                f"Total BPS would exceed 100: {total_bps}"
            )
        return True

    def update_forfeiture_action(self, record, bps, carry_plan_id, calculation_date):
        """
        Validates the update operation for a forfeited record.
        """
        if record.type != AllocationAction.Type.FORFEIT:
            return False
        return self._validate_update_bps(record, bps, carry_plan_id, calculation_date)
