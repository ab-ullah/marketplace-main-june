from copy import deepcopy

from api.cards.config import BaseCustomKYCCardsCreator
from api.cards.ely_place.workflow_types import WorkflowTypes
from api.companies.models import Company


class RiversideWorkflowCreator(BaseCustomKYCCardsCreator):

    def _handle_schema_update(self, card, workflow_type=None):
        data = deepcopy(card)
        filtered_schema = []
        excluded_default_fields = {'phone_number', 'is_lasalle_or_jll_employee', 'is_us_citizen', 'net_worth',
                                   'citizenship_country', 'office_location', 'purpose_of_the_subscription', 'source_of_funds_profession',
                                   'occupation', 'applicable_resolutions_powers_of_attorney_or_authorization letters'}

        for field in data.get('schema', []):
            if field['id'] in excluded_default_fields:
                continue
            filtered_schema.append(field)
        data['schema'] = filtered_schema
        return data


def create_riverside_workflows_for_company(company: Company):
    workflow_creator = RiversideWorkflowCreator(company=company, workflow_types=WorkflowTypes)
    for workflow_type in WorkflowTypes:
        workflow_creator.create_workflow_for_company(workflow_type=workflow_type)
