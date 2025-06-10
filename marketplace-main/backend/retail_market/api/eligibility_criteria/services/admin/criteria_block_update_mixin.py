from django.db.models import F

from api.eligibility_criteria.models import CriteriaBlock, CriteriaBlockConnector, FundEligibilityCriteria


class CriteriaBlockPositionUpdateMixin:
    @staticmethod
    def get_auto_generated_next_block(criteria_block: CriteriaBlock):
        criteria_blocks_qs = CriteriaBlock.objects.filter(criteria=criteria_block.criteria)
        user_documents_block = criteria_blocks_qs.filter(
            is_user_documents_step=True
        ).first()
        if user_documents_block:
            return user_documents_block

        final_step_block = criteria_blocks_qs.filter(is_final_step=True).first()
        return final_step_block

    def get_next_block(self, criteria_block: CriteriaBlock):
        later_blocks = self.get_later_blocks(criteria_block=criteria_block)
        next_block = later_blocks.first()

        if not next_block:
            next_block = self.get_auto_generated_next_block(criteria_block=criteria_block)

        return next_block

    @staticmethod
    def get_block_by_position(criteria: FundEligibilityCriteria, position: int):
        return CriteriaBlock.objects.filter(
            criteria=criteria,
            position=position
        ).first()

    @staticmethod
    def get_previous_block(criteria_block: CriteriaBlock):
        criteria_blocks_qs = CriteriaBlock.objects.filter(criteria=criteria_block.criteria)
        previous_block = criteria_blocks_qs.filter(
            position__lt=criteria_block.position
        ).order_by('-position').first()

        if not previous_block:
            previous_block = criteria_blocks_qs.filter(is_country_selector=True).first()
        return previous_block

    @staticmethod
    def get_later_blocks(criteria_block):
        return CriteriaBlock.objects.filter(
            criteria=criteria_block.criteria,
            position__gt=criteria_block.position
        ).order_by('position')

    def decrement_later_blocks_position(self, criteria_block: CriteriaBlock):
        self.get_later_blocks(criteria_block=criteria_block).update(position=F('position') - 1)

    def increment_later_blocks_position(self, criteria_block: CriteriaBlock):
        self.get_later_blocks(criteria_block=criteria_block).update(position=F('position') + 1)

    @staticmethod
    def delete_block_connectors(criteria_block):
        criteria_block.block_connected_to.all().delete()

    @staticmethod
    def connect_blocks(from_block: CriteriaBlock, to_block: CriteriaBlock):
        if not (from_block and to_block):
            return
        CriteriaBlockConnector.objects.create(
            from_block=from_block,
            to_block=to_block,
            condition='AND'
        )
