from api.applications.services.allocation_review_service import AllocationReviewService
from api.eligibility_criteria.models import EligibilityCriteriaResponse
from api.funds.services.all_eligibility_decision_taken import AllEligibilityDecisionTaken


class EligibilityResponseSelfCertification:
    @staticmethod
    def process(criteria_response: EligibilityCriteriaResponse):
        if not criteria_response.is_self_certified:
            criteria_response.is_self_certified = True
            criteria_response.save()

        if criteria_response.is_approved:
            return

        criteria_response.is_approved = True
        criteria_response.save()

        fund = criteria_response.criteria.fund
        all_eligibility_decisions_done = AllEligibilityDecisionTaken(fund=fund).process()
        if all_eligibility_decisions_done:
            AllocationReviewService(
                fund=fund
            ).start_review()
