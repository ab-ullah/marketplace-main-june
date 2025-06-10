from api.cards.default.lasalle_no_proof_of_address.individual_cards import US_PERSON_FIELDS, POST_NET_WORTH_ENTITY_FIELDS
from api.geographics.models import Country, CountryIdDocumentType, USState
from api.constants.id_documents import IdDocuments
from api.constants import country_states
from api.cards.models import Workflow
from api.cards.models import Card
from api.cards.default.lasalle_no_proof_of_address import individual_cards, private_company_cards, limited_partnership_cards, trust_cards
from api.cards.default.lasalle_no_proof_of_address.workflow_types import WorkflowTypes
from api.constants.kyc_investor_types import KYCInvestorType
import copy
from typing import List, Dict
from django.core.cache import cache

ID_DOC_TYPE_FIELD = {
    "id": 'id_document_type',
    "type": 'custom-select',
    "label": "ID Document type",
    "required": True,
    "data": {
        "options": []
    },
    "field_dependencies": [
        {
            "field": "id_issuing_country",
            "value": "",
            "relation": "equals"
        }
    ]
}

HOME_COUNTRY_FIELD = {
    "id": "home_country",
    "label": "Country",
    "type": "select-country",
    "required": True,
    "data": {
        "options": []
    }
}

HOME_STATE_FIELD = {
    "id": "home_state",
    "data": {
        "options": []
    },
    "type": "custom-select",
    "label": "State",
    "required": True,
    "field_dependencies": [
        {
            "field": "home_country",
            "value": "",
            "relation": "equals"
        }
    ]
}

HOME_REGION_FIELD = {
    "id": "home_region",
    "data": {
        "options": []
    },
    "type": "text",
    "label": "Region",
    "required": True,
    "field_dependencies": [
        {
            "field": "home_country",
            "value": "",
            "relation": "equals"
        }
    ]
}

CITIZENSHIP_COUNTRY = {
    "id": "citizenship_country",
    "label": "Country of citizenship",
    "type": "select-country",
    "required": True,
    "data": {"options": []}
}

US_CITIZEN = {
    "id": "is_us_citizen",
    "label": "U.S. Person or investing for the direct or indirect benefit of a U.S. Person",
    "type": "radio-select",
    "required": True,
    "data": {"options": [
                {"label": "I am/ We are", "value": "t"},
                {"label": "I am/ We are not", "value": "f"}
    ]}
}

##
# Private company KYC cards
##

PRIVATE_COMPANY_INFO_CARD = {
    "order": "1",
    "name": "Participant information",
    "kyc_investor_type": KYCInvestorType.PARTICIPANT,
    "is_repeatable": True,
    "schema": [
        {
            "id": 'proof_of_identity-section',
            "type": 'section_header',
            "label": 'Please provide the following information for at least two entity directors and ALL shareholders that own 25% or more of the shares in the company.',
            "data": {
                "size": 'medium',
            }
        },
        {
            "id": "first_name",
            "label": "First name",
            "type": "text",
            "required": True,
            "data": {
                "placeholder": "First name"
            }
        },
        {
            "id": "last_name",
            "label": "Last name",
            "type": "text",
            "required": True,
            "data": {
                "placeholder": "Last name"
            }
        },
        {
            "id": 'proof_of_identity-proof-of-identity-note',
            "type": 'section_header',
            "label": 'Proof of identity',
            "data": {
                "size": 'large',
            }
        },
        {
            'id': 'id_issuing_country', 'label': 'Issuing Country', 'type': 'select-country',
            'required': True,
            "data": {}
        },
        {
            "id": "id_expiration_date",
            "type": "date",
            "label": "ID Expiration",
            'required': True,
            "data": {
                "afterToday": True,
            },
            "field_dependencies": [
                {
                    "field": "id_document_type",
                    "relation": "in",
                    "value": [IdDocuments.PASSPORT.value, IdDocuments.DRIVERS_LICENSE.value],
                }
            ]
        },
        {
            "id": "id_doc_image",
            "data": {
                "file_types": [
                    "image/*", "application/pdf"
                ]
            },
            "type": "file_upload",
            "label": "ID Document Image",
            "required": True
        }
    ]
}

