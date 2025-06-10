export interface ICompanyFaq {
  question: string;
  answer: string;
  display_on_top: boolean
}


export interface ICompanyStat {
  label: string;
  value: string;
}

export interface ICompanyProfile {
  program_name: string;
  logo: string;
  mission_statement: string;
  stats: ICompanyStat[];
  opportunities_description: string;
  contact_email: string;
}

export interface ICompany {
  name: string;
  logo: string;
  company_profile: ICompanyProfile;
  company_faqs: ICompanyFaq[]
}