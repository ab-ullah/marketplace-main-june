export enum IOverviewLabels {
    investor_location = "Where were you when you decided to invest?",
    kyc_investor_type_name = "How will you be investing?",
    first_name = "First Name",
    last_name = "Last Name",
    job_title = "Job Title",
    department = "Department",
    job_band = "Job Band",
    restrictedTimePeriod = "Restricted Time Period",
    restrictedGeographicArea = "Restricted Geographic Area"
}

export interface ICountry {
  label: string;
  value: string;
  id: number;
}
