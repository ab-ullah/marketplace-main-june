import { KYCRecordResponse } from "../../../../interfaces/workflows";

export interface IFlagModal {
    show: boolean;
    requestModalText: string;
    questionId: string;
  }

export interface ITaxDetails {
    taxDetails: {
      id: number;
      us_holder: string;
      is_tax_exempt: string;
      is_entity: string;
      is_tax_exempt_in_country: string;
      tin_or_ssn: string;
      tax_year_end: string;
      countries: number[];
    };
    record: KYCRecordResponse;
    applicationId: number;
  }
  
export const initFlagModal: IFlagModal = {
    show: false,
    requestModalText: "",
    questionId: "",
  };
  
export enum ILabels {
    us_holder = "U.S. Holder",
    is_tax_exempt = "Are you Tax-Exempt under section 501(a) of the code",
    is_entity = "Are you a partnership, estate, trust, S corporation, nominee or similar pass-through entity that is owned, directly or indirectly through one or more other such pass-through entities, by a U.S. Holder",
    is_tax_exempt_in_country = "Are you generally exempt from taxation in the countries above",
    tin_or_ssn = "Taxpayer Identification Number or Social Security Number",
    tax_year_end = "Taxable year end of applicant",
  }