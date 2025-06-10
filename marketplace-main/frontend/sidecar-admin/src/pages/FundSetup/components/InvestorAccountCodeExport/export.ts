import {get} from "lodash";
import {IApplicantManagementRow} from "../../interfaces";
import {escapeStringForCsv} from "../../../../utils/escapeForCsv";
import {IFundBaseInfo} from "../../../../interfaces/fundDetails";
import {getHeaderMappings} from "../ApplicantsList/formatDownloadableData";

class InvestorAccountCodesExport {

  private headerMappings = [
    {'header': 'Application UUID', 'path': 'uuid'},
    {'header': 'Email', 'path': 'user.email'},
    {'header': 'First Name', 'path': 'first_name'},
    {'header': 'Last Name', 'path': 'last_name'},
    {'header': "Investor Account Code", "path": "investor_account_code"},
  ];

  constructor() {
  }

  formatInvestorAccountCodesReport = (applicants: IApplicantManagementRow[]) => {
    return applicants.map((applicant: IApplicantManagementRow) => {
      const data = {} as any;
      this.headerMappings.forEach(mapping => {
        const formattedValue = get(applicant, mapping.path);
        data[mapping.header] = escapeStringForCsv(formattedValue)
      })
      return data
    })
  };

  headers = () => {
      return this.headerMappings.map(header => header.header)
  }
}

export default InvestorAccountCodesExport;
