from api.applications.models import Application
from api.applications.services.application_investment_details import ApplicationInvestmentDetails
from api.eligibility_criteria.models import EligibilityCriteriaResponse

INVESTMENT_AMOUNT_CARD = 'Investment Amount'


class GetInvestmentAmountCard:
    def __init__(self, eligibility_criteria_response: EligibilityCriteriaResponse):
        self.eligibility_criteria_response = eligibility_criteria_response
        self.investment_amount = self.eligibility_criteria_response.investment_amount

    @staticmethod
    def get_card():
        return {
            'name': INVESTMENT_AMOUNT_CARD,
            "order": 2,
        }

    def get_leverage(self):
        if not self.investment_amount:
            return 0
        leverage_ratio = self.eligibility_criteria_response.investment_amount.leverage_ratio
        if not leverage_ratio:
            return 0
        return leverage_ratio

    def get_application(self):
        try:
            return Application.objects.get(eligibility_response_id=self.eligibility_criteria_response.id)
        except:
            return None

    def get_final_amount_details(self):
        application = self.get_application()
        if not application:
            return None
        return ApplicationInvestmentDetails(application=application).get()

    def process(self):
        investment_amount = self.investment_amount
        card = self.get_card()
        value = 0
        investment_record_id = None
        if investment_amount:
            value = investment_amount.amount
            investment_record_id = investment_amount.id

        schema = [
            {
                "id": f'{self.eligibility_criteria_response.id}-investment-amount',
                "label": 'How much Equity would you like to invest ($)?',
                "type": "investment_amount_response",
                'investmentDetail': {
                    'amount': value,
                    'leverage_ratio': self.get_leverage(),
                    'investment_record_id': investment_record_id,
                    'final_amount_details': self.get_final_amount_details()
                }
            }
        ]

        card['schema'] = schema
        return card