PRIVATE_COMPANY_DOCUMENTS_CARD = {
    "id": 'private-company-documents',
    "name": 'Entity Information',
    "kyc_investor_type": KYCInvestorType.PRIVATE_COMPANY,
    "order": 2,
    "schema": [
        {
            "id": "entity_name",
            "label": "Entity Name",
            "type": "text",
            "required": True,
            "data": {
                "placeholder": "Entity Name"
            }
        },
        {
            "id": 'certificate_of_incorporation',
            "label": 'Certificate of Incorporation / Articles of organization',
            "type": 'file_upload',
            "required": True,
            "data": {"file_types": ['image/*', 'application/pdf']},
            "helpText": 'Please upload the entity’s Certificate of incorporation /Articles of organization.'
        },
        {
            "id": 'list_of_current_directors_or_managers',
            "label": "List of current directors /managers",
            "type": 'file_upload',
            "required": True,
            "helpText": "Please upload a list of current directors/managers.",
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']},
        },
        {
            "id": 'list_of_authorized_signatories',
            "label": "List of authorized signatories",
            "type": 'file_upload',
            "required": True,
            "helpText": "List all authorized signatories for your entity",
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']},
        },
        {
            "id": 'list_of_shareholders_members_owners',
            "label": "List of shareholders / members / owners",
            "type": 'file_upload',
            "required": True,
            "helpText": "List all shareholders / members / owners of your entity",
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']},
        }]
}


