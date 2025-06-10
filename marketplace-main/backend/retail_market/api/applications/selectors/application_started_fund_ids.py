from api.agreements.models import ApplicantAgreementDocument
from api.applications.constants import NON_APPROVAL_STATUSES
from api.applications.models import Application
from api.applications.utils import get_user_latest_application_ids
from api.users.models import RetailUser


def get_application_started_fund_ids(user: RetailUser):
    latest_application_ids = get_user_latest_application_ids(user)

    fund_ids = Application.objects.filter(
        id__in=latest_application_ids,
        user=user,
        eligibility_response__isnull=False
    ).exclude(status__in=NON_APPROVAL_STATUSES).values_list('fund_id', flat=True)
    return list(fund_ids)


def get_withdrawn_declined_application_fund_ids(user: RetailUser):
    latest_application_ids = get_user_latest_application_ids(user)

    fund_ids = Application.objects.filter(
        id__in=latest_application_ids,
        user=user,
        eligibility_response__isnull=False,
        status__in=NON_APPROVAL_STATUSES
    ).values_list('fund_id', flat=True)
    return list(fund_ids)


def get_transfer_application_fund_ids(user: RetailUser):
    latest_application_ids = get_user_latest_application_ids(user)

    fund_ids = Application.objects.filter(
        id__in=latest_application_ids,
        user=user,
        eligibility_response__isnull=True,
        is_transferred=True
    ).values_list('fund_id', flat=True)
    return list(fund_ids)


def get_application_completed_fund_ids(user: RetailUser):
    latest_application_ids = get_user_latest_application_ids(user)

    complete_applications = ApplicantAgreementDocument.objects.filter(
        gp_signing_complete=True,
        application__user=user
    ).values_list('application__id', flat=True)
    complete_applications = set(complete_applications)

    incomplete_application = ApplicantAgreementDocument.objects.filter(
        gp_signing_complete=False,
        agreement_document__require_gp_signature=True,
        application__user=user
    ).values_list('application__id', flat=True)
    incomplete_application = set(incomplete_application)

    complete_applications = complete_applications - incomplete_application

    applications = Application.objects.select_related('fund').filter(
        id__in=latest_application_ids,
        user=user,
        eligibility_response__isnull=False
    )
    completed_applications_fund_ids = [app.fund.id for app in applications if app.id in complete_applications]

    return completed_applications_fund_ids


def get_active_application_workflow_ids(user: RetailUser):
    workflow_ids = Application.objects.filter(
        user=user,
        eligibility_response__isnull=False
    ).values_list('workflow_id', flat=True)
    return list(workflow_ids)
