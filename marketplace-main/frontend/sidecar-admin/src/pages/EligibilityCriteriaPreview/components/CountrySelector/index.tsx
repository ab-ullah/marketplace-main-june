import React, {FunctionComponent} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectFundCriteriaPreview} from "../../selectors";
import {setLogicFlowValues} from "../../eligibilityCriteriaPreviewSlice";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import ApplicantInfoForm from "./ApplicantInfoForm";


interface CountrySelectorProps {
  nextFunction: () => void;
  criteriaBlock: ICriteriaBlock
}


const CountrySelector: FunctionComponent<CountrySelectorProps> = ({nextFunction, criteriaBlock}) => {
  const dispatch = useAppDispatch()
  const criteria = useAppSelector(selectFundCriteriaPreview)

  const handleNextFunction = () => {
    dispatch(setLogicFlowValues({[criteriaBlock.id]: true}))
    nextFunction()
  }

  if (!criteria) return <></>

  return <div>
    <h4 className="mt-5 mb-4">Are you investing as an Individual or an Entity?</h4>
    <ApplicantInfoForm handleNextFunction={handleNextFunction}/>
  </div>
};

export default CountrySelector;
