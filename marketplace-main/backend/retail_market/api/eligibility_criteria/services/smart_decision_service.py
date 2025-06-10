from api.eligibility_criteria.blocks_data.block_ids import KNOWLEDGE_EMPLOYEE_ID, NO_LOCAL_REQUIREMENT_BLOCK_ID
from api.eligibility_criteria.models import (
    CriteriaBlock, CriteriaBlockConnector, CriteriaBlockResponse, FundEligibilityCriteria, EligibilityCriteriaResponse
)



class SmartDecisionBlockService:
    def __init__(self, initial_data):
        self.initial_data = initial_data

    @staticmethod
    def create(criteria: FundEligibilityCriteria, validated_data):
        to_block = validated_data['to_block']
        if to_block.is_final_step:
            validated_data['to_block'] = criteria.criteria_blocks.get(is_user_documents_step=True)

        smart_block_connector, __ = CriteriaBlockConnector.objects.get_or_create(
            from_block=validated_data['from_block'],
            to_block=validated_data['to_block'],
            from_option=validated_data.get('from_option')
        )

        return smart_block_connector

    @staticmethod
    def previous_block(
            criteria_block: CriteriaBlock,
            criteria_response: EligibilityCriteriaResponse,
            exclude_nlc=True
    ):
        from api.eligibility_criteria.services.calculate_eligibility import CalculateEligibilityService
        if criteria_block.is_user_documents_step:
            if criteria_response and criteria_response.last_position:
                last_block = CriteriaBlock.objects.filter(id=criteria_response.last_position).first()
                if last_block and last_block != criteria_block:
                    return last_block

        if not criteria_response.criteria.is_smart_criteria:
            criteria_blocks = criteria_block.criteria.criteria_blocks.exclude(
                block__is_admin_only=True
            ).exclude(
                is_custom_logic_block=True
            )
            if criteria_block.position:
                return criteria_blocks.filter(position__lt=criteria_block.position).order_by('-position').first()
            else:
                criteria_blocks = criteria_blocks.filter(position__isnull=False)
                if exclude_nlc:
                    criteria_blocks = criteria_blocks.exclude(block__block_id=NO_LOCAL_REQUIREMENT_BLOCK_ID)

                return criteria_blocks.order_by('-position').first()

        block_ids = CalculateEligibilityService(
            user_response=criteria_response
        ).parse_criteria_blocks_new(exclude_nlc=True, get_ids=True)
        from_block_ids = []

        connectors = criteria_block.block_connected_from.all()
        for connector in connectors:
            from_block_ids.append(connector.from_block_id)

        previous_block_id = None
        for block_id in block_ids:
            if block_id == criteria_block.id:
                if previous_block_id:
                    return CriteriaBlock.objects.get(id=previous_block_id)
                break
            previous_block_id = block_id

        return CriteriaBlock.objects.filter(
            id__in=block_ids,
            is_country_selector=False
        ).order_by('position').first()

    def get_selected_option(self, criteria_block, selected_value):
        options = criteria_block.block.options['individual']
        is_knowledge_employee = criteria_block.block.block_id == KNOWLEDGE_EMPLOYEE_ID
        if is_knowledge_employee:
            options = criteria_block.payload.get('options', [])

        selected_option = next(
            (option
            for option in options if option.get('id') == selected_value),
            {}
        )

        return selected_option.get('logical_id') if is_knowledge_employee else selected_option.get('id')

    def next_block(self,  exclude_nlc=True):
        connector = None
        next_block = None
        criteria = FundEligibilityCriteria.objects.get(
            id=self.initial_data['eligibility_criteria_id']
        )
        criteria_blocks = criteria.criteria_blocks.exclude(is_custom_logic_block=True)

        block_id = self.initial_data.get('block_id')
        if not block_id:
            country_block =  criteria_blocks.filter(is_country_selector=True).first()
            if country_block:
                return country_block

            next_block = criteria_blocks.get(position=1)
        else:
            criteria_block = CriteriaBlock.objects.get(id=block_id)
            if not criteria.is_smart_criteria and criteria_block.position:
                return criteria_blocks.filter(
                    is_custom_logic_block=False,
                    position__gt=criteria_block.position
                ).exclude(block__is_admin_only=True).order_by('position').first()

            response_json = self.initial_data.get('response_json')
            if response_json:
                from_option = None
                selected_value = response_json.get('value')
                if f'{selected_value}_option' in response_json and not criteria_block.is_custom_block:
                    from_option = self.get_selected_option(criteria_block, selected_value)

                if criteria_block.is_custom_block:
                    if criteria_block.custom_block.is_multiple_selection_enabled:
                        from_option = next(
                            (key for key, value in response_json.items() if value == True), None
                        )
                    else:
                        from_option = response_json.get('value')

                if from_option:
                    connector = criteria_block.block_connected_to.filter(from_option=from_option).first()

            if not connector:
                connector = criteria_block.block_connected_to.filter(from_option__isnull=True).first()

            if connector:
                next_block = connector.to_block

            if not next_block and criteria_block.position:
                next_position_block = criteria_blocks.filter(position__gt=criteria_block.position).order_by('position').first()
                if next_position_block:
                    if next_position_block.is_final_step or next_position_block.is_user_documents_step:
                        next_block = next_position_block


        if exclude_nlc:
            if next_block and next_block.block and next_block.block.is_admin_only:
                connector = next_block.block_connected_to.first()
                if connector:
                    next_block = connector.to_block

        return next_block