class DefaultCards:
    _STATES_BY_COUNTRY_KEY = 'states_by_country'
    _DOC_TYPES_BY_COUNTRY_KEY = 'doc_types_country'

    @staticmethod
    def _get_personal_card():
        country_options = [{'label': country.name, 'value': country.id} for country in Country.objects.all()]
        personal_card = copy.deepcopy(individual_cards.PERSONAL_CARD)
        index = 0
        for item in personal_card['schema']:
            if item['id'] != 'citizenship_country':
                index = index + 1
            else:
                item['data']['options'] = country_options
                break
        index = index + 1
        personal_card['schema'].insert(index,
                                       {
                                           "id": "office_location",
                                           "label": "Office location",
                                           "type": "custom-select",
                                           "required": True,
                                           "data": {"options": country_options}

                                       }
                                       )
        return personal_card

    @staticmethod
    def _add_us_person_fields(schema):
        personal_card = copy.deepcopy(schema)
        index = 0
        for item in personal_card['schema']:
            if item['id'] != 'is_us_citizen':
                index = index + 1
            else:
                break
        index = index + 1
        for field in US_PERSON_FIELDS:
            personal_card['schema'].insert(index, field)
            index = index + 1
        return personal_card

    @staticmethod
    def _add_entity_title_field(schema):
        entity_card = copy.deepcopy(schema)
        index = 0
        for item in entity_card['schema']:
            if item['id'] != 'entity_name':
                index = index + 1
            else:
                break
        index = index + 1
        for field in POST_NET_WORTH_ENTITY_FIELDS:
            entity_card['schema'].insert(index, field)
            index = index + 1
        return entity_card

    @staticmethod
    def _get_documents_card():
        card = copy.deepcopy(individual_cards.DOCUMENTS_CARD)
        DefaultCards._append_issuing_countries_and_id_doc_types(card)
        return card

    @staticmethod
    def _get_home_address_card():
        country_options = [{'label': country.name, 'value': country.id} for country in Country.objects.all()]

        index = 0
        home_address_card = copy.deepcopy(individual_cards.HOME_ADDRESS_CARD)
        home_country_field = copy.deepcopy(HOME_COUNTRY_FIELD)
        home_country_field['data']['options'] = country_options
        home_address_card['schema'].insert(index, home_country_field)

        index = 2
        states_by_country_map = DefaultCards._get_states_by_country_map()
        for country_id in states_by_country_map.keys():
            index = index + 1
            home_state_field = copy.deepcopy(HOME_STATE_FIELD)
            home_state_field['data']['options'] = states_by_country_map[country_id]
            home_state_field['field_dependencies'][0]['value'] = "{}".format(country_id)
            home_address_card['schema'].insert(index, home_state_field)
        home_region_field = copy.deepcopy(HOME_REGION_FIELD)
        home_region_field['field_dependencies'][0]['relation'] = "not_in"
        home_region_field['field_dependencies'][0]['value'] = list(
            str(x) for x in states_by_country_map.keys())
        home_address_card['schema'].insert(index + 1, home_region_field)

        return home_address_card

    @staticmethod
    def _get_private_company_info_card():
        card = copy.deepcopy(private_company_cards.PRIVATE_COMPANY_INFO_CARD)
        DefaultCards._append_issuing_countries_and_id_doc_types(card)
        return card

    @staticmethod
    def _get_private_company_documents_card():
        return copy.deepcopy(private_company_cards.PRIVATE_COMPANY_DOCUMENTS_CARD)

    @staticmethod
    def _get_private_company_personal_cards():
        home_address_card = DefaultCards._get_home_address_card()
        home_address_card.update(
            private_company_cards.PRIVATE_COMPANY_HOME_ADDRESS_CARD
        )
        documents_card = DefaultCards._get_documents_card()
        documents_card.update(
            private_company_cards.PRIVATE_COMPANY_INDIVIDUAL_DOCUMENTS_CARD
        )

        personal_card = DefaultCards._append_counytries_list(copy.deepcopy(private_company_cards.PRIVATE_COMPANY_PERSONAL_CARD))
        personal_card = DefaultCards._add_us_person_fields(personal_card)

        return [
            personal_card,
            home_address_card,
            documents_card,
        ]

    @staticmethod
    def _get_private_company_entity_card():
        card = copy.deepcopy(private_company_cards.PRIVATE_ENTITY_INFO_CARD)
        card = DefaultCards._add_entity_title_field(card)
        DefaultCards._append_counytries_list(card)
        return card

    @staticmethod
    def _get_limited_partnership_certificate_upload_card():
        return copy.deepcopy(limited_partnership_cards.CERTIFICATE_UPLOAD_CARD)

    @staticmethod
    def _get_limited_partnership_company_type_card():
        card = copy.deepcopy(limited_partnership_cards.COMPANY_TYPE_CARD)
        card = DefaultCards._append_counytries_list(card)
        card = DefaultCards._add_entity_title_field(card)
        return card

    @staticmethod
    def _get_limited_partnership_company_personal_cards():
        home_address_card = DefaultCards._get_home_address_card()
        home_address_card.update(
            limited_partnership_cards.LIMITED_PARTNERSHIP_HOME_ADDRESS_CARD
        )
        documents_card = DefaultCards._get_documents_card()
        documents_card.update(
            limited_partnership_cards.LIMITED_PARTNERSHIP_INDIVIDUAL_DOCUMENTS_CARD
        )

        personal_card = DefaultCards._append_counytries_list(copy.deepcopy(limited_partnership_cards.LIMITED_PARTNERSHIP_PERSONAL_CARD))
        personal_card = DefaultCards._add_us_person_fields(personal_card)

        return [
            personal_card,
            copy.deepcopy(home_address_card),
            copy.deepcopy(documents_card)
        ]

    @staticmethod
    def _get_limited_partnership_participants_card():
        card = copy.deepcopy(limited_partnership_cards.PARTICIPANTS_CARD)
        DefaultCards._append_issuing_countries_and_id_doc_types(card)
        return card

    @staticmethod
    def _get_limited_partnership_entity_info_card():
        return copy.deepcopy(limited_partnership_cards.ENTITY_INFO_CARD)

    @staticmethod
    def _get_trust_info_card():
        card = copy.deepcopy(trust_cards.TRUST_INFO_CARD)
        card = DefaultCards._add_entity_title_field(card)
        return DefaultCards._append_counytries_list(card)

    @staticmethod
    def _get_trust_participant_info_card():
        card = copy.deepcopy(trust_cards.TRUST_PARTICIPANT_INFO_CARD)
        DefaultCards._append_issuing_countries_and_id_doc_types(card)
        return card

    @staticmethod
    def _get_trust_documents_card():
        return copy.deepcopy(trust_cards.TRUST_DOCUMENTS_CARD)

    @staticmethod
    def _get_trust_personal_info_cards():
        home_address_card = DefaultCards._get_home_address_card()
        home_address_card.update(
            trust_cards.TRUST_HOME_ADDRESS_CARD
        )
        documents_card = DefaultCards._get_documents_card()
        documents_card.update(
            trust_cards.TRUST_INDIVIDUAL_DOCUMENTS_CARD
        )
        personal_card = DefaultCards._append_counytries_list(copy.deepcopy(trust_cards.TRUST_PERSONAL_CARD))
        personal_card = DefaultCards._add_us_person_fields(personal_card)

        return [
            personal_card,
            copy.deepcopy(home_address_card),
            copy.deepcopy(documents_card),
        ]

    @staticmethod
    def _append_counytries_list(card):
        country_options = [{'label': country.name, 'value': country.id} for country in Country.objects.all()]
        state_options = [{'label': state.name, 'value': state.id} for state in USState.objects.all()]
        united_states = Country.objects.filter(iso_code='US').first()
        for item in card['schema']:
            if item['id'] == 'jurisdiction' or item['id'] == 'citizenship_country':
                item['data']['options'] = country_options

            if item['id'] == 'jurisdiction_state':
                item['data']['options'] = state_options
                item['field_dependencies'][0]['value'] = united_states.id

        return card

    @staticmethod
    def _append_issuing_countries_and_id_doc_types(card):
        country_options = [{'label': country.name, 'value': country.id} for country in Country.objects.all()]

        schema = card['schema']
        for i, item in enumerate(schema):
            if 'id_issuing_country' == item['id'] or 'jurisdiction' == item['id']:
                item['data']['options'] = country_options
                index = i
                break
        doc_types_country_map = DefaultCards._get_doc_types_country_map()
        for country_id in doc_types_country_map.keys():
            index = index + 1
            id_doc_type_field = copy.deepcopy(ID_DOC_TYPE_FIELD)
            id_doc_types = doc_types_country_map[country_id]
            id_doc_type_field['data']['options'] = id_doc_types
            id_doc_type_field['field_dependencies'][0]['value'] = "{}".format(country_id)
            schema.insert(index, id_doc_type_field)
        id_doc_type_field = copy.deepcopy(ID_DOC_TYPE_FIELD)
        id_doc_types = [
            {'label': IdDocuments.PASSPORT.label, 'value': IdDocuments.PASSPORT.value},
            {'label': IdDocuments.NATIONAL_ID_CARD.label, 'value': IdDocuments.NATIONAL_ID_CARD.value},
            {'label': IdDocuments.OTHER.label, 'value': IdDocuments.OTHER.value},
        ]
        id_doc_type_field['data']['options'] = id_doc_types
        id_doc_type_field['field_dependencies'][0]['relation'] = "not_in"
        id_doc_type_field['field_dependencies'][0]['value'] = list(
            str(x) for x in doc_types_country_map.keys())
        schema.insert(index + 1, id_doc_type_field)
        return card

    @staticmethod
    def get_default_cards_by_workflow_type(workflow_type: WorkflowTypes) -> List[Dict]:
        if workflow_type == WorkflowTypes.INDIVIDUAL:
            return [
                DefaultCards._get_personal_card(),
                DefaultCards._get_home_address_card(),
                DefaultCards._get_documents_card()
            ]
        elif workflow_type == WorkflowTypes.PRIVATE_COMPANY:
            return [
                *DefaultCards._get_private_company_personal_cards(),
                DefaultCards._get_private_company_info_card(),
                DefaultCards._get_private_company_documents_card(),
                DefaultCards._get_private_company_entity_card()
            ]
        elif workflow_type == WorkflowTypes.LIMITED_PARTNERSHIP:
            return [
                *DefaultCards._get_limited_partnership_company_personal_cards(),
                DefaultCards._get_limited_partnership_certificate_upload_card(),
                DefaultCards._get_limited_partnership_company_type_card(),
                DefaultCards._get_limited_partnership_participants_card(),
                DefaultCards._get_limited_partnership_entity_info_card(),
            ]
        elif workflow_type == WorkflowTypes.TRUST:
            return [
                *DefaultCards._get_trust_personal_info_cards(),
                DefaultCards._get_trust_participant_info_card(),
                DefaultCards._get_trust_info_card(),
                DefaultCards._get_trust_documents_card(),
            ]

    @staticmethod
    def create_or_update_default_cards(workflow: Workflow, workflow_type: WorkflowTypes) -> None:
        cards = DefaultCards.get_default_cards_by_workflow_type(workflow_type)
        for card in cards:
            Card.objects.update_or_create(
                card_id=card["card_id"],
                name=card["name"],
                workflow=workflow,
                defaults={
                    "card_id": card["card_id"],
                    "order": card["order"],
                    "name": card["name"],
                    "is_repeatable": card["is_repeatable"] if "is_repeatable" in card else False,
                    "kyc_investor_type": card["kyc_investor_type"],
                    "card_dependencies": card["card_dependencies"] if "card_dependencies" in card else {},
                    "workflow": workflow,
                    "schema": card["schema"]
                }
            )

    @staticmethod
    def _get_states_by_country_map():
        states_by_country_map = cache.get(DefaultCards._STATES_BY_COUNTRY_KEY)
        if states_by_country_map is not None:
            return states_by_country_map

        countries_with_states = list(
            Country.objects.filter(iso_code__in=country_states.STATES_BY_COUNTRY_MAP.keys()))
        states_by_country_map = {}
        for country in countries_with_states:
            states_by_country_map[country.id] = [{'label': state['name'], 'value': state['code']} for state in
                                                 country_states.STATES_BY_COUNTRY_MAP[country.iso_code]]
        cache.set(DefaultCards._STATES_BY_COUNTRY_KEY, states_by_country_map)
        return states_by_country_map

    @staticmethod
    def _get_doc_types_country_map():
        doc_types_country_map = cache.get(DefaultCards._DOC_TYPES_BY_COUNTRY_KEY)
        if doc_types_country_map is not None:
            return doc_types_country_map

        doc_types_country_map = {}
        id_doc_types_all = list(CountryIdDocumentType.objects.filter().all())
        for item in id_doc_types_all:
            if item.country.id in doc_types_country_map.keys():
                doc_types_country_map[item.country.id].append(
                    {'label': item.get_id_document_type_display(), 'value': item.id_document_type})
            else:
                doc_types_country_map[item.country.id] = [
                    {'label': item.get_id_document_type_display(), 'value': item.id_document_type}]

        cache.set(DefaultCards._DOC_TYPES_BY_COUNTRY_KEY, doc_types_country_map)
        return doc_types_country_map
