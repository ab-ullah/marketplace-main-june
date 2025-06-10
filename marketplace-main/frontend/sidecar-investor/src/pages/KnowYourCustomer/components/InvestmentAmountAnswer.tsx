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
import FinalInvestmentDetail from "../../EligibilityCriteria/components/FinalStep/FinalInvestmentDetailView";
import { selectFundApplicationDetails, selectFundCriteriaResponse } from '../../EligibilityCriteria/selectors';
import { useParams } from 'react-router-dom';
import { useGetFundDetailsQuery } from '../../../api/rtkQuery/fundsApi';
import { withDefaultValues } from '../../IndicateInterest/components/DetailsForm/constants';

interface EligibilityCriteriaAnswerProps extends FieldComponent {
}

const InvestmentAmountAnswer: FunctionComponent<EligibilityCriteriaAnswerProps> = ({question}) => {
  const {externalId} = useParams<{ externalId: string }>();
  const {eligibilityResponseId, maxLeverageRatio, minimumInvestment, offerLeverage, answers} = useAppSelector(selectKYCRecord);
  const {
    applicationRecord
  } = useAppSelector(selectKYCRecord);
  const fundApplication = useAppSelector(selectFundApplicationDetails)
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)

  const {data: fundDetails} = useGetFundDetailsQuery(externalId);


  const isAllocationLocked = applicationRecord?.has_custom_equity || applicationRecord?.has_custom_leverage || applicationRecord?.has_custom_total_investment
  const isEditDisabled = isAllocationLocked || get(answers, 'investment_detail.eligibility_decision', '') === APPLICATION_STATUSES.APPROVED

  const answer = question.investmentDetail;
  const finalAmountDetails = get(question.investmentDetail, 'final_amount_details');
  
  const offerCashlessCommitment= (!applicationRecord?.disable_cashless_commitment) &&
    (fundDetails.cashless_commitment_enabled === true)

  const onFieldUpdate = async (payload: any) => {
    if (eligibilityResponseId) await eligibilityCriteriaAPI.createInvestmentAmount(
      eligibilityResponseId, payload, true
    )
  }

   const submitInvestmentAmount = async (payload: any) => {
    if(fundCriteriaResponse){
     await eligibilityCriteriaAPI.createInvestmentAmount(
        fundCriteriaResponse.id,
        payload
      )}
    }

  const debouncedCustomOnFieldUpdate = useMemo(
    () => debounce(onFieldUpdate, 2000)
    , []);

  let investmentInfo = null
  const leverageOptionDescription = answer?.leverage_option_description ? answer?.leverage_option_description : get(finalAmountDetails, 'leverage_option_description')
  const maxLeveredCommitmentAmount = get(finalAmountDetails,'application_max_levered_amount',0) 

  const hideFinalizedSectionForRiverside = get(fundDetails,'show_new_commitment_flow',false) ? get(finalAmountDetails,'hide_finalized_section',false) :false

  if (answer) investmentInfo = {
    ...answer,
    ...answer.final_amount_details,
    leverage_option_description:leverageOptionDescription,
    cashless_commitment: get(answer, 'final_amount_details.cashless_commitment', 0)
  }
  //  {amount: answer.amount,
  //   leverage_option_description: leverageOptionDescription, 
  //   leverage_ratio: answer.leverage_ratio, cashless_commitment: get(answer, 'final_amount_details.cashless_commitment', 0),
  //   investment_record_id: answer.investment_record_id}

  return <InvestmentAmountContainer className="pt-2">
    {isNil(get(investmentInfo, 'investment_record_id')) ? (
      <p>{getUnavailableSectionMesage('Investment Amount')}</p>
    ) : (<>
        <IndicateInterestForm
          isOnBoarding={true}
          showBasicInfoFields={false}
          investmentInfo={investmentInfo}
          callbackSubmit={(payload: any) => submitInvestmentAmount(payload)}
          customOnFieldUpdate={debouncedCustomOnFieldUpdate}
          fullApplicationMode={true}
          maxLeverage={maxLeverageRatio}
          minimumInvestment={minimumInvestment}
          offerLeverage={offerLeverage}
          isEditDisabled={isEditDisabled}
          maxLeveredCommitmentAmount={maxLeveredCommitmentAmount}
          offerCashlessCommitment={offerCashlessCommitment}
        />
        {!hideFinalizedSectionForRiverside && finalAmountDetails && <FinalInvestmentDetail 
        investmentDetail={withDefaultValues(finalAmountDetails)} 
        maxLeveredCommitmentAmount={maxLeveredCommitmentAmount}
        offerCashlessCommitment={offerCashlessCommitment}
        />}
      </>
    )}

  </InvestmentAmountContainer>
}

export default InvestmentAmountAnswer;