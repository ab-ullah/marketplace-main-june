from copy import deepcopy

from api.cards.config import BaseCustomKYCCardsCreator
from api.cards.default.cards import HOME_REGION_FIELD
from api.cards.influentpe.workflow_types import WorkflowTypes
from api.companies.models import Company
from api.geographics.models import Country


class InfluentpeWorkFlowCreator(BaseCustomKYCCardsCreator):

    def _handle_schema_update(self, card, workflow_type):
        data = deepcopy(card)
        filtered_schema = []
        excluded_default_fields = {'is_us_citizen', 'is_lasalle_or_jll_employee', 'office_location',
                                   'phone_number', 'net_worth', 'source_of_funds', 'economic_beneficiary',
                                   'purpose_of_the_subscription', 'proof_of_address', 'source_of_wealth',
                                   'list_of_directors_or_managers_of_partner',
                                   'limited-partnership-certificates_section',
                                   'list_of_shareholders_members_owners',
                                   'applicable_resolutions_power_of_attorney_auth_letter'}
        uk_country = Country.objects.get(iso_code='UK')
        for field in data.get('schema', []):
            if field['id'] in excluded_default_fields:
                continue
            if field['id'] == HOME_REGION_FIELD['id']:
                field['required'] = False
                field['label'] = 'Local Area or Village Name'
                field['field_dependencies'][0]['value'] = str(uk_country.id)
                field['field_dependencies'][0]['relation'] = 'equals'
            if field['id'] == 'certified_copy_of_partnership_agreement':
                field['label'] = 'Partnership Agreement, Deed or other document'
                field['helpText'] = 'Please provide Partnership Agreement, Deed or other document outlining the Limited Partnership terms'
            filtered_schema.append(field)
        data['schema'] = filtered_schema
        return data


def create_influentpe_workflows_for_company(company: Company):
    workflow_creator = InfluentpeWorkFlowCreator(company=company, workflow_types=WorkflowTypes)
    for workflow_type in WorkflowTypes:
        workflow_creator.create_workflow_for_company(workflow_type=workflow_type)
