import React, {FunctionComponent} from "react";
import {useParams} from "react-router-dom";
import {TotalCont} from "../../../IndicateInterest/components/DetailsForm";
import {BoldCurrency, CurrencyTitle, EligibilityInterestForm, FinalInvestmentAmountDiv, FormContent, TotalGrossCommmitCont} from "./stlyes";
import {useGetFundDetailsQuery} from "../../../../api/rtkQuery/fundsApi";
import {InterestForm} from "../../../IndicateInterest/components/DetailsForm/styles";
import CurrencyInput from "../../../IndicateInterest/components/DetailsForm/CurrencyInput";
import RadioGroup from "../../../IndicateInterest/components/DetailsForm/RadioGroup";
import {LEVERAGE_OPTIONS} from "../../../IndicateInterest/components/DetailsForm/constants";
import Form from "react-bootstrap/Form";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import BarGraph, { IData } from "../../../IndicateInterest/components/DetailsForm/BarGraph";
import Button from "react-bootstrap/Button";
import {IInvestmentDetail} from "../../../../interfaces/EligibilityCriteria/criteriaResponse";
import map from "lodash/map";
import {Comment as IComment} from "../../../../interfaces/workflows";
import CommentWrapper from "../../../../components/CommentWrapper";
import {CommentsContext} from "../../../ApplicationView";
import filter from "lodash/filter";
import includes from "lodash/includes";
import get from "lodash/get";
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, Check } from '@material-ui/icons';
import { ButtonWrapper } from "../../../EligibilityCriteria/components/styles";
import {useAppSelector} from "../../../../app/hooks";
import {selectKYCRecord} from "../../../KnowYourCustomer/selectors";
import getLeverageOptions from "../../../IndicateInterest/utils";
import { getLeveredAndUnleveredAmount } from "../../../../utils/uniqLeverageRatios";
import isEmpty from "lodash/isEmpty";
import { handleFormatToCurrency } from "../../../../utils/currency";
import { Col, Row } from "react-bootstrap";


interface FinalInvestmentDetailProps {
  investmentDetail: IInvestmentDetail
  nextFunction?: () => void
  applicationView?: boolean;
  onBack?: () => void;
  maxLeveredCommitmentAmount?: number;
  offerCashlessCommitment: boolean
}

