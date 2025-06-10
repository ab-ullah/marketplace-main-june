def get_eligibility_criteria_name(eligibility_criteria):
    name_tags = []
    for criteria_region in eligibility_criteria.criteria_regions.select_related('region').all():
        name_tags.append(criteria_region.region.name)

    for criteria_country in eligibility_criteria.criteria_countries.select_related('country').all():
        name_tags.append(criteria_country.country.name)

    return ', '.join(name_tags)


def get_criteria_selected_region_country_codes(eligibility_criteria):
    region_codes = []
    country_codes = []
    for criteria_region in eligibility_criteria.criteria_regions.all():
        region_codes.append(f"RG|{criteria_region.region.region_code}")

    for criteria_country in eligibility_criteria.criteria_countries.all():
        country_codes.append(criteria_country.country.iso_code)

    return {
        'region_codes': region_codes,
        'country_codes': country_codes
    }


def create_eligibility_criteria_response_task(user, criteria_response):
    from api.eligibility_criteria.services.check_for_self_certification import \
        EligibilityResponseSelfCertification
    from api.eligibility_criteria.services.respose_review_service import \
        EligibilityCriteriaReviewService

    if not (criteria_response.is_knowledgeable or criteria_response.is_financial):
        EligibilityResponseSelfCertification.process(
            criteria_response=criteria_response
        )
    else:
        criteria_review_service = EligibilityCriteriaReviewService(
            eligibility_response_id=criteria_response.id,
            user=user
        )
        criteria_review_service.complete_user_task(workflow=criteria_response.workflow)
        criteria_review_service.start_review()


def process_sub_options_and_text(answer_value, option_payload, answer_payload):
    text_values = []
    if option_payload.get('text_explanation_answer'):
        text_values.append(option_payload.get('text_explanation'))
        text_values.append(option_payload.get('text_explanation_answer'))
    sub_option = f'sub_option_{answer_value}'
    nested_fields = option_payload.get('nested_fields')
    if not nested_fields:
        return text_values
    if sub_option_answer := answer_payload.get(sub_option):
        sub_option_value = sub_option_answer.get('value')
        sub_option_match = next(
            (nested_field for nested_field in nested_fields if nested_field['id'] == sub_option_value), None)
        if sub_option_match:
            sub_option_answer_key = f'{sub_option_value}_option'
            if sub_option_answer_value := sub_option_answer.get(sub_option_answer_key):
                text_values.append(sub_option_answer_value.get('title'))
    return text_values
