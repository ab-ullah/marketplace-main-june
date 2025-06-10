export interface ICompanyUser {
  email: string,
  display_name: string,
  user_id: number
}

export interface IAdvisorUser {
  email: string,
  display_name: string,
  user_id: number,
  advisor: number
}