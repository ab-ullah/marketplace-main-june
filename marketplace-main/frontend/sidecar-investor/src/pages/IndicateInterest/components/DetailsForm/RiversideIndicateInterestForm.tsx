import { Formik } from "formik";
import { FormContainerDiv } from ".";
import { BoldCurrency, CurrencyTitle, InterestForm, TotalGrossCommmitCont } from "./styles";
import CurrencyInput from "./CurrencyInput";
import { getRiversideSchema, RIVERSIDE_INITIAL_VALUES, withDefaultValues } from "./constants";
import isNull from "lodash/isNull";
import { IFundWithProfile } from "../../../../interfaces/fundProfile";
import { IInvestmentAmount } from "../../../../interfaces/EligibilityCriteria/criteriaResponse";
import { ButtonWrapper } from "../../../EligibilityCriteria/components/styles";
import { BackButton, NextButton } from "../../../KnowYourCustomer/styles";
import { ArrowBack, Check } from "@material-ui/icons";
import { CommentsContext } from "../../../ApplicationView";
import CommentWrapper from "../../../../components/CommentWrapper";
import { Comment as IComment } from "../../../../interfaces/workflows";
import map from "lodash/map";
import filter from "lodash/filter";
import includes from "lodash/includes";
import get from "lodash/get";
import { Col, Row } from "react-bootstrap";
import { handleFormatToCurrency } from "../../../../utils/currency";
import BarGraph, { IData } from "./BarGraph";
import { logMixPanelEvent } from "../../../../utils/mixpanel";
import { isEmpty } from "lodash";
import FormikAutoSave from "../../../../components/FormikAutoSave";
import { isApplicationPage } from "../../../../utils/routes";

import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectFundApplicationDetails} from "../../../EligibilityCriteria/selectors";
import {fetchCommentsByApplicationId} from "../../../KnowYourCustomer/thunks";

interface IndicateInterestFormProps {
  fund?: IFundWithProfile;
  isOnBoarding?: boolean;
  showBasicInfoFields?: boolean;
  callbackSubmit?: (args0: any) => void;
  investmentInfo?: IInvestmentAmount | null;
  customOnFieldUpdate?: (arg0: any) => void;
  fullApplicationMode?: boolean;
  maxLeverage?: number | null;
  maxLeveredCommitmentAmount?: number;
  minimumInvestment?: number | null;
  offerLeverage?: boolean | null;
  isEditDisabled?: boolean;
  offerCashlessCommitment?: boolean;
  onBack?: () => void;
  fundDetails?: any
}

