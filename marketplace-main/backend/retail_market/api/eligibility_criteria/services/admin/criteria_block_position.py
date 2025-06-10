from django.db.models import F
from django.db.transaction import atomic

from api.eligibility_criteria.models import CriteriaBlock
from api.eligibility_criteria.services.admin.criteria_block_update_mixin import CriteriaBlockPositionUpdateMixin


class UpdateCriteriaBlockPosition(CriteriaBlockPositionUpdateMixin):
    def __init__(self, criteria_block: CriteriaBlock, new_position: int):
        self.criteria_block = criteria_block
        self.new_position = new_position
        self.current_position = criteria_block.position

    def process(self):
        if self.new_position == self.current_position:
            return

        with atomic():
            self.update_block_positions()
            current_block = self.get_block_by_position(
                criteria=self.criteria_block.criteria,
                position=self.new_position
            )

            self.criteria_block.position = self.new_position
            self.criteria_block.save()
            if current_block:
                self.update_connectors(current_block=current_block)

    def update_block_positions(self):
        base_qs = CriteriaBlock.objects.filter(criteria=self.criteria_block.criteria)
        if self.new_position > self.current_position:
            base_qs.filter(
                position__gt=self.current_position,
                position__lte=self.new_position
            ).update(position=F('position') - 1)

        elif self.new_position < self.current_position:
            base_qs.filter(
                position__gte=self.new_position,
                position__lt=self.current_position
            ).update(position=F('position') + 1)

    def update_connectors(self, current_block):
        new_block = self.criteria_block
        current_previous_block = self.get_previous_block(criteria_block=current_block)

        new_previous_block = self.get_previous_block(criteria_block=new_block)
        new_next_block = self.get_next_block(criteria_block=new_block)

        self.delete_block_connectors(criteria_block=current_previous_block)
        self.delete_block_connectors(criteria_block=new_block)
        self.delete_block_connectors(criteria_block=new_previous_block)

        self.connect_blocks(from_block=current_previous_block, to_block=new_block)
        self.connect_blocks(from_block=new_block, to_block=current_block)
        self.connect_blocks(from_block=new_previous_block, to_block=new_next_block)
