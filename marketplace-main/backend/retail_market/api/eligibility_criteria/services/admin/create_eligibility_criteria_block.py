import uuid

from api.eligibility_criteria.blocks_data.block_ids import KNOWLEDGE_EMPLOYEE_ID
from api.eligibility_criteria.constants.conditions import AND_CONDITION
from api.eligibility_criteria.models import CriteriaBlock, CriteriaBlockConnector, FundEligibilityCriteria


class CreateEligibilityCriteriaBlockService:
    @staticmethod
    def update_expression(criteria: FundEligibilityCriteria, criteria_block: CriteriaBlock):
        if not criteria.get_has_custom_logic_block():
            return

        if criteria.custom_expression:
            custom_expression = criteria.custom_expression
            custom_expression.extend(
                [
                    {
                        'id': 'and',
                        'text': 'AND'
                    },
                    {
                        'id': criteria_block.id,
                        'text': criteria_block.block_title
                    }
                ]
            )
            criteria.save(update_fields=['custom_expression'])

    @staticmethod
    def create(criteria: FundEligibilityCriteria, validated_data):
        validated_data['is_smart_block'] = is_smart_view = validated_data.pop('is_smart_view', False)
        current_latest_block = CriteriaBlock.objects.filter(
            criteria=criteria,
            position__isnull=False
        ).order_by('-position').first()
        max_position = current_latest_block.position
        validated_data['position'] = max_position + 1
        if not is_smart_view:
            CriteriaBlockConnector.objects.filter(from_block=current_latest_block).delete()

        if 'block' in validated_data:
            if validated_data['block'].block_id == KNOWLEDGE_EMPLOYEE_ID:
                options = [
                    {**option, 'logical_id': option['id'], 'id': uuid.uuid4().hex}
                    for option in validated_data['block'].options['individual']
                ]
                validated_data['payload'] = {'options': options}
        new_block = CriteriaBlock.objects.create(**validated_data)  # type: CriteriaBlock

        if not is_smart_view:
            CriteriaBlockConnector.objects.create(
                from_block=current_latest_block,
                to_block=new_block,
                condition=AND_CONDITION
            )
            last_block = CriteriaBlock.objects.filter(criteria=criteria, is_final_step=True).first()
            if last_block:
                CriteriaBlockConnector.objects.create(
                    from_block=new_block,
                    to_block=last_block,
                    condition=AND_CONDITION
                )
        CreateEligibilityCriteriaBlockService.update_expression(
            criteria=criteria,
            criteria_block=new_block,
        )
        return new_block
