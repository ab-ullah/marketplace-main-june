from api.eligibility_criteria.services.calculate_eligibility import CalculateEligibilityService
from api.eligibility_criteria.models import EligibilityCriteriaResponse, CriteriaBlock, CriteriaBlockResponse, \
    CustomSmartBlockField
from api.eligibility_criteria.serializers import ResponseBlockDocumentReadSerializer


class EligibilityResponseDocuments:
    def __init__(self, criteria_response: EligibilityCriteriaResponse):
        self.criteria_response = criteria_response

    @staticmethod
    def get_criteria_block_options(criteria_block: CriteriaBlock):
        if criteria_block.payload and criteria_block.payload.get('options'):
            return criteria_block.payload['options']

        if criteria_block.block and criteria_block.block.options:
            return criteria_block.block.options.get('individual', [])

        return []

    @staticmethod
    def get_matching_option(options, value):
        for option in options:
            if not option.get('requirement_text'):
                continue
            if option.get('id') == value:
                return option

    @staticmethod
    def get_document_payload_for_field(
            custom_field: CustomSmartBlockField,
            user_response_block: CriteriaBlockResponse,
            uploaded_documents_map

    ):
        required_documents = custom_field.required_documents
        return {
            'options': [
                {
                    'id': str(custom_field.id),
                    'requirement_text': required_documents['description'],
                    'text': custom_field.title,
                    'require_files': True
                }
            ],
            'response_block_id': user_response_block.id,
            'requirement_text': required_documents['description'],
            'documents': uploaded_documents_map.get(
                required_documents['description'], []
            )
        }

    def process_single_option_custom_block(self, user_response_block: CriteriaBlockResponse, uploaded_documents_map):
        response_json = user_response_block.response_json
        if not response_json:
            return []

        selected_option = response_json.get('value')
        if not selected_option:
            return []

        try:
            selected_field = CustomSmartBlockField.objects.get(id=selected_option)
        except CustomSmartBlockField.DoesNotExist:
            return []
        if not selected_field.required_documents:
            return []

        return [self.get_document_payload_for_field(
            custom_field=selected_field,
            user_response_block=user_response_block,
            uploaded_documents_map=uploaded_documents_map
        )]

    def proces_custom_block(self, user_response_block: CriteriaBlockResponse, uploaded_documents_map):
        response_json = user_response_block.response_json
        if not response_json:
            return []

        if not user_response_block.block.custom_block.is_multiple_selection_enabled:
            return self.process_single_option_custom_block(
                user_response_block=user_response_block,
                uploaded_documents_map=uploaded_documents_map
            )

        documents_info = []
        custom_fields = user_response_block.block.custom_block.custom_fields.filter(parent_field__isnull=True)
        for custom_field in custom_fields:
            required_documents = custom_field.required_documents
            payload_key = str(custom_field.id)
            if response_json.get(payload_key) is not True or not required_documents:
                continue

            document_payload = self.get_document_payload_for_field(
                custom_field=custom_field,
                user_response_block=user_response_block,
                uploaded_documents_map=uploaded_documents_map
            )
            documents_info.append(document_payload)

        return documents_info

    def get_required_documents(self):
        user_response = self.criteria_response
        eligibility_service = CalculateEligibilityService(user_response=user_response)
        criteria_blocks = eligibility_service.parse_criteria_blocks_new()
        documents_info = []
        for user_response_block in user_response.user_block_responses.all():
            uploaded_documents_map = {}
            if not user_response_block.block or user_response_block.block not in criteria_blocks:
                continue

            payload = user_response_block.response_json
            if not payload:
                continue

            documents = user_response_block.response_block_documents.all()
            documents_data = ResponseBlockDocumentReadSerializer(documents, many=True).data

            for document in documents_data:
                options = document['payload'].get('options', [])
                if not options:
                    continue
                requirement_text = options[0]['requirement_text']
                if requirement_text in uploaded_documents_map:
                    uploaded_documents_map[requirement_text].append(document)
                else:
                    uploaded_documents_map[requirement_text] = [document]

            if user_response_block.block.custom_block:
                documents_info.extend(self.proces_custom_block(
                    user_response_block=user_response_block,
                    uploaded_documents_map=uploaded_documents_map
                ))
                continue

            value = payload.get('value')
            # Need to handle checkbox here
            options = self.get_criteria_block_options(user_response_block.block)
            if value:
                matching_option = self.get_matching_option(options=options, value=value)
                if matching_option:
                    documents_info.append({
                        'options': [matching_option],
                        'response_block_id': user_response_block.id,
                        'requirement_text': matching_option['requirement_text'],
                        'documents': uploaded_documents_map.get(
                            matching_option['requirement_text'], []
                        )
                    })
            else:
                documents_map = {}
                for k, v in payload.items():
                    if not v:
                        continue
                    matching_option = self.get_matching_option(options=options, value=k)
                    if matching_option:
                        map_key = matching_option['requirement_text']
                        if map_key in documents_map:
                            documents_map[map_key]['options'].append(matching_option)
                        else:
                            documents_map[map_key] = {
                                'response_block_id': user_response_block.id,
                                'options': [matching_option],
                                'requirement_text': matching_option['requirement_text'],
                                'documents': uploaded_documents_map.get(
                                    matching_option['requirement_text'], []
                                )
                            }
                documents_info.extend(list(documents_map.values()))
        return documents_info
