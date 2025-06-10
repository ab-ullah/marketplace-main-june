from api.applications.models import Application

APPLICATION_APPROVAL_STATUSES = [
    Application.Status.DENIED.value,
    Application.Status.APPROVED.value,
    Application.Status.WITHDRAWN.value,
    Application.Status.FINALIZED.value
]

NON_APPROVAL_STATUSES = (
    Application.Status.WITHDRAWN.value,
    Application.Status.DENIED.value,
)

FINALIZED_SECTION_DESCRIPTION_NEW = 'Below are the values that are finalized by the Admin.'
FINALIZED_SECTION_DESCRIPTION = 'These are the finalized investment details'
