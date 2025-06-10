from copy import deepcopy

from api.cards.config import BaseCustomKYCCardsCreator
from api.cards.default.cards import HOME_REGION_FIELD
from api.cards.patrizia_ag.workflow_types import WorkflowTypes
from api.companies.models import Company
from api.geographics.models import Country


class PatriziaAGWorkFlowCreator(BaseCustomKYCCardsCreator):

    def _handle_schema_update(self, card, workflow_type):
        data = deepcopy(card)
        filtered_schema = []
        excluded_default_fields = {'is_us_citizen', 'is_lasalle_or_jll_employee', 'office_location'}
        uk_country = Country.objects.get(iso_code='UK')
        for field in data.get('schema', []):
            if field['id'] in excluded_default_fields:
                continue
            if field['id'] == HOME_REGION_FIELD['id']:
                field['required'] = False
                field['label'] = 'Local Area or Village Name'
                field['field_dependencies'][0]['value'] = str(uk_country.id)
                field['field_dependencies'][0]['relation'] = 'equals'
            filtered_schema.append(field)
        data['schema'] = filtered_schema
        return data


def create_patrizia_workflows_for_company(company: Company):
    workflow_creator = PatriziaAGWorkFlowCreator(company=company, workflow_types=WorkflowTypes)
    for workflow_type in WorkflowTypes:
        workflow_creator.create_workflow_for_company(workflow_type=workflow_type)
