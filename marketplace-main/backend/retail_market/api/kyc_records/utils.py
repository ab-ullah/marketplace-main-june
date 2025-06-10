from api.companies.models import Company
from api.workflows.models import WorkFlow
from api.workflows.services.set_workflow_completion import SetWorkFlowCompletion


def reset_kyc_record_approval(kyc_record, fund_external_id, user):
    if kyc_record.kyc_entity:
        kyc_record.kyc_entity.approved = False
        kyc_record.kyc_entity.save()
    else:
        kyc_record.approved = False
        kyc_record.save()
    if fund_external_id:
        SetWorkFlowCompletion(
            user_id=user.id,
            fund_external_id=fund_external_id,
            completion_status=False,
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value
        ).process()


def email_expiration_report(company_name):
    from api.kyc_records.services.kyc_expiration_stats import KycExpirationStats
    company = Company.objects.get(name__iexact=company_name)
    KycExpirationStats(company=company).process(send_email=True)
