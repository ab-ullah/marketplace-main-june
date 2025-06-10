import time

from api.cards.default.cards import DefaultCards
from api.cards.default.workflow_types import WorkflowTypes
from api.cards.models import Card
from api.constants.kyc_investor_types import KYCInvestorType


class CardCleaningService:
    def __init__(self, do_delete=False):
        self.do_delete = do_delete
        self.card_ids = []
        if do_delete:
            print('Deletion is set to true, if you dont want to delete, terminate the script in 10 seconds')
            time.sleep(10)

    def clean_card_type(self, cards, kyc_investor_type):
        card_ids = [c['card_id'] for c in cards]
        card_id_name_mapping = {c['card_id']: c['name'] for c in cards}
        self.card_ids.extend(card_ids)

        correct_id_cards = Card.objects.filter(kyc_investor_type=kyc_investor_type, card_id__in=card_ids)
        ids_to_delete = []
        for card in correct_id_cards:
            expected_name = card_id_name_mapping[card.card_id]
            if card.name != expected_name:
                print(f'Old name: {card.name}, New name: {expected_name}')
                if self.do_delete:
                    ids_to_delete.append(card.id)

        if ids_to_delete and self.do_delete:
            Card.objects.filter(id__in=ids_to_delete).delete()

    def process_private_company_cards(self):
        cards = DefaultCards.get_default_cards_by_workflow_type(WorkflowTypes.PRIVATE_COMPANY)
        kyc_investor_type = KYCInvestorType.PARTICIPANT
        self.clean_card_type(cards=cards, kyc_investor_type=kyc_investor_type)

    def process_partnership_cards(self):
        cards = DefaultCards.get_default_cards_by_workflow_type(WorkflowTypes.LIMITED_PARTNERSHIP)
        kyc_investor_type = KYCInvestorType.LIMITED_PARTNERSHIP
        self.clean_card_type(cards=cards, kyc_investor_type=kyc_investor_type)

    def process_trust_cards(self):
        cards = DefaultCards.get_default_cards_by_workflow_type(WorkflowTypes.TRUST)
        kyc_investor_type = KYCInvestorType.TRUST
        self.clean_card_type(cards=cards, kyc_investor_type=kyc_investor_type)

    def clean_deleted_cards(self):
        old_card_qs = Card.objects.exclude(card_id__in=self.card_ids)
        print(f'{old_card_qs.count()} old cards detected')
        if self.do_delete:
            old_card_qs.count()

    def clean(self):
        self.process_partnership_cards()
        self.process_private_company_cards()
        self.process_trust_cards()
        self.clean_deleted_cards()
