export interface IUser {
  first_name: string | null;
  last_name: string | null;
  username: string;
}

export interface ICompanyUser {
  user: IUser;
  company: number;
  role: number;
}

export interface IInvestorProfile {
  id: number;
  name: string;
}