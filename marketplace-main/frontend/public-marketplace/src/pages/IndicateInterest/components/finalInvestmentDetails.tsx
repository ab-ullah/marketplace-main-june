import {FunctionComponent} from "react";
import {useParams} from "react-router-dom";
import {TotalGrossInvestment} from "./DetailsForm";
import {EligibilityInterestForm, FinalInvestmentAmountDiv, FormContent} from "./styles";
import {InterestForm} from "./DetailsForm/styles";
import CurrencyInput from "./DetailsForm/CurrencyInput";
import RadioGroup from "./DetailsForm/RadioGroup";
import {LEVERAGE_OPTIONS} from "./DetailsForm/constants";
import Form from "react-bootstrap/Form";
import BarGraph from "./DetailsForm/BarGraph";
import Button from "react-bootstrap/Button";
import {Comment} from "../../../interfaces/workflows";
import map from "lodash/map";


import filter from "lodash/filter";
import includes from "lodash/includes";
import get from "lodash/get";
import {IInvestmentDetail} from "../../../interfaces/EligibilityCriteria/criteriaResponse";
import {useGetFundDetailsQuery} from "../../../api/rtkQuery/fundsApi";
import { CommentsContext } from "pages/ApplicationView";
import CommentWrapper from "../../../components/CommentWrapper";
import FormattedCurrency from "../../../utils/FormattedCurrency";
import CustomInput from "components/Input";


interface FinalInvestmentDetailProps {
  investmentDetail: IInvestmentDetail
  nextFunction?: () => void
  applicationView?: boolean;
}

const FinalInvestmentDetail: FunctionComponent<FinalInvestmentDetailProps> = ({investmentDetail, nextFunction ,applicationView}) => {

  const {externalId} = useParams<{ externalId: string }>();
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);

  if (!investmentDetail) return <></>

  const currencyCode = fundDetails?.currency ? fundDetails?.currency.code : 'USD'
  const finalEntity = investmentDetail.final_entity ? investmentDetail.final_entity : 0;
  const totalInvestment = investmentDetail.total_investment ? investmentDetail.total_investment : 0;
  const finalLeverageAmount = investmentDetail.final_leverage_amount ? investmentDetail.final_leverage_amount : 0;

  const getComments = (comments: { [key: string]: Comment[]; }, field: string) => {
    const data = filter(comments, (comment, key) => includes(key, field))
    return get(data, `0.`);
  }

  return (
    <>

      <EligibilityInterestForm>
        <FormContent>
          These are the finalized investment details
        </FormContent>
        <FinalInvestmentAmountDiv>
          <InterestForm>
            <CurrencyInput
              name={"investmentAmount"}
              label="Finalized Equity"
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
                  {map(getComments(comments, 'final-equity'), (comment: Comment) => (
                    <CommentWrapper
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </>
              )}
            </CommentsContext.Consumer>
            {/* <RadioGroup
              label={<span>Finalized Leverage:</span>}
              disabled={true}
              name={"interestedInLeverage"}
              onChange={() => {
              }}
              value={investmentDetail.final_leverage_ratio}
              options={LEVERAGE_OPTIONS}
              hideErrorMessage={true}
            /> */}
            {!applicationView &&
            <CustomInput
            type="radio"
            title="Finalized Leverage:"
            value={investmentDetail.final_leverage_ratio}
            options={LEVERAGE_OPTIONS}
            error=''
            handleChange={()=>{}}
            fieldId="interestedInLeverage"
            disabled={true}
            />}
            <CommentsContext.Consumer>
              {({comments}) => {
                return <>
                  {map(getComments(comments, 'final-leverage'), (comment: Comment) => (
                    <CommentWrapper
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </>
              }}
            </CommentsContext.Consumer>
            <Form.Group className={"mb-2"}>
              <Form.Label>Finalized gross investment</Form.Label>
              <TotalGrossInvestment>
                <FormattedCurrency
                  symbol={`${currencyCode} `}
                  showCents={true}
                  value={totalInvestment}
                  replaceZeroWith={`${currencyCode} 0`}
                />
              </TotalGrossInvestment>
              <CommentsContext.Consumer>
                {({comments}) => (
                  <>
                    {map(getComments(comments, 'final-total-investment'), (comment: Comment) => (
                      <CommentWrapper
                        key={comment.id}
                        comment={comment}
                      />
                    ))}
                  </>
                )}
              </CommentsContext.Consumer>
              {!applicationView &&
              <BarGraph
                data={[
                  {label: "Your Equity", value: parseFloat(`${finalEntity}`)},
                  {label: "Leverage", value: parseFloat(`${finalLeverageAmount}`)},
                ]}
                prefix={`${currencyCode} `}
              />}
            </Form.Group>

            {nextFunction && <Button
              variant="primary"
              onClick={nextFunction}
              className={"submit-button mt-3"}
            >
              Next
            </Button>}

          </InterestForm>
        </FinalInvestmentAmountDiv>
      </EligibilityInterestForm>
    </>
  );
};

export default FinalInvestmentDetail;