const RiversideDetailsForm = ({
  fund,
  isOnBoarding,
  showBasicInfoFields,
  callbackSubmit,
  investmentInfo,
  customOnFieldUpdate,
  fullApplicationMode,
  maxLeverage,
  maxLeveredCommitmentAmount,
  minimumInvestment,
  offerLeverage,
  isEditDisabled,
  offerCashlessCommitment,
  onBack,
  fundDetails
}: IndicateInterestFormProps) => {
  const fundApplication = useAppSelector(selectFundApplicationDetails)
  const dispatch = useAppDispatch();
  const formInitialValues = {
    ...RIVERSIDE_INITIAL_VALUES,
    ...(investmentInfo? {...withDefaultValues(investmentInfo),investmentAmount: (get(investmentInfo,'amount') || "") } :{})
  };

  const currencyCode = fundDetails?.currency
    ? fundDetails?.currency.code
    : "USD";
  const fundMinLeverageAmount = Number(fundDetails?.min_leverage_amount || 0)
  const onSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);
    if (callbackSubmit) {
      const payload = {
        amount: parseFloat(values.investmentAmount),
        leverage_ratio: 0,
        leverage_option_description: "",
        levered_amount: Number(values.leverage_amount),
        unlevered_amount: 0,
        cashless_commitment: Number(values.cashless_commitment),
        leverage_amount: Number(values.leverage_amount),
      };
      callbackSubmit(payload);
    }
    setSubmitting(false);
    if (fundApplication?.id) {
      dispatch(fetchCommentsByApplicationId(fundApplication?.id))
    }
    logMixPanelEvent(
      "Onboarding investment amount step",
      get(fundDetails, "company.name"),
      get(fundDetails, "company.slug")
    );
  };
  const getComments = (
    comments: { [key: string]: Comment[] },
    field: string
  ) => {
    const fullKey = `${fundApplication?.eligibility_response}_${field}`
    const data = filter(comments, (comment, key) => includes(key, fullKey));
    return  get(data, `0.`);
  };
  const getValidationSchema = () => {
    const amount = !isNull(minimumInvestment) ? minimumInvestment : 1000;
    if (isOnBoarding) return getRiversideSchema(amount,fundMinLeverageAmount, Number(investmentInfo?.max_leverage_percentage), currencyCode);
  };
  if (isNull(minimumInvestment)) return <></>;

  return (
    <FormContainerDiv className="interest-form">
      <Formik
        initialValues={{
          ...formInitialValues,
          offerLeverage,
          offerCashlessCommitment,
        }}
        validationSchema={getValidationSchema()}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          isSubmitting,
          isValid,
        }) => {
          
          return (
            <Row>
             {isApplicationPage() && <FormikAutoSave/>}
              <Col lg={fullApplicationMode ? 6: 5}>
                <InterestForm>
                  <CurrencyInput
                    name={"investmentAmount"}
                    label="Cash Investment"
                    placeholder={"0"}
                    prefix={currencyCode}
                    value={get(values,'investmentAmount')}
                    disabled={isEditDisabled}
                    onChange={(value: any) => {
                      setFieldValue("investmentAmount", value);
                    }}
                    onBlur={() => setFieldTouched("investmentAmount")}
                    helpText={`Min: ${currencyCode} ${
                      minimumInvestment ? minimumInvestment.toLocaleString() : 0
                    }`}
                  />
                  <CommentsContext.Consumer>
                    {({ comments }) => (
                      <>
                        {map(
                          getComments(comments, "amount"),
                          (comment: IComment) => (
                            <CommentWrapper
                              key={comment.id}
                              comment={comment}
                            />
                          )
                        )}
                      </>
                    )}
                  </CommentsContext.Consumer>
                  {offerCashlessCommitment && (
                    <>
                      <CurrencyInput
                        name={"cashless_commitment"}
                        label="Commitment Offset"
                        placeholder={"0"}
                        prefix={currencyCode}
                        value={get(values,'cashless_commitment')}
                        disabled={isEditDisabled}
                        onChange={(value: any) => {
                          setFieldValue("cashless_commitment", value);
                        }}
                        onBlur={() => setFieldTouched("cashless_commitment")}
                      />
                      <CommentsContext.Consumer>
                        {({ comments }) => (
                          <>
                            {map(
                              getComments(comments, "cashless_commitment"),
                              (comment: IComment) => (
                                <CommentWrapper
                                  key={comment.id}
                                  comment={comment}
                                />
                              )
                            )}
                          </>
                        )}
                      </CommentsContext.Consumer>
                    </>
                  )}
                  {offerLeverage && (
                    <>
                      <CurrencyInput
                        name={"leverage_amount"}
                        label="Leverage"
                        placeholder={"0"}
                        prefix={currencyCode}
                        value={get(values,'leverage_amount')}
                        disabled={isEditDisabled}
                        onChange={(value: any) => {
                          setFieldValue("leverage_amount", value);
                        }}
                        onBlur={() => setFieldTouched("leverage_amount")}
                        // helpText={`Min: ${currencyCode} ${minimumInvestment ? minimumInvestment.toLocaleString() : 0}`}
                      />
                      <CommentsContext.Consumer>
                        {({ comments }) => (
                          <>
                            {map(
                              getComments(comments, "leverage_amount"),
                              (comment: IComment) => (
                                <CommentWrapper
                                  key={comment.id}
                                  comment={comment}
                                />
                              )
                            )}
                          </>
                        )}
                      </CommentsContext.Consumer>
                    </>
                  )}
                 {offerLeverage && <p>{`*Minimum Leverage is ${handleFormatToCurrency(fundMinLeverageAmount,currencyCode)} and cannot be more than ${Number(investmentInfo?.max_leverage_percentage)}% of Total Equity Investment`}</p> }
                </InterestForm>
              </Col>
            {!fullApplicationMode && <Col/>}  
              <Col lg={6}>
                <TotalGrossCommmitCont>
                  <div>
                  <CurrencyTitle>Total Gross Commitment</CurrencyTitle>
                  <BoldCurrency>
                    {" "}
                    {handleFormatToCurrency(
                      (Number(get(values,'investmentAmount')) +
                        Number(get(values,'cashless_commitment')) +
                        Number(get(values,'leverage_amount'))),
                      currencyCode
                    )}
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
                          label: "Cash Investment",
                          value: Number(get(values,'investmentAmount')),
                        },
                        offerCashlessCommitment && {
                          label: "Commitment Offset",
                          value: Number(get(values,'cashless_commitment')),
                        },
                        offerLeverage && {
                          label: "Leverage",
                          value: Number(get(values,'leverage_amount')),
                        },
                      ].filter((elem) => !isEmpty(elem)) as IData[]
                    }
                  />
                  </div>
                  </div>
                  <hr/>
                </TotalGrossCommmitCont>
              </Col>
              {!fullApplicationMode && (
                <ButtonWrapper className="mt-4">
                  <BackButton onClick={onBack}>
                    <ArrowBack /> Previous Step
                  </BackButton>
                  <NextButton onClick={handleSubmit} disabled={isSubmitting || !isValid}>
                    Submit Info <Check />
                  </NextButton>
                </ButtonWrapper>
              )}
            </Row>
          );
        }}
      </Formik>
    </FormContainerDiv>
  );
};

export default RiversideDetailsForm;
