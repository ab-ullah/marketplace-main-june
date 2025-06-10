from copy import deepcopy

from api.cards.config import BaseCustomKYCCardsCreator
from api.cards.ely_place.workflow_types import WorkflowTypes
from api.companies.models import Company
from api.kyc_records.models import KYCInvestorType


class SidecarWorkFlowCreator(BaseCustomKYCCardsCreator):

    def _handle_schema_update(self, card, workflow_type):
        data = deepcopy(card)
        filtered_schema = []
        for field in data.get('schema', []):
            if field['id'] == 'proof_of_address' and card['kyc_investor_type'] != KYCInvestorType.PARTICIPANT:
                field['field_dependencies'] = [
                    {
                        "field": "is_lasalle_or_jll_employee",
                        "relation": "equals",
                        "value": 'f'
                    }
                ]
            filtered_schema.append(field)
        data['schema'] = filtered_schema
        return data


def create_sidecar_workflows_for_company(company: Company):
    workflow_creator = SidecarWorkFlowCreator(company=company, workflow_types=WorkflowTypes)
    for workflow_type in WorkflowTypes:
        workflow_creator.create_workflow_for_company(workflow_type=workflow_type)
