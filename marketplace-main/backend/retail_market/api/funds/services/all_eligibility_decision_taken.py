from api.applications.models import Application
from api.funds.models import Fund
from api.workflows.models import WorkFlow


class AllEligibilityDecisionTaken:
    def __init__(self, fund: Fund):
        self.fund = fund

    def process(self):
        applications = Application.objects.filter(fund=self.fund)
        for application in applications:
            if application.status not in [Application.Status.CREATED, Application.Status.SUBMITTED]:
                continue

            parent_workflow = application.workflow

            # If no parent workflow, this application has not been started,
            # so it can not be true that eligibility has been completed.
            if parent_workflow is None:
                return False

            if application.eligibility_response and application.eligibility_response.is_approved:
                continue

            eligibility_workflow = parent_workflow.child_workflows.filter(
                module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value
            ).last()
            is_eligibility_approved = eligibility_workflow and eligibility_workflow.is_completed
            if not is_eligibility_approved:
                return False

        return True
