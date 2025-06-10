from api.applications.constants import FINALIZED_SECTION_DESCRIPTION, FINALIZED_SECTION_DESCRIPTION_NEW
from decimal import Decimal
from api.applications.models import Application
from api.eligibility_criteria.models import EligibilityCriteriaResponse


class ApplicationInvestmentDetails:
    def __init__(self, application: Application):
        self.application = application

    @staticmethod
    def get_eligibility_status(eligibility_criteria_response: EligibilityCriteriaResponse):
        if not eligibility_criteria_response.is_eligible:
            return 'Not Eligible'
        else:
            return 'Approved' if eligibility_criteria_response.is_approved else 'Pending'

    def get(self):
        application = self.application
        company = application.company
        eligibility_criteria_response = application.eligibility_response
        max_leverage = application.max_leverage_ratio
        max_leverage_ratio = None
        if max_leverage is not None:
            max_leverage = int(application.max_leverage_ratio)
            max_leverage_ratio = f'{max_leverage}:1'

        investment_detail = {
            'requested_leverage': None,
            'max_leverage': max_leverage_ratio,
            'final_leverage': None,
            'requested_entity': None,
            'final_entity': None,
            'total_investment': None,
            'eligibility_decision': None,
            'final_leverage_ratio': None,
            'eligibility_type': None,
            'id': None,
            'leverage_option_description': None,
            'final_leverage_option_description': None,
            'levered_commitment_amount': None,
            'unlevered_commitment_amount': None,
            'application_max_levered_amount': None,
            'cashless_commitment': None,
            'final_cashless_commitment': None,
            'max_leverage_percentage': None,
            'leverage_amount': None,
            'hide_finalized_section': None,
            'finalized_section_description': None,
            'gross_investment': None,
        }

        if not eligibility_criteria_response and not application.investment_amount:
            return investment_detail

        if eligibility_criteria_response:
            eligibility_decision = self.get_eligibility_status(eligibility_criteria_response)
            eligibility_type = 'Knowledgeable' if eligibility_criteria_response.is_knowledgeable else 'Financial'
            investment_detail['eligibility_decision'] = eligibility_decision
            investment_detail['eligibility_type'] = eligibility_type
            investment_detail['is_eligible'] = eligibility_criteria_response.is_eligible

        investment_amount = None

        if eligibility_criteria_response:
            investment_amount = eligibility_criteria_response.investment_amount
        elif application.investment_amount:
            investment_amount = application.investment_amount

        if not investment_amount:
            return investment_detail

        requested_entity = float(investment_amount.amount)

        # if not max_leverage:
        #     max_leverage = investment_amount.leverage_ratio

        leverage_ratio = f'{int(investment_amount.leverage_ratio)}:1'

        investment_detail['final_entity'] = investment_amount.get_final_amount()
        investment_detail['final_leverage_ratio'] = f'{int(investment_amount.get_final_leverage_ratio())}:1'

        investment_detail['id'] = investment_amount.id
        investment_detail['requested_leverage'] = leverage_ratio
        investment_detail['max_leverage'] = max_leverage_ratio
        investment_detail['requested_entity'] = requested_entity
        investment_detail['total_investment'] = investment_amount.get_total_investment()
        investment_detail['requested_leverage_amount'] = float(investment_amount.leverage_ratio) * requested_entity

        investment_detail['requested_total_investment'] = investment_detail[
                                                              'requested_leverage_amount'] + requested_entity

        if investment_amount.cashless_commitment:
            investment_detail['requested_total_investment'] += float(investment_amount.cashless_commitment)

        investment_detail['final_leverage_amount'] = investment_amount.get_total_leverage()
        investment_detail['final_total_investment'] = investment_amount.get_total_investment()
        investment_detail['leverage_option_description'] = investment_amount.leverage_option_description
        investment_detail['final_leverage_option_description'] = investment_amount.get_final_leverage_ratio_description()

        investment_detail['levered_commitment_amount'] = investment_amount.levered_amount
        investment_detail['unlevered_commitment_amount'] = investment_amount.unlevered_amount
        investment_detail['max_levered_commitment_amount'] = investment_amount.max_levered_commitment_amount
        investment_detail['cashless_commitment'] = investment_amount.cashless_commitment
        investment_detail['final_cashless_commitment'] = investment_amount.get_final_cashless_commitment()
        investment_detail['max_leverage_percentage'] = investment_amount.max_leverage_percentage
        investment_detail['leverage_amount'] = investment_amount.leverage_amount
        investment_detail['final_leverage'] = investment_amount.get_final_leverage()
        investment_detail['gross_investment'] = (
                (investment_amount.leverage_amount or 0) +
                (investment_amount.amount or 0) +
                (investment_amount.cashless_commitment or 0)
        )

        investment_detail['finalized_section_description'] = FINALIZED_SECTION_DESCRIPTION_NEW \
            if company.show_new_commitment_flow else FINALIZED_SECTION_DESCRIPTION

        if company.show_new_commitment_flow:
            final_values_updated = investment_amount.final_values_updated()
            pre_document_approved = application.has_pre_document_approved()
            investment_detail['hide_finalized_section'] = not(final_values_updated or pre_document_approved)

        application_max_levered_amount = 0
        if investment_amount.max_levered_commitment_amount:
            application_max_levered_amount = investment_amount.max_levered_commitment_amount
        elif application.fund.max_levered_commitment_amount:
            application_max_levered_amount = application.fund.max_levered_commitment_amount
        investment_detail['application_max_levered_amount'] = application_max_levered_amount

        return investment_detail
