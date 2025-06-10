import {IApplicantManagementRow, IApplicantStatuses} from "../../interfaces";
import get from "lodash/get";
import {DEPARTMENTS} from "../../../EligibilityCriteriaPreview/components/CountrySelector/constants";
import {IStatus} from "./constants";
import {IFundBaseInfo} from "../../../../interfaces/fundDetails";
import {cloneDeep} from "lodash";
import {escapeStringForCsv} from "../../../../utils/escapeForCsv";

export const HEADER_MAPPINGS = [
  {'header': 'Email', 'path': 'user.email'},
  {'header': 'First Name', 'path': 'first_name'},
  {'header': 'Last Name', 'path': 'last_name'},
  {'header': 'Eligibility Decision', 'path': 'eligibility_decision', 'default': IStatus.NA},
  {'header': 'Requested Leverage', 'path': 'investment_detail.requested_leverage_amount'},
  {'header': 'Max Leverage', 'path': 'investment_detail.max_leverage'},
  {'header': 'Final Leverage', 'path': 'investment_detail.final_leverage_ratio'},
  {'header': 'Final Leverage Amount', 'path': 'investment_detail.final_leverage_amount'},
  {'header': 'Requested Equity', 'path': 'investment_detail.requested_entity'},
  {'header': 'Final Equity', 'path': 'investment_detail.final_entity'},
  {'header': 'Requested Total Investment', 'path': 'investment_detail.requested_total_investment'},
  {'header': 'Total Investment', 'path': 'investment_detail.final_total_investment'},
  {'header': 'Application Approval', 'path': 'application_approval', 'default': IStatus.NA},
  {'header': 'KYC/AML', 'path': 'kyc_aml', 'default': IStatus.NA},
  {'header': 'Tax Review', 'path': 'taxReview', 'default': IStatus.NA},
  {'header': 'Internal Tax', 'path': 'internal_tax', 'default': IStatus.NA},
  {'header': 'Final Review', 'path': 'legalDocs', 'default': IStatus.NA},
  {'header': 'Job Band/Level', 'path': 'job_band'},
  {'header': 'Department', 'path': 'department'},
  {'header': 'Office Location', 'path': 'office_location'},
  {'header': 'Region', 'path': 'region'},
  {'header': 'How will you be investing', 'path': 'investing_as'},
  {'header': 'Where were you when you decided to invest', 'path': 'investor_location'},
  {'header': 'Restricted Time Period', 'path': 'restricted_time_period'},
  {'header': 'Restricted Geographic Area', 'path': 'restricted_geographic_area'},
  {'header': 'Requested Leverage', 'path': 'investment_detail.requested_leverage'},
  {'header': 'Leverage Amount', 'path': 'investment_detail.leverage_amount'},
  {'header': 'Cashless Commit', 'path': 'investment_detail.cashless_commitment'},
  {'header': 'Vehicle Name', 'path': 'vehicle.name'},
  {'header': 'Share Class', 'path': 'share_class.display_name'},
  {'header': 'Investor Account Code', 'path': 'investor_account_code'},
  {'header': 'Internal Comments', 'path': 'internal_comments'},
  {'header': 'Application Started', 'path': 'application_started'},
  {'header': 'Application UUID', 'path': 'uuid'}
]


export const getHeaderMappings = (fund: IFundBaseInfo) => {
  if (fund.enable_internal_tax_flow && !fund.skip_tax) return cloneDeep(HEADER_MAPPINGS)
  return HEADER_MAPPINGS.filter(mapping => {
    if (mapping.path === 'internal_tax') return fund.enable_internal_tax_flow
    if (mapping.path === 'taxReview') return !fund.skip_tax
    return true
  })
}

export const headers = (fund: IFundBaseInfo) => {
  const headerMappings = getHeaderMappings(fund)
  return headerMappings.map(header => header.header)
}

export const mapDepartmentValue = (departmentValue: string) => {
  if (!departmentValue) return departmentValue
  const departmentOption = DEPARTMENTS.find(
    (department) => department.value === departmentValue
  )
  if (!departmentOption) return departmentValue
  return departmentOption.label
}

export const formatDownloadableData = (applicants: IApplicantManagementRow[], applicantStatuses: IApplicantStatuses, fund: IFundBaseInfo) => {
  const csvRows = applicants.map((applicant: IApplicantManagementRow) => {
    const status = applicantStatuses && applicantStatuses[applicant.id]
    const mergedData = {...applicant, ...(status ? status : {})}
    const data = {} as any;
    const headerMappings = getHeaderMappings(fund);
    headerMappings.forEach(mapping => {
      let formattedValue = '';
      if (mapping.path === 'department') {
        const department = get(mergedData, mapping.path)
        formattedValue = mapDepartmentValue(department)
      }
      else {
        if (mapping.default) formattedValue = get(mergedData, mapping.path, mapping.default)
        else formattedValue = get(mergedData, mapping.path)
      }
      data[mapping.header] = escapeStringForCsv(formattedValue)
    })
    return data
  })
  return csvRows

}