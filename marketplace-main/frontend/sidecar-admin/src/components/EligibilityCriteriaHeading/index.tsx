import React, {FunctionComponent} from 'react';
import {IEligibilityCriteriaDetail} from "../../interfaces/EligibilityCriteria/criteria";


interface EligibilityCriteriaHeadingProps {
  criteriaDetail: IEligibilityCriteriaDetail;
}


const EligibilityCriteriaHeading: FunctionComponent<EligibilityCriteriaHeadingProps> = ({criteriaDetail}) => {
  return <>
      {`${criteriaDetail.fund_name} / ${criteriaDetail.name}`}
  </>
};

export default EligibilityCriteriaHeading;
