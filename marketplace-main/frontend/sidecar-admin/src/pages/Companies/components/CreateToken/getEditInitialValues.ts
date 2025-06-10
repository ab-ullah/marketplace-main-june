import {ICompanyToken} from "../../../../interfaces/company";


export const getCompanyTokenInitialValues = (companyToken: ICompanyToken) => {
  return {
    company: companyToken.company_selector,
    token: companyToken.token
  }
}

