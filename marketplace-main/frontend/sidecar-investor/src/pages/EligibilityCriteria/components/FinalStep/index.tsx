import React, {FunctionComponent} from 'react';
import {useParams, useHistory} from "react-router-dom";
import {useAppSelector} from "../../../../app/hooks";
import {selectIsEligible} from "../../selectors";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {IApplicationStatus} from "../../../../interfaces/application";
import {useGetApplicationStatusQuery} from "../../../../api/rtkQuery/fundsApi";
import {INVESTOR_URL_PREFIX} from '../../../../constants/routes';
import {NextButton} from './stlyes';
import { useCompanyPrefix } from '../../../../utils/hooks';


interface FinalStepProps {
  criteriaBlock: ICriteriaBlock;
}

const NEXT_STEP_MESSAGE = 'Thank you! Next we’ll cover your KYC details.'

const FinalStep: FunctionComponent<FinalStepProps> = ({criteriaBlock}) => {
  let {externalId} = useParams<{ externalId: string }>();
  const {companyPrefix} =useCompanyPrefix()
  const isEligible = useAppSelector(selectIsEligible);
  const {data: applicationStatus} = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
  const history = useHistory();

  const canGoPastEligibility = applicationStatus?.can_go_past_eligibility;

  if (isEligible) {
    return <>
      <h6
        className="mt-5 mb-4">{canGoPastEligibility ? NEXT_STEP_MESSAGE : criteriaBlock.payload.need_review_text}</h6>
      {canGoPastEligibility && (
        <NextButton
          variant="primary"
          onClick={() => history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/amlkyc`)}
        >
          Next
        </NextButton>
      )}
    </>
  }

  return <>
    <h4 className="mt-5 mb-4">Not eligible</h4>
    <p>{criteriaBlock.payload.failure_text}</p>
  </>
};

export default FinalStep;
