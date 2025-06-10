import {IDocumentDetail} from "./document";

export interface IFundVehicle {
  name: string
  id: number
}


export interface ICompanyReport {
  name: string;
  document: IDocumentDetail
  vehicles: IFundVehicle[];
  report_date: string;
  report_type: string;
  year: number;
}