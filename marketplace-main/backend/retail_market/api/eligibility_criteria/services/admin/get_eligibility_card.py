from django.db.models import Q

from api.eligibility_criteria.blocks_data.block_ids import US_ACCREDITED_INVESTOR_ID
from api.eligibility_criteria.models import EligibilityCriteriaResponse, CriteriaBlockResponse, CriteriaBlock
from api.documents.models import CriteriaBlockDocument
from api.eligibility_criteria.serializers import CriteriaBlockDocumentSerializer
from api.eligibility_criteria.utils.eligibility_criteria import process_sub_options_and_text

ELIGIBILITY_CRITERIA_CARD_NAME = 'Eligibility Criteria'


class GetEligibilityCriteriaCard:
    def __init__(self, eligibility_criteria_response: EligibilityCriteriaResponse):
        self.eligibility_criteria_response = eligibility_criteria_response
        self.company = eligibility_criteria_response.criteria.fund.company

    @staticmethod
    def get_card():
        return {
            'name': ELIGIBILITY_CRITERIA_CARD_NAME,
            "order": 2,
        }

    @staticmethod
    def get_response_block_id(response_block: CriteriaBlockResponse):
        return f'{response_block.id}'

    @staticmethod
    def get_documents_description(documents):
        if documents is None or len(documents) == 0:
            return ""

        if documents[0]:
            document = documents[0]
            return document.get('payload', {}).get('options', [{}])[0].get('requirement_text', "")

    @staticmethod
    def get_documents(criteria_block_response: CriteriaBlockResponse):
        from api.eligibility_criteria.serializers import ResponseBlockDocumentReadSerializer
        documents = criteria_block_response.response_block_documents.all()
        return ResponseBlockDocumentReadSerializer(documents, many=True).data

    def get_agreement_document(self, criteria_block: CriteriaBlock):
        if criteria_block.block and criteria_block.block.block_id == 'AC':
            agreement_document = CriteriaBlockDocument.objects.filter(criteria_block=criteria_block)
            agreement_document = CriteriaBlockDocumentSerializer(agreement_document, many=True)
            return agreement_document.data
        else:
            return []

    def get_answer(self, criteria_block_response: CriteriaBlockResponse):
        answer_payload = criteria_block_response.response_json
        value = answer_payload.get('value')
        if not value:
            text_values = []
            for k, v in answer_payload.items():
                option_key = f'{k}_option'
                if v == True and answer_payload.get(option_key):
                    text_value = answer_payload[option_key].get('text')
                    if not text_value:
                        text_value = answer_payload[option_key].get('title')
                    text_values.append(text_value)
                    text_values.extend(process_sub_options_and_text(
                        answer_payload=answer_payload,
                        option_payload=answer_payload.get(option_key),
                        answer_value=k
                    ))
            return text_values

        if isinstance(value, bool):
            parsed_value = 'yes' if value else 'no'
            return [parsed_value]

        option_key = f'{value}_option'
        if answer_payload.get(option_key):
            if criteria_block_response.block.custom_block:
                return self.process_smart_block_answer(
                    answer_payload=answer_payload,
                    option_key=option_key,
                    value=value
                )
            return [answer_payload[option_key].get('text')]

        return [value]

    @staticmethod
    def process_smart_block_answer(answer_payload, option_key, value):
        selected_block = answer_payload[option_key]
        answers = [selected_block.get('title')]
        answers.extend(process_sub_options_and_text(
            answer_payload=answer_payload,
            option_payload=selected_block,
            answer_value=value
        ))

        return answers

    @staticmethod
    def get_sub_answer_details(criteria_block_response: CriteriaBlockResponse):
        """
        currently this is only done for accredited investor block
        later on we should make it more generic so that we can
        support hierarchy in other components also
        """
        sub_answer_details = []
        criteria_block = criteria_block_response.block
        if criteria_block.block and criteria_block.block.block_id != US_ACCREDITED_INVESTOR_ID:
            return sub_answer_details
        answer_payload = criteria_block_response.response_json
        value = answer_payload.get('value')
        option_key = f'{value}_option'
        if answer_payload.get(option_key):
            option = answer_payload[option_key]
            if option.get('has_selector_options'):
                # TODO: make the key regenerate-able
                selected_sub_option = answer_payload.get('license_type')
                if selected_sub_option:
                    sub_answer_details.append({
                        'label': 'Please Select License Type',
                        'value': selected_sub_option.get('value')
                    })
                    if selected_sub_option.get('require_text_details'):
                        sub_answer_details.append({
                            'label': 'Name the certificate',
                            'value': answer_payload.get('certificate_name', '')
                        })
        return sub_answer_details

    def process(self):
        card = self.get_card()
        schema = []
        for criteria_block_response in self.eligibility_criteria_response.user_block_responses.filter(
                block__is_final_step=False,
                block__is_country_selector=False,
                block__is_user_documents_step=False,
                block__auto_completed=False
        ).filter(
            Q(block__block__is_admin_only=False) | Q(block__custom_block__isnull=False)
        ).order_by('block__position').prefetch_related('block').prefetch_related('block__block'):
            criteria_block = criteria_block_response.block
            label = criteria_block.custom_block.title if criteria_block.custom_block else criteria_block.block.title
            question = {
                "id": self.get_response_block_id(response_block=criteria_block_response),
                "label": label,
                "type": "eligibility_criteria_response",
                'submitted_answer': {
                    'answer_values': self.get_answer(criteria_block_response=criteria_block_response),
                    'approval_documents': self.get_agreement_document(criteria_block=criteria_block),
                    'sub_answer_details': self.get_sub_answer_details(criteria_block_response=criteria_block_response)
                }
            }
            documents = self.get_documents(criteria_block_response=criteria_block_response)
            schema.append(question)
            if documents:
                document_question = {
                    "id": self.get_response_block_id(response_block=criteria_block_response)+'-view-only',
                    "label": 'Supporting Documentation',
                    "description": self.get_documents_description(documents),
                    "type": "eligibility_criteria_response",
                    'submitted_answer': {
                        'documents': documents,
                    }
                }
                schema.append(document_question)

        card['schema'] = schema
        return card
