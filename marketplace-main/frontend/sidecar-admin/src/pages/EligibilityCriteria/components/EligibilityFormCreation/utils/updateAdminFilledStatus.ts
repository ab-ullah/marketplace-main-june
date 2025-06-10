import {ICriteriaBlock} from "../../../../../interfaces/EligibilityCriteria/criteria";
import {getCriteriaBlockIdentifier} from "./blockIdentifier";
import {updateAdminAnswer} from "../../../eligibilityCriteriaSlice";

export const updateAdminFilledStatus = (criteriaBlock: ICriteriaBlock, value: boolean, dispatch: any) => {
  const criteriaBlockId = getCriteriaBlockIdentifier(criteriaBlock)
  const actionPayload = {
    criteriaId: criteriaBlock.criteria,
    payload: {
      [criteriaBlockId]: value
    }
  }
  dispatch(updateAdminAnswer(actionPayload))
}