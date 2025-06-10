import React, {FunctionComponent, useEffect, useState} from 'react';
import {useAppSelector} from "../../../../app/hooks";
import {selectFundCriteriaPreview, selectLogicFlowValues} from "../../selectors";
import {calculateEligibility, getCriteriaEligibility, getDecisionByPosition} from "../../utils/calculateEligibility";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import API from "../../../../api"

interface FinalStepProps {
  criteriaBlock: ICriteriaBlock;
  isEligible: boolean
}


const FinalStep: FunctionComponent<FinalStepProps> = ({criteriaBlock, isEligible}) => {
  // const [isEligible, setIsEligible] = useState<boolean | null>(null)

  const criteria = useAppSelector(selectFundCriteriaPreview)
  const logicFlowValues = useAppSelector(selectLogicFlowValues)

  // const updateEligibility = async () => {
  //   if (criteria) {
  //     const decision = await getCriteriaEligibility(criteria, logicFlowValues)
  //     if (decision !== isEligible) setIsEligible(decision)
  //   }
  // }
  //
  // useEffect(() => {
  //   updateEligibility()
  // }, [criteria, logicFlowValues])

  if (!criteria) return <></>

  if (isEligible === null) return <div>Calculating eligibility</div>

  if (isEligible) {
    return <>
      <h6 className="mt-5 mb-4">{criteriaBlock.payload.need_review_text}</h6>
    </>
  }

  return <>
    <h4 className="mt-5 mb-4">Not eligible</h4>
    <p>{criteriaBlock.payload.failure_text}</p>
  </>
};

export default FinalStep;
