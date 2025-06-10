import React, {FunctionComponent, useEffect, useState} from "react";
import {Link, useHistory, useParams} from "react-router-dom";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectFundApplicationDetails, selectFundCriteriaResponse, selectIsEligible} from "../../selectors";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import DetailsForm from "../../../IndicateInterest/components/DetailsForm";
import FinalStep from "./index";
import {EligibilityInterestForm, FormContent, WideNextButton} from "./stlyes";
import eligibilityCriteriaAPI from "../../../../api/eligibilityCriteria";
import eligibilityCriteriaApi from "../../../../api/eligibilityCriteria";
import {setInvestmentAmount} from "../../eligibilityCriteriaSlice";
import {useGetApplicationStatusQuery, useGetDefaultOnBoardingDetailsQuery, useGetFundDetailsQuery} from "../../../../api/rtkQuery/fundsApi";
import FinalInvestmentDetail from "./FinalInvestmentDetailView";
import NavableLoader from "../../../../components/NavableLoader";
import get from "lodash/get";
import { ButtonWrapper } from "../styles";
import { BackButton } from "../../../KnowYourCustomer/styles";
import { ArrowBack } from "@material-ui/icons";
import { useCompanyPrefix } from "../../../../utils/hooks";
import {IApplicationStatus} from "../../../../interfaces/application";


const NEXT_STEP_MESSAGE = 'Thank you! Next we’ll cover your KYC details.'


interface IndicateInterestProps {
  criteriaBlock: ICriteriaBlock;
  backFunction: () => void;
}

const IndicateInterest: FunctionComponent<IndicateInterestProps> = ({
  criteriaBlock,
  backFunction
}) => {
  const [hasSubmittedIndicateInterest, setSubmittedIndicateInterest] =
    useState(false);
  const {externalId} = useParams<{ externalId: string }>();
  const {companyPrefix} =useCompanyPrefix()
  const dispatch = useAppDispatch()
  const [isEligible, setIsEligible] = useState<boolean | null>(null)
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)
  const fundApplication = useAppSelector(selectFundApplicationDetails)
  const {data: defaultOnBoardingDetails} = useGetDefaultOnBoardingDetailsQuery(externalId);
  const isAllocationApproved = get(defaultOnBoardingDetails, 'is_allocation_approved');
  const isAllocationLocked = get(defaultOnBoardingDetails, 'is_allocation_locked');
  const investmentDetails = get(defaultOnBoardingDetails, 'investment_details');
  const maxLeveredCommitmentAmount = get(defaultOnBoardingDetails, 'investment_details.application_max_levered_amount')
  const {data: applicationStatus} = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const history = useHistory();

  const canGoPastEligibility = applicationStatus?.can_go_past_eligibility;
  const offerCashlessCommitment=(!fundApplication?.disable_cashless_commitment) &&
    (fundDetails.cashless_commitment_enabled === true)

  const getResponseStatus = async (responseId: number) => {
    const response = await eligibilityCriteriaApi.getResponseStatus(responseId);
    setIsEligible(response?.is_eligible)
  }

  useEffect(() => {
    if (fundCriteriaResponse) {
      getResponseStatus(fundCriteriaResponse.id)
    }

  }, [fundCriteriaResponse])

  if (!fundCriteriaResponse) return <></>

  if (isEligible === null) return <NavableLoader/>

  if (!isEligible) return <>
   <h4 className="mt-5 mb-4">Not eligible</h4>
    <p>{criteriaBlock.payload.failure_text}</p>
    <BackButton onClick={backFunction}>
              <ArrowBack /> Previous Step
    </BackButton>
  </>

  const submitInvestmentAmount = async (payload: any) => {
    const data = await eligibilityCriteriaAPI.createInvestmentAmount(
      fundCriteriaResponse.id,
      payload
    )
    dispatch(setInvestmentAmount(data))
    setSubmittedIndicateInterest(true)
  }

  if (!hasSubmittedIndicateInterest && isEligible && (isAllocationLocked || isAllocationApproved)) {
    return <FinalInvestmentDetail
      investmentDetail={investmentDetails}
      nextFunction={async() => {
        isAllocationLocked && await eligibilityCriteriaAPI.createEligibilityCriteriaResponseReviewTask(fundCriteriaResponse.id)
        setSubmittedIndicateInterest(true)
      }}
      onBack={backFunction}
      maxLeveredCommitmentAmount={maxLeveredCommitmentAmount}
      offerCashlessCommitment={offerCashlessCommitment}
    />
  }

const defaultDescription =  fundCriteriaResponse?.offer_leverage ? "Please enter your requested equity investment amount and select a leverage option to indicate your total requested gross investment. The requested amount can be updated up until the Application Period is closed. After the Application Period is closed, requested amounts and leverage can only be decreased prior to signing the subscription documents.":
              "After the Application Period is closed, requested amounts can only be decreased prior to signing the subscription documents."
const reiversideDescription =  fundCriteriaResponse?.offer_leverage ? "Please enter your investment and leverage amounts." : "Please enter your investment amounts."
  return (
    <>
      {isEligible && !hasSubmittedIndicateInterest ? (
        <EligibilityInterestForm>
            <FormContent>
            {
             get(fundDetails,'show_new_commitment_flow') ? reiversideDescription : defaultDescription
            }
            </FormContent>
            <DetailsForm
                isOnBoarding={true}
                showBasicInfoFields={false}
                callbackSubmit={(payload: any) => submitInvestmentAmount(payload)}
                investmentInfo={fundCriteriaResponse?.investment_amount}
                maxLeverage={fundApplication?.max_leverage_ratio}
                maxLeveredCommitmentAmount={maxLeveredCommitmentAmount}
                minimumInvestment={fundCriteriaResponse?.min_investment}
                offerLeverage={fundCriteriaResponse?.offer_leverage}
                offerCashlessCommitment={offerCashlessCommitment}
                onBack={backFunction}
            />
        </EligibilityInterestForm>
      ) : (
        <>
          <h6 className="mt-5 mb-4">{canGoPastEligibility ? NEXT_STEP_MESSAGE : criteriaBlock.payload.need_review_text}</h6>
          <ButtonWrapper>
            <BackButton onClick={() => {
              if(isEligible && hasSubmittedIndicateInterest) {
                setSubmittedIndicateInterest(false)
              } else {
                backFunction()
              }
            }}>
              <ArrowBack /> Previous Step
            </BackButton>
            {canGoPastEligibility ? (
                <WideNextButton onClick={() => history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/amlkyc`)}>
                  Next
                </WideNextButton>
            ) : (
                <Link to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`} className="p-3 btn btn-outline-primary btn-purple">
                  Go to My Application
                </Link>
            )}
          </ButtonWrapper>
        </>
      )}
    </>
  );
};

export default IndicateInterest;
