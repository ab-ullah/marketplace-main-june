from api.eligibility_criteria.blocks_data.block_ids import SINGLE_OPTION_BLOCKS, CHECKBOX_BLOCKS, APPROVAL_CHECKBOX_ID, \
    I_AGREE_BLOCKS, HONG_KONG_BLOCK_ID
from api.eligibility_criteria.models import EligibilityCriteriaResponse, CriteriaBlock, CriteriaBlockResponse, \
    CustomSmartBlockField
from api.users.constants import FINANCIAL_ELIGIBILITY_REVIEWER, KNOWLEDGEABLE_ELIGIBILITY_REVIEWER
from api.eligibility_criteria.services.eval_eligibility_expression import EligibilityParser
from api.eligibility_criteria.services.smart_decision_service import SmartDecisionBlockService

SKIP_BLOCK_ATTRIBUTES = (
    'is_final_step',
    'is_user_documents_step',
)

DECISION_KEY = 'decision'
IS_FINANCIAL_KEY = 'is_financial'
IS_KNOWLEDGEABLE_KEY = 'is_knowledgeable'
ENFORCE_FINANCIAL_REVIEW = 'enforce_financial_review'


class CalculateEligibilityService:
    def __init__(self, user_response: EligibilityCriteriaResponse):
        self.user_response = user_response
        self.criteria = user_response.criteria
        self.expression_override = self.criteria.expression_override

    def get_next_block(self, criteria_block, exclude_nlc):
        try:
            user_response = criteria_block.user_responses.get(criteria_response=self.user_response)
            response_json = user_response.response_json
        except CriteriaBlockResponse.DoesNotExist:
            response_json = {}

        initial_data = {
            'block_id': criteria_block.id,
            'response_json': response_json,
            'eligibility_criteria_id': self.criteria.id
        }
        return SmartDecisionBlockService(initial_data=initial_data).next_block(exclude_nlc=exclude_nlc)

    # def get_previous_block(self, criteria_block, exclude_nlc):
    #     return SmartDecisionBlockService.previous_block(criteria_block=criteria_block, exclude_nlc=exclude_nlc)

    def get_connected_block_ids(self, block_id, exclude_nlc, _func):
        connected_block_ids = []
        criteria_block = self.criteria.criteria_blocks.get(id=block_id)
        connected_block = _func(criteria_block=criteria_block, exclude_nlc=exclude_nlc)
        if connected_block:
            connected_block_ids.append(connected_block.id)

        while connected_block is not None:
            connected_block = _func(criteria_block=connected_block, exclude_nlc=exclude_nlc)
            if connected_block:
                connected_block_ids.append(connected_block.id)

        return connected_block_ids

    def get_first_position_block(self):
        return self.criteria.criteria_blocks.order_by('position').first()

    def get_starting_block(self):
        last_position = self.user_response.last_position
        try:
            return self.criteria.criteria_blocks.get(id=last_position)
        except CriteriaBlock.DoesNotExist:
            return self.get_first_position_block()

    def parse_criteria_blocks_new(self, exclude_nlc=True, get_ids=False):
        if not self.criteria.is_smart_criteria:
            block_ids = self.criteria.criteria_blocks.values_list('id', flat=True)
        else:
            starting_block = self.get_first_position_block()
            block_ids = [starting_block.id]
            block_ids.extend(self.get_connected_block_ids(
                block_id=starting_block.id, exclude_nlc=exclude_nlc, _func=self.get_next_block))

        criteria_blocks = self.criteria.criteria_blocks.filter(
            is_custom_logic_block=False
        )

        if get_ids:
            return block_ids

        if block_ids:
            criteria_blocks = criteria_blocks.filter(id__in=block_ids)

        return criteria_blocks.prefetch_related(
            'block'
        ).prefetch_related(
            'block_connected_to'
        ).prefetch_related(
            'criteria_block_documents'
        ).order_by('position').all()

    def parse_criteria_blocks(self, exclude_nlc=True):
        block_ids = []
        criteria_blocks = self.criteria.criteria_blocks
        starting_block = self.get_first_position_block()
        if starting_block:
            block_ids.append(starting_block.id)
            # block_ids.extend(self.get_connected_block_ids(
            #     block_id=starting_block.id, exclude_nlc=exclude_nlc, _func=self.get_previous_block))
            block_ids.extend(self.get_connected_block_ids(
                block_id=starting_block.id, exclude_nlc=exclude_nlc, _func=self.get_next_block))

        if block_ids:
            criteria_blocks = criteria_blocks.filter(id__in=block_ids)

        return criteria_blocks.prefetch_related(
            'block'
        ).prefetch_related(
            'block_connected_to'
        ).prefetch_related(
            'criteria_block_documents'
        ).order_by('position').all()

    def parse_response_blocks(self):
        response_blocks = self.user_response.user_block_responses.prefetch_related(
            'block'
        ).all()
        response_by_block_id = {}
        for response_block in response_blocks:
            response_by_block_id[response_block.block_id] = response_block.response_json
        return response_by_block_id

    @staticmethod
    def can_skip(criteria_block: CriteriaBlock):
        if not criteria_block.block and not criteria_block.custom_block:
            return True
        for attr in SKIP_BLOCK_ATTRIBUTES:
            if getattr(criteria_block, attr):
                return True
        if criteria_block.block and criteria_block.block.is_admin_only:
            return True
        if criteria_block.is_custom_logic_block:
            return True
        if criteria_block.auto_completed:
            return True
        return False

    @staticmethod
    def get_block_options(criteria_block: CriteriaBlock):
        if criteria_block.payload and criteria_block.payload.get('options'):
            return criteria_block.payload['options']
        if criteria_block.block.options:
            return criteria_block.block.options.get('individual')
        return []

    def validate_single_option_block(self, response_payload, criteria_block: CriteriaBlock):
        options = self.get_block_options(criteria_block=criteria_block)
        value = response_payload.get('value')
        if not value:
            return {DECISION_KEY: False}
        for option in options:
            if option['id'] == value:
                return {
                    DECISION_KEY: option['logical_value'],
                    IS_FINANCIAL_KEY: option.get(IS_FINANCIAL_KEY),
                    ENFORCE_FINANCIAL_REVIEW: option.get(ENFORCE_FINANCIAL_REVIEW),
                    IS_KNOWLEDGEABLE_KEY: option.get(IS_KNOWLEDGEABLE_KEY),
                }
        return {DECISION_KEY: False}

    @staticmethod
    def validate_i_agree_block(response_payload):
        value = response_payload.get('value', False)
        return {DECISION_KEY: bool(value)}

    def validate_multi_option_block(self, response_payload, criteria_block: CriteriaBlock):
        options = self.get_block_options(criteria_block=criteria_block)
        is_valid = True
        for option in options:
            selected_answer = bool(response_payload.get(option['id'], False))
            selected_logical_value = option['logical_value'] == selected_answer
            is_valid = is_valid and selected_logical_value
        return {DECISION_KEY: is_valid}

    @staticmethod
    def validate_approval_checkboxes(response_payload, criteria_block: CriteriaBlock):
        for approval_document in criteria_block.criteria_block_documents.all():
            document_key = f'{criteria_block.block.block_id}_{approval_document.document_id}'
            if not response_payload.get(document_key):
                return {DECISION_KEY: False}
        return {DECISION_KEY: True}

    @staticmethod
    def validate_single_option_smart_block(response_payload, criteria_block: CriteriaBlock):
        selected_option = response_payload.get('value')
        is_eligible = False
        require_knowledgeable_reviewer = False
        require_financial_reviewer = False
        if not selected_option:
            return {
                DECISION_KEY: is_eligible,
                IS_FINANCIAL_KEY: require_financial_reviewer,
                ENFORCE_FINANCIAL_REVIEW: require_financial_reviewer,
                IS_KNOWLEDGEABLE_KEY: require_knowledgeable_reviewer,
            }

        try:
            selected_field = CustomSmartBlockField.objects.get(id=selected_option)
        except CustomSmartBlockField.DoesNotExist:
            return {
                DECISION_KEY: is_eligible,
                IS_FINANCIAL_KEY: require_financial_reviewer,
                ENFORCE_FINANCIAL_REVIEW: require_financial_reviewer,
                IS_KNOWLEDGEABLE_KEY: require_knowledgeable_reviewer,
            }

        if FINANCIAL_ELIGIBILITY_REVIEWER in selected_field.reviewers_required:
            require_financial_reviewer = True
        if KNOWLEDGEABLE_ELIGIBILITY_REVIEWER in selected_field.reviewers_required:
            require_knowledgeable_reviewer = True


        return {
            DECISION_KEY: selected_field.marks_as_eligible,
            IS_FINANCIAL_KEY: require_financial_reviewer,
            ENFORCE_FINANCIAL_REVIEW: require_financial_reviewer,
            IS_KNOWLEDGEABLE_KEY: require_knowledgeable_reviewer,
        }

    def validate_custom_block(self, response_payload, criteria_block: CriteriaBlock):
        if not criteria_block.custom_block.is_multiple_selection_enabled:
            return self.validate_single_option_smart_block(
                response_payload=response_payload,
                criteria_block=criteria_block
            )

        is_eligible = False
        require_knowledgeable_reviewer = False
        require_financial_reviewer = False
        custom_fields = criteria_block.custom_block.custom_fields.filter(parent_field__isnull=True).all()
        # I think this needs to change such that if you select
        # any field that is elibable you are eligible
        # if you select any field that is marked as in-eligible, then you are not eligible
        # if you do not select a field, I think we may need to continue
        ineligible_field = False
        for field in custom_fields:
            payload_key = str(field.id)
            selected_answer = bool(response_payload.get(payload_key, False))

            if selected_answer:
                # User has chosen a field
                # if ! eligble, then you are not eligible
                if field.marks_as_eligible == False:
                    ineligible_field = True
                else:
                    is_eligible = True

            # selected_logical_value = selected_answer == field.marks_as_eligible
            # is_eligible = is_eligible and selected_logical_value
            if selected_answer:
                if FINANCIAL_ELIGIBILITY_REVIEWER in field.reviewers_required:
                    require_financial_reviewer = True
                if KNOWLEDGEABLE_ELIGIBILITY_REVIEWER in field.reviewers_required:
                    require_knowledgeable_reviewer = True

        if ineligible_field:
            # override the eligibility
            is_eligible = False

        return {
            DECISION_KEY: is_eligible,
            IS_FINANCIAL_KEY: require_financial_reviewer,
            ENFORCE_FINANCIAL_REVIEW: require_financial_reviewer,
            IS_KNOWLEDGEABLE_KEY: require_knowledgeable_reviewer,
        }

    def get_block_decision(self, response_payload, criteria_block: CriteriaBlock):
        if criteria_block.custom_block:
            return self.validate_custom_block(response_payload=response_payload, criteria_block=criteria_block)
        block_id = criteria_block.block.block_id
        if block_id in SINGLE_OPTION_BLOCKS:
            return self.validate_single_option_block(response_payload=response_payload, criteria_block=criteria_block)
        if block_id in CHECKBOX_BLOCKS:
            return self.validate_multi_option_block(response_payload=response_payload, criteria_block=criteria_block)
        if block_id in I_AGREE_BLOCKS:
            return self.validate_i_agree_block(response_payload=response_payload)
        if block_id == APPROVAL_CHECKBOX_ID:
            return self.validate_approval_checkboxes(response_payload=response_payload, criteria_block=criteria_block)
        return False

    @staticmethod
    def get_condition(criteria_block: CriteriaBlock):
        for connected_to in criteria_block.block_connected_to.all():
            return connected_to.condition
        return None

    def update_response(self, is_eligible: bool, is_knowledgeable: bool, is_financial: bool):
        user_response = self.user_response
        updated_fields = []
        if user_response.is_eligible != is_eligible:
            user_response.is_eligible = is_eligible
            updated_fields.append('is_eligible')

        if user_response.is_knowledgeable != is_knowledgeable:
            user_response.is_knowledgeable = is_knowledgeable
            updated_fields.append('is_knowledgeable')

        if user_response.is_financial != is_financial:
            user_response.is_financial = is_financial
            updated_fields.append('is_financial')

        if updated_fields:
            user_response.save(update_fields=updated_fields)

    def calculate(self):
        criteria_blocks = self.parse_criteria_blocks_new()
        response_blocks = self.parse_response_blocks()
        decision = True
        is_knowledgeable = False
        is_financial = False
        enforce_financial_review = False
        logical_condition = None
        criteria_by_block = {}
        block_decision_by_id = {}

        for criteria_block in criteria_blocks:
            if self.can_skip(criteria_block=criteria_block):
                continue
            response = response_blocks.get(criteria_block.id)
            if not response:
                block_decision = False
            else:
                block_decision_detail = self.get_block_decision(
                    response_payload=response,
                    criteria_block=criteria_block
                )
                block_decision = block_decision_detail[DECISION_KEY]
                criteria_by_block["{}".format(criteria_block.position)] = block_decision
                block_decision_by_id[str(criteria_block.id)] = block_decision

                option_is_knowledgeable = block_decision_detail.get(IS_KNOWLEDGEABLE_KEY)
                if option_is_knowledgeable is not None:
                    is_knowledgeable = is_knowledgeable or option_is_knowledgeable

                option_is_financial = block_decision_detail.get(IS_FINANCIAL_KEY)
                if option_is_financial is not None:
                    is_financial = is_financial or option_is_financial

                option_enforce_financial_review = block_decision_detail.get(ENFORCE_FINANCIAL_REVIEW)
                if option_enforce_financial_review is not None:
                    enforce_financial_review = enforce_financial_review or option_enforce_financial_review

            if logical_condition is None:
                decision = block_decision
            elif logical_condition == 'AND':
                decision = decision and block_decision
            elif logical_condition == 'OR':
                decision = decision or block_decision

            logical_condition = self.get_condition(criteria_block=criteria_block)

        if is_knowledgeable or (not is_financial and enforce_financial_review):
            is_financial = enforce_financial_review

        if self.criteria.get_has_custom_logic_block():
            decision = self.eval_custom_expression(
                block_decision_by_id=block_decision_by_id,
                skip_unvisited=self.criteria.is_smart_criteria)
        elif self.expression_override:
            decision = self.eval_bool_logic(criteria_by_block)

        self.update_response(is_eligible=decision, is_knowledgeable=is_knowledgeable, is_financial=is_financial)
        return decision

    def eval_custom_expression(self, block_decision_by_id, skip_unvisited):
        parser = EligibilityParser(block_decision_by_id, skip_unvisited=skip_unvisited)
        return parser.evaluate(self.criteria.parse_custom_expression())

    def eval_bool_logic(self, criteria_by_block):
        parser = EligibilityParser(criteria_by_block)
        return parser.evaluate(self.expression_override)