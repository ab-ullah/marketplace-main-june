export interface IUser {
  id: number;
  email: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  logins_count: number;
  groups: IGroup[]
}


export interface IGroup {
  id: number,
  name: string
}
