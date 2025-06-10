from api.funds.selectors.eligibility_criteria_based_selectors import get_funds_with_eligibility_response, \
    get_funds_with_published_criteria, get_fund_with_non_approved_eligibility_response, get_funds_can_be_finalized


class FundViewMixin:
    def get_serializer_context(self):
        company = self.company
        context = super().get_serializer_context()
        context['funds_with_eligibility_response'] = get_funds_with_eligibility_response(
            company=company
        )
        context['funds_with_published_criteria'] = get_funds_with_published_criteria(
            company=company
        )
        context['fund_with_non_approved_eligibility_response'] = get_fund_with_non_approved_eligibility_response(
            company=company
        )
        context['funds_can_be_finalized'] = get_funds_can_be_finalized(company=company)
        return context
