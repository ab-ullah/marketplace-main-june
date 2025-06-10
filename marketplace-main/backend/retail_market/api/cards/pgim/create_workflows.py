from copy import deepcopy

from api.cards.config import BaseCustomKYCCardsCreator
from api.cards.pgim.workflow_types import WorkflowTypes
from api.companies.models import Company


class PGIMWorkFlowCreator(BaseCustomKYCCardsCreator):

    def _handle_schema_update(self, card, workflow_type):
        data = deepcopy(card)
        for field in data.get('schema', []):
            if field['id'] == 'is_lasalle_or_jll_employee':
                field['label'] = f'Are you a current employee of {self.company.name}'
        return data


def create_pgim_workflows_for_company(company: Company):
    workflow_creator = PGIMWorkFlowCreator(company=company, workflow_types=WorkflowTypes)
    for workflow_type in WorkflowTypes:
        workflow_creator.create_workflow_for_company(workflow_type=workflow_type)
