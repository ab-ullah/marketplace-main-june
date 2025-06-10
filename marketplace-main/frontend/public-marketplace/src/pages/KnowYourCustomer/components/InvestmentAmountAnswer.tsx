import React, {FunctionComponent, useMemo} from 'react';
import {FieldComponent} from '../interfaces';
import {useAppSelector} from "../../../app/hooks";
import {selectKYCRecord} from "../selectors";
import IndicateInterestForm from "../../IndicateInterest/components/DetailsForm";
import get from "lodash/get";
import isNil from "lodash/isNil";
import debounce from "lodash/debounce";
import eligibilityCriteriaAPI from "../../../api/eligibilityCriteria"
import {InvestmentAmountContainer} from "../styles";
import { APPLICATION_STATUSES } from '../constants';
import { getUnavailableSectionMesage } from "../../../constants/applicationView";
import FinalInvestmentDetail from "../../IndicateInterest/components/finalInvestmentDetails";


interface EligibilityCriteriaAnswerProps extends FieldComponent {
  page?: string
}

const InvestmentAmountAnswer: FunctionComponent<EligibilityCriteriaAnswerProps> = ({question,page}) => {
  const {eligibilityResponseId, maxLeverageRatio, minimumInvestment, offerLeverage, answers} = useAppSelector(selectKYCRecord);
  const {
    applicationRecord
  } = useAppSelector(selectKYCRecord);


  const isAllocationLocked = applicationRecord?.has_custom_equity || applicationRecord?.has_custom_leverage || applicationRecord?.has_custom_total_investment
  const isEditDisabled = isAllocationLocked || get(answers, 'investment_detail.eligibility_decision', '') === APPLICATION_STATUSES.APPROVED

  const answer = question.investmentDetail;
  const finalAmountDetails = get(question.investmentDetail, 'final_amount_details');

  const onFieldUpdate = async (payload: any) => {
    if (eligibilityResponseId) await eligibilityCriteriaAPI.createInvestmentAmount(
      eligibilityResponseId, payload, true
    )
  }

  const debouncedCustomOnFieldUpdate = useMemo(
    () => debounce(onFieldUpdate, 2000)
    , []);


  let investmentInfo = null
  if (answer) investmentInfo = {...answer}

  return <InvestmentAmountContainer className="pt-2">
    {isNil(get(investmentInfo, 'investment_record_id')) ? (
      <p>{getUnavailableSectionMesage('Investment Amount')}</p>
    ) : (<>
        <IndicateInterestForm
          isOnBoarding={true}
          showBasicInfoFields={false}
          investmentInfo={investmentInfo}
          customOnFieldUpdate={debouncedCustomOnFieldUpdate}
          fullApplicationMode={true}
          maxLeverage={maxLeverageRatio}
          minimumInvestment={minimumInvestment}
          offerLeverage={offerLeverage}
          isEditDisabled={isEditDisabled}
        />
        {finalAmountDetails && <FinalInvestmentDetail investmentDetail={finalAmountDetails} applicationView={page==='applicationView'}/>}
      </>
    )}

  </InvestmentAmountContainer>
}

export default InvestmentAmountAnswer;