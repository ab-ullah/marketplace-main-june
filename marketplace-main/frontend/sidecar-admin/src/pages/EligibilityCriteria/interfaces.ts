import { ICriteriaFund } from "../../interfaces/EligibilityCriteria/fund";
import { GeoSelector } from "../../interfaces/EligibilityCriteria/regionCountries";
import {
  IEligibilityCriteria,
  IEligibilityCriteriaDetail,
} from "../../interfaces/EligibilityCriteria/criteria";
import { IBlockCategory } from "../../interfaces/EligibilityCriteria/blocks";

export interface IFundTag {
  name: string;
}

export interface EligibilityCriteriaState {
  funds: ICriteriaFund[];
  selectedFund: ICriteriaFund | null;
  geoSelector: GeoSelector[];
  fundTags: IFundTag[];
  fundEligibilityCriteria: IEligibilityCriteria[];
  fetchingEligibilityCriteria: boolean;
  selectedCriteria: IEligibilityCriteria | null;
  selectedCriteriaDetail: IEligibilityCriteriaDetail | null;
  blockCategories: IBlockCategory[];
  adminRequirementsFilled: any;
  templates: any;
  selectedTemplate: any;
}

export interface ICriteriaBlockUpdateAction {
  criteriaBlockId: number;
  payload: any;
  criteriaId: number;
}

export interface ICriteriaBlockOptionDeleteAction {
  criteriaBlockId: number;
  optionId: any;
  criteriaId: number;
}

export interface IAdminRequirement {
  criteriaId: number;
  payload: any;
}
