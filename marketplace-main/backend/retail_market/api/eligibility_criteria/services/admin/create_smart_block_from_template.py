from django.db.transaction import atomic

from api.eligibility_criteria.models import FundEligibilityCriteria, CustomSmartBlockField, CustomSmartBlock
from api.eligibility_criteria.services.admin.create_eligibility_criteria_block import \
    CreateEligibilityCriteriaBlockService


class CreateCustomBlockFromTemplateService:
    def __init__(self, eligibility_criteria: FundEligibilityCriteria, template, company):
        self.eligibility_Criteria = eligibility_criteria
        self.template = template
        self.company = company

    def create_smart_block(self):
        return CustomSmartBlock.objects.create(
            fund=self.eligibility_Criteria.fund,
            eligibility_criteria=self.eligibility_Criteria,
            company=self.company,
            title=self.template.title,
            description=self.template.description,
            is_multiple_selection_enabled=self.template.is_multiple_selection_enabled,
            source_template=self.template
        )

    def create_smart_block_fields(self, block):
        for custom_field in self.template.custom_fields:
            if custom_field.get('parent_field'):
                continue

            created_custom_field = CustomSmartBlockField.objects.create(
                block=block,
                title=custom_field['title'],
                marks_as_eligible=custom_field['marks_as_eligible'],
                reviewers_required=custom_field['reviewers_required'],
                required_documents=custom_field['required_documents'],
                is_text_explanation_enabled=custom_field.get('is_text_explanation_enabled', False),
                is_nested_fields_enabled=custom_field.get('is_nested_fields_enabled', False),
                text_explanation=custom_field.get('text_explanation'),
                nested_field_title=custom_field.get('nested_field_title'),

            )

            for child_field in custom_field.get('nested_fields', []):
                CustomSmartBlockField.objects.create(
                    block=block,
                    parent_field=created_custom_field,
                    title=child_field['title'],
                    marks_as_eligible=child_field['marks_as_eligible'],
                    reviewers_required=child_field['reviewers_required'],
                    required_documents=child_field['required_documents'],
                    is_text_explanation_enabled=child_field.get('is_text_explanation_enabled', False),
                    text_explanation=child_field.get('text_explanation'),
                )


    def process(self):
        with atomic():
            custom_block = self.create_smart_block()
            self.create_smart_block_fields(custom_block)

            criteria_block_data = {
                'custom_block': custom_block,
                'criteria': self.eligibility_Criteria,
                'is_custom_block': True,
                'is_smart_view': self.eligibility_Criteria.is_smart_criteria
            }
            CreateEligibilityCriteriaBlockService.create(
                criteria=self.eligibility_Criteria,
                validated_data=criteria_block_data
            )