const FinalInvestmentDetail: FunctionComponent<FinalInvestmentDetailProps> = ({investmentDetail, 
  nextFunction,
  applicationView, 
  onBack, 
  maxLeveredCommitmentAmount,
  offerCashlessCommitment
}) => {

  const {externalId} = useParams<{ externalId: string }>();
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const kycRecord = useAppSelector(selectKYCRecord)
  const {maxLeverageRatio} = useAppSelector(selectKYCRecord);

  if (!investmentDetail) return <></>

  const currencyCode = fundDetails?.currency ? fundDetails?.currency.code : 'USD'
  const showCommitmentFlow = Boolean(fundDetails?.show_new_commitment_flow)
  const sectionDescription = get(investmentDetail,'finalized_section_description','')
  const finalEntity = get(investmentDetail,'final_entity',0);
  const cashlessCommitment = get(investmentDetail,'final_cashless_commitment',0);
  const totalInvestment = investmentDetail.total_investment ? investmentDetail.total_investment : 0;
  const {leveredAmount, unleveredAmount} = getLeveredAndUnleveredAmount(finalEntity,maxLeveredCommitmentAmount)
  const finalLeverageAmount = get(investmentDetail,'final_leverage_amount',0);
  const finalLeverageRatio = investmentDetail.final_leverage_ratio;
  const leverageOptionDescription = investmentDetail.final_leverage_option_description ? investmentDetail.final_leverage_option_description : "";
  const offerLeverage = fundDetails?.offer_leverage;
  const leverageOptions = fundDetails?.leverage_options
  let leverageRatio
  if(finalLeverageRatio){
    const match = finalLeverageRatio.match(/^\d+/);
    if(match){
      leverageRatio = parseInt(match[0], 10);
    }
  }

  const getComments = (comments: { [key: string]: Comment[]; }, field: string) => {
    const data = filter(comments, (comment, key) => includes(key, field))
    return get(data, `0.`);
  }
  const interestedInLeverage = JSON.stringify({description:leverageOptionDescription, amount: leverageRatio !== undefined ? leverageRatio: ""});

  return (
    <>
      <EligibilityInterestForm>
        <FormContent>
          {sectionDescription}
        </FormContent>
        <FinalInvestmentAmountDiv>
          <InterestForm>
            <Row>
            <Col lg={showCommitmentFlow? 6 :12}>
            <CurrencyInput
              name={"investmentAmount"}
              label={showCommitmentFlow ? "Final Cash Investment" : "Finalized Equity" }
              placeholder={"0"}
              prefix={currencyCode}
              value={finalEntity}
              disabled={true}
              onChange={() => {
              }}
              onBlur={() => {
              }}
              hideErrorMessage={true}
            />
            <CommentsContext.Consumer>
              {({comments}) => (
                <>
                  {map(getComments(comments, 'final-equity'), (comment: IComment) => (
                    <CommentWrapper
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </>
              )}
            </CommentsContext.Consumer>
            {offerCashlessCommitment && <> <CurrencyInput
              name={"cashlessCommitment"}
              label="Final Commitment Offset"
              placeholder={"0"}
              prefix={currencyCode}
              value={cashlessCommitment}
              disabled={true}
              onChange={() => {
              }}
              onBlur={() => {
              }}
              hideErrorMessage={true}
            />
            <CommentsContext.Consumer>
              {({comments}) => (
                <>
                  {map(getComments(comments, 'final_cashless-commitment'), (comment: IComment) => (
                    <CommentWrapper
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </>
              )}
            </CommentsContext.Consumer>
            </>
            }
            {offerLeverage && <>
            {showCommitmentFlow ?
          <CurrencyInput
            name={"leverage_amount"}
            label="Final Leverage"
            placeholder={"0"}
            prefix={currencyCode}
            value={get(investmentDetail,'final_leverage',0)}
            disabled={true}
            onChange={() => {
            }}
            onBlur={() => {
            }}
            hideErrorMessage={true}
        />
        :  
          <RadioGroup
                  label={<span>Finalized Leverage:</span>}
                  disabled={true}
                  name={"interestedInLeverage"}
                  onChange={() => {}}
                  value={interestedInLeverage}
                  options={getLeverageOptions(kycRecord, leverageOptions, maxLeverageRatio)}
                  hideErrorMessage={true}
                  vertical
              />}
            <CommentsContext.Consumer>
              {({comments}) => {
                return <>
                  {map(getComments(comments, 'final-leverage'), (comment: IComment) => (
                    <CommentWrapper
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </>
              }}
            </CommentsContext.Consumer></>}

            </Col>
            <Col lg={showCommitmentFlow? 6 :12}>
            {showCommitmentFlow ?
             <TotalGrossCommmitCont>
             <div>
             <CurrencyTitle>Finalized gross investment</CurrencyTitle>
                  <BoldCurrency>
                    {" "}
                    {handleFormatToCurrency(totalInvestment,currencyCode)}
                      {`  ${currencyCode}`}
                  </BoldCurrency>
                  <div className="mt-4">
                  <BarGraph
                   barHeight="15px"
                    hideInGraphData
                    displayLegend
                    prefix={`${currencyCode} `}
                    barItemColors={[
                      "#4A46A3",
                      offerCashlessCommitment ? "#A6A5F6" : "",
                      offerLeverage ? "#9C9CB8" : "",
                    ].filter((elem) => elem)}
                    data={
                      [
                        {
                          label: "Final Cash Investment",
                          value: Number(finalEntity),
                        },
                        offerCashlessCommitment && {
                          label: "Final Commitment Offset",
                          value: Number(cashlessCommitment),
                        },
                        offerLeverage && {
                          label: "Final Leverage",
                          value: Number(get(investmentDetail,'final_leverage',0)),
                        },
                      ].filter((elem) => !isEmpty(elem)) as IData[]
                    }
                   />
                  </div>
                  <hr/>
             </div>
             </TotalGrossCommmitCont>
             :
            <Form.Group className={"mb-2"}>
              <Form.Label>Finalized gross investment</Form.Label>
              <TotalCont>
                <FormattedCurrency
                  symbol={`${currencyCode} `}
                  showCents={true}
                  value={totalInvestment}
                  replaceZeroWith={`${currencyCode} 0`}
                />
              </TotalCont>
              <CommentsContext.Consumer>
                {({comments}) => (
                  <>
                    {map(getComments(comments, 'final-total-investment'), (comment: IComment) => (
                      <CommentWrapper
                        key={comment.id}
                        comment={comment}
                      />
                    ))}
                  </>
                )}
              </CommentsContext.Consumer>
              {offerLeverage && 
                <BarGraph
                data={[
                  ...(maxLeveredCommitmentAmount
                    ? [
                        { label: "Unlevered", value: unleveredAmount },
                        { label: "Levered", value: leveredAmount },
                      ]
                    : [
                        {
                          label: "Your Equity",
                          value: parseFloat(`${finalEntity}`),
                        },
                      ]),
                  {
                    label: "Leverage",
                    value: parseFloat(`${finalLeverageAmount}`),
                  },
                ]}
                prefix={`${currencyCode} `}
              />
              }
            </Form.Group>
}
</Col>

            {
              nextFunction && onBack && <ButtonWrapper className="mt-4">
              <BackButton onClick={onBack} >
                <ArrowBack /> Previous Step
              </BackButton>
              <NextButton onClick={nextFunction}>
                 Submit Info <Check />
              </NextButton>
            </ButtonWrapper>
            }

          </Row>
          </InterestForm>
        </FinalInvestmentAmountDiv>
      </EligibilityInterestForm>
    </>
  );
};

export default FinalInvestmentDetail;
