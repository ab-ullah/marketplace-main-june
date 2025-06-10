from api.agreements.models import ApplicantAgreementDocument
from api.funds.services.application_fund_documents import ApplicationFundDocuments
from api.workflows.models import WorkFlow


def has_agreement_documents(application):
    return ApplicantAgreementDocument.objects.filter(application_id=application.id).count() > 0


def all_agreements_signed(application):
    fund_document_ids = list(
        ApplicationFundDocuments(application=application).get_documents(
            require_signature=True
        ).values_list('id', flat=True)
    )
    queryset = ApplicantAgreementDocument.objects.filter(
        application=application,
        agreement_document_id__in=fund_document_ids
    )
    if not queryset.exists():
        return False

    return not queryset.filter(
        completed=False
    ).exists()


def all_agreements_gp_signed(application):
    if not application.workflow:
        return False

    parent_workflow = application.workflow

    agreements_workflow = parent_workflow.child_workflows.filter(
        module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value
    ).last()

    if not agreements_workflow:
        return False

    if not agreements_workflow.is_completed:
        return False

    if not has_agreement_documents(application=application):
        return False

    for applicant_document in application.application_agreements.select_related('agreement_document'):
        if not applicant_document.completed:
            return False

        if applicant_document.agreement_document.require_gp_signature and not applicant_document.gp_signing_complete:
            return False

    return True
