from copy import deepcopy
from typing import Dict, List

from slugify import slugify

from api.cards.default.cards import DefaultCards
from api.cards.models import Workflow, Card
from api.companies.models import Company


class BaseCustomKYCCardsCreator:
    def __init__(self, company: Company, workflow_types):
        self.company = company
        self.workflow_types = workflow_types

    def get_default_cards_by_workflow_type(self, workflow_type) -> List[Dict]:
        if workflow_type == self.workflow_types.INDIVIDUAL:
            return [
                DefaultCards._get_personal_card(),
                DefaultCards._get_home_address_card(),
                DefaultCards._get_documents_card()
            ]
        elif workflow_type == self.workflow_types.PRIVATE_COMPANY:
            return [
                *DefaultCards._get_private_company_personal_cards(),
                DefaultCards._get_private_company_info_card(),
                DefaultCards._get_private_company_documents_card(),
                DefaultCards._get_private_company_entity_card()
            ]
        elif workflow_type == self.workflow_types.LIMITED_PARTNERSHIP:
            return [
                *DefaultCards._get_limited_partnership_company_personal_cards(),
                DefaultCards._get_limited_partnership_certificate_upload_card(),
                DefaultCards._get_limited_partnership_company_type_card(),
                DefaultCards._get_limited_partnership_participants_card(),
                DefaultCards._get_limited_partnership_entity_info_card(),
            ]
        elif workflow_type == self.workflow_types.TRUST:
            return [
                *DefaultCards._get_trust_personal_info_cards(),
                DefaultCards._get_trust_participant_info_card(),
                DefaultCards._get_trust_info_card(),
                DefaultCards._get_trust_documents_card(),
            ]

    def _handle_schema_update(self, card, workflow_type=None):
        raise NotImplementedError

    def create_or_update_default_cards(self, workflow: Workflow, workflow_type) -> None:
        cards = self.get_default_cards_by_workflow_type(workflow_type)
        for card in cards:
            card_data = self._handle_schema_update(card=deepcopy(card), workflow_type=workflow_type)
            Card.objects.update_or_create(
                card_id=card_data["card_id"],
                name=card_data["name"],
                workflow=workflow,
                defaults={
                    "card_id": card_data["card_id"],
                    "order": card_data["order"],
                    "name": card_data["name"],
                    "is_repeatable": card_data["is_repeatable"] if "is_repeatable" in card_data else False,
                    "kyc_investor_type": card_data["kyc_investor_type"],
                    "card_dependencies": card_data["card_dependencies"] if "card_dependencies" in card_data else {},
                    "workflow": workflow,
                    "schema": card_data["schema"]
                }
            )

    def create_workflow_for_company(self, workflow_type) -> Workflow:
        company = self.company
        name = "{} {}".format(workflow_type.value, company.name)
        workflow, _ = Workflow.objects.update_or_create(
            name=name,
            fund=None,
            company=company,
            defaults={
                "name": name,
                "is_published": True,
                "type": Workflow.FLOW_TYPES.KYC.value,
                "company": company,
                "fund": None,
                "slug": slugify(name)
            }
        )
        self.create_or_update_default_cards(workflow, workflow_type)
        return workflow



