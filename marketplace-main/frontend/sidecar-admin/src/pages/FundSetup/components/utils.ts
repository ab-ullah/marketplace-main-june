import get from "lodash/get";
import map from "lodash/map";
import * as Yup from "yup";

export const isApplicationApproveable = (application: any) => {
  let kycStatusApproved = get(application, 'eligibility_decision', '')
  kycStatusApproved = kycStatusApproved ? kycStatusApproved.toLowerCase() === 'approved' : kycStatusApproved
  const hasSharedClass = !!(application.share_class && application.vehicle)
  return kycStatusApproved && hasSharedClass

}

export const generateStatus=(status:any)=>{
  const keys=['application_approval','eligibility_decision','kyc_aml','taxReview','internal_tax','legalDocs', 'pre_document_stage']
  const defaultValue='Not Started'
  const newStatus:any={}
  keys.forEach((key)=>{newStatus[key as keyof typeof newStatus]=get(status,key,defaultValue)})
  return newStatus
}

export const withAllApplicantsData=(allRecords: any[],applicantStatuses:any) => {
  return map(allRecords, (data: any) => {
    const user = data.user
    const status = applicantStatuses && applicantStatuses[data.id];
    const investmentDetail = data.investment_detail;

    return {
      first_name:
        user.first_name ||
        data.first_name ||
        (!user.last_name && user.display_name),
      last_name: user.last_name || data.last_name,
      requested_equity: investmentDetail.requested_entity,
      ...data,
      ...generateStatus(status)
    };
  });
};

export const VALIDATION_SCHEMA = Yup.object({
  "bulk_update_file": Yup.mixed().required("Select a file"),
});