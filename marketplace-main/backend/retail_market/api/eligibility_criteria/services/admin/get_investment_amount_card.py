from decimal import Decimal

from api.applications.models import Application
from api.applications.services.application_investment_details import ApplicationInvestmentDetails
from api.eligibility_criteria.models import EligibilityCriteriaResponse, CriteriaBlockResponse, CriteriaBlock

INVESTMENT_AMOUNT_CARD = 'Investment Amount'


class GetInvestmentAmountCard:
    def __init__(self, eligibility_criteria_response: EligibilityCriteriaResponse):
        self.eligibility_criteria_response = eligibility_criteria_response

    @staticmethod
    def get_card():
        return {
            'name': INVESTMENT_AMOUNT_CARD,
            "order": 2,
        }

    def get_application(self):
        try:
            return Application.objects.get(eligibility_response_id=self.eligibility_criteria_response.id)
        except:
            return None

    def get_leverage(self):
        leverage_ratio = self.eligibility_criteria_response.investment_amount.leverage_ratio
        if not leverage_ratio:
            return 'none'
        return f'{int(leverage_ratio)}:1'

    def get_final_amount_questions(self):
        application = self.get_application()
        if not application:
            return []

        investment_details = ApplicationInvestmentDetails(application=application).get()
        questions = [
            {
                "id": f'{self.eligibility_criteria_response.id}-requested-total-investment',
                "label": 'Total investment requested',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_details.get('requested_total_investment')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}-final-equity',
                "label": 'Final Equity',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_entity')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}-final-leverage',
                "label": 'Final Leverage',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_leverage_ratio')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}-leverage-description',
                "label": 'Leverage option description',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_details.get('description')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}-final-total-investment',
                "label": 'Final Total Investment',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_total_investment')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}-leverage_amount',
                "label": 'Leverage Amount',
                "type": "leverage_amount",
                'submitted_answer': {
                    'answer_values': [investment_details.get('leverage_amount')],
                }
            },

        ]

        if application.is_cashless_commitment_enabled():
            cashless_commitment_question = {
                "id": f'{self.eligibility_criteria_response.id}-cashless-commitment',
                "label": 'Cashless Commitment',
                "type": "cashless_commitment",
                'submitted_answer': {
                    'answer_values': [investment_details.get('cashless_commitment')],
                }
            }
            final_cashless_commitment_question = {
                "id": f'{self.eligibility_criteria_response.id}-final_cashless-commitment',
                "label": 'Final Cashless Commitment',
                "type": "cashless_commitment",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_cashless_commitment')],
                }
            }
            questions.insert(-1, cashless_commitment_question)
            questions.insert(-1, final_cashless_commitment_question)

        return questions

    def process(self):
        card = self.get_card()
        investment_amount = self.eligibility_criteria_response.investment_amount
        if not investment_amount:
            card['schema'] = []
            return card
        schema = [
            {
                "id": f'{self.eligibility_criteria_response.id}-investment-amount',
                "label": 'How much Equity would you like to invest?',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_amount.amount if investment_amount else 0],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}-leverage-requested',
                "label": 'How much leverage would you like?',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [self.get_leverage() if investment_amount else 'none'],
                }
            },
            *self.get_final_amount_questions()
        ]

        card['schema'] = schema
        return card


class GetInvestmentAmountCardRiverSide(GetInvestmentAmountCard):

    def get_final_amount_questions(self):
        application = self.get_application()
        if not application:
            return []

        investment_details = ApplicationInvestmentDetails(application=application).get()
        questions = [
            {
                "id": f'{self.eligibility_criteria_response.id}_final-equity',
                "label": 'Final Cash Investment',
                "type": "investment_amount_response_no_flag",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_entity')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}_gross-investment',
                "label": 'Gross Investment',
                "type": "investment_amount_response_no_flag",
                'submitted_answer': {
                    'answer_values': [investment_details.get('gross_investment')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}_finalized-gross-investment',
                "label": 'Finalized Gross Investment',
                "type": "investment_amount_response_no_flag",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_total_investment')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}_leverage_amount',
                "label": 'Leverage',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_details.get('leverage_amount')],
                }
            },
            {
                "id": f'{self.eligibility_criteria_response.id}_final-leverage_amount',
                "label": 'Final Leverage Amount',
                "type": "investment_amount_response_no_flag",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_leverage')],
                }
            },
        ]

        if application.is_cashless_commitment_enabled():
            cashless_commitment_question = {
                "id": f'{self.eligibility_criteria_response.id}_cashless_commitment',
                "label": 'Management Fee Offset',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_details.get('cashless_commitment')],
                }
            }
            final_cashless_commitment_question = {
                "id": f'{self.eligibility_criteria_response.id}_final_cashless-commitment',
                "label": 'Final Management Fee Offset',
                "type": "investment_amount_response_no_flag",
                'submitted_answer': {
                    'answer_values': [investment_details.get('final_cashless_commitment')],
                }
            }
            questions.insert(-2, cashless_commitment_question)
            questions.insert(-2, final_cashless_commitment_question)

        return questions

    def process(self):
        card = self.get_card()
        investment_amount = self.eligibility_criteria_response.investment_amount
        if not investment_amount:
            card['schema'] = []
            return card
        schema = [
            {
                "id": f'{self.eligibility_criteria_response.id}_amount',
                "label": 'Cash Investment',
                "type": "investment_amount_response",
                'submitted_answer': {
                    'answer_values': [investment_amount.amount if investment_amount else 0],
                }
            },
            *self.get_final_amount_questions()
        ]

        card['schema'] = schema
        return card
