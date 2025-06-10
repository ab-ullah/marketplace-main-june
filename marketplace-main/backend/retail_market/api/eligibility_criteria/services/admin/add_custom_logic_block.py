from django.db.models import F

from api.eligibility_criteria.models import FundEligibilityCriteria, CriteriaBlock
from api.eligibility_criteria.services.eval_eligibility_expression import BOOL_OPERATORS

CUSTOM_LOGIC_OVERRIDE_POSITION = 2


class CustomLogicBlockService:
    def __init__(
            self,
            criteria: FundEligibilityCriteria,
            criteria_block_model=CriteriaBlock
    ):
        self.criteria = criteria
        self.criteria_block_model = criteria_block_model

    def already_has_custom_logic_block(self):
        return self.criteria_block_model.objects.filter(
            criteria=self.criteria,
            is_custom_logic_block=True
        ).exists()

    def create_block(self):
        self.criteria_block_model.objects.create(
            criteria=self.criteria,
            position=CUSTOM_LOGIC_OVERRIDE_POSITION,
            is_custom_logic_block=True
        )

    def update_positions(self):
        self.criteria_block_model.objects.filter(
            criteria=self.criteria,
            position__gt=1
        ).update(position=F('position') + 1)

    def create_initial_expression(self):
        expression_components = []
        for criteria_block in self.criteria.criteria_blocks.all():
            if not criteria_block.is_eligibility_block:
                continue

            if expression_components:
                expression_components.append({'id': 'AND', 'text': 'AND'})

            expression_components.append(
                {'id': str(criteria_block.id), 'text': criteria_block.block_title},
            )
        self.criteria.custom_expression = expression_components
        self.criteria.save(update_fields=['custom_expression'])

    @staticmethod
    def delete_block(expression: list, block_index: int, delete_next=False, delete_previous=False):
        del expression[block_index]
        if delete_next and len(expression) >= block_index:
            # after deletion the next one will move back to same index
            del expression[block_index]

        if delete_previous and len(expression) >= block_index - 1:
            del expression[block_index - 1]

    def handle_block_delete(self, criteria_block: CriteriaBlock):
        if not self.criteria.custom_expression:
            return

        custom_expression = self.criteria.custom_expression
        expression_length = len(custom_expression)
        block_ids = [str(expression['id']) for expression in custom_expression]
        try:
            block_index = block_ids.index(str(criteria_block.id))
        except:
            return

        print(block_index)
        # Case first block
        if block_index == 0:
            self.delete_block(expression=custom_expression, block_index=block_index, delete_next=True)

        # Case last block
        elif block_index == expression_length - 1:
            self.delete_block(expression=custom_expression, block_index=block_index, delete_previous=True)

        else:
            is_next_block_logical_operator = expression_length > block_index + 1 and custom_expression[
                block_index + 1]['id'].lower() in BOOL_OPERATORS
            is_previous_block_logical_operator = custom_expression[block_index - 1]['id'].lower() in BOOL_OPERATORS
            if is_next_block_logical_operator:
                self.delete_block(expression=custom_expression, block_index=block_index, delete_next=True)

            elif is_previous_block_logical_operator:
                self.delete_block(expression=custom_expression, block_index=block_index, delete_previous=True)

            else:
                self.delete_block(expression=custom_expression, block_index=block_index)

        self.criteria.custom_expression = custom_expression
        self.criteria.save(update_fields=['custom_expression'])

    def process(self, create_initial_expression=True):
        if self.already_has_custom_logic_block():
            return
        self.update_positions()
        self.create_block()
        # if create_initial_expression:
        #     self.create_initial_expression()
