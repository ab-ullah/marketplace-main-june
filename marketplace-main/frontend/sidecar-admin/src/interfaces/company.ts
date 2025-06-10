import {ISelectOption} from "./form";

export interface ICompany {
  id: number;
  name: string;
}

export interface ICompanyToken {
  id: number;
  company_name: string;
  token: string;
  company_selector: ISelectOption
}

export interface TooltipType {
  heading: string;
  description: string;
}

export interface carryTooltip {
  key: string;
  tooltip: TooltipType
}

export interface carryPlansConfig {
  tooltips: carryTooltip[]
}