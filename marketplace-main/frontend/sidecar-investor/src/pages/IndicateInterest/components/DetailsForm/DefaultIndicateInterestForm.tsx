import { FunctionComponent } from "react";
import filter from "lodash/filter";
import isNull from "lodash/isNull";
import map from "lodash/map";
import get from "lodash/get";
import includes from "lodash/includes";
import { IFundWithProfile } from "../../../../interfaces/fundProfile";
import {
  DEPARTMENTS,
  ENTITY_TYPES,
  INITIAL_VALUES,
  JOB_BANDS,
  OFFICE_LOCATIONS,
  TAX_COUNTRY,
  getOnBoardingSchema,
  getSchemaValidation,
} from "./constants";
import { Formik } from "formik";
import { InterestForm } from "./styles";
import Form from "react-bootstrap/Form";
import TextInput from "./TextInput";
import SelectorField from "./SelectorField";
import RadioGroup from "./RadioGroup";
import BarGraph from "./BarGraph";
import API from "../../../../api";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { markIndicateInterest } from "../../indicateInterestSlice";
import CurrencyInput from "./CurrencyInput";
import { selectUserInfo } from "../../../User/selectors";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import { IInvestmentAmount } from "../../../../interfaces/EligibilityCriteria/criteriaResponse";
import CommentWrapper from "../../../../components/CommentWrapper";
import { CommentsContext } from "../../../../pages/ApplicationView";
import { Comment as IComment } from "../../../../interfaces/workflows";
import { selectKYCRecord } from "../../../KnowYourCustomer/selectors";
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, Check } from '@material-ui/icons';
import { ButtonWrapper } from "../../../EligibilityCriteria/components/styles";
import { logMixPanelEvent } from "../../../../utils/mixpanel";
import {toInteger} from "lodash";
import getLeverageOptions from "../../utils";
import { getLeveredAndUnleveredAmount } from "../../../../utils/uniqLeverageRatios";
import { FormContainerDiv, TotalCont } from ".";


const leverageMultiple = (value: string) => {
    return toInteger(value)
  };

  interface DefaultIndicateInterestFormProps {
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
    fundDetails?:any
  }

const DefaultIndicateInterestForm: FunctionComponent<DefaultIndicateInterestFormProps> = ({
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
                                                                            }) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const kycRecord = useAppSelector(selectKYCRecord)
  const leverageOptions = fundDetails?.leverage_options
  const currencyCode = fundDetails?.currency ? fundDetails?.currency.code : 'USD'

  if (!userInfo || isNull(minimumInvestment)) return <></>;

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const {leveredAmount, unleveredAmount} = getLeveredAndUnleveredAmount(getInvestmentAmount(values),maxLeveredCommitmentAmount)
    setSubmitting(true);
    let leverageOption
    try{
      leverageOption = JSON.parse(values.interestedInLeverage)
    } catch(error) {
      leverageOption = {amount: 0, description: ""}
    }
    const leverageAmount = leverageOption.amount
    const cashlessCommitment = values.cashless_commitment
    const description = leverageOption.description
    if (fund && !showBasicInfoFields && !setSubmitting) {
      const payload = {
        fund: fund.id,
        equity_amount: values.investmentAmount,
        leverage_amount:
            values.investmentAmount *
            leverageMultiple(leverageAmount),
        interest_details: values,
        leverage_option_description: description,
        cashless_commitment: cashlessCommitment
      };
      await API.createFundInterest(payload);
      dispatch(markIndicateInterest(true));
      setSubmitting(false);
    } else if (callbackSubmit) {
      const payload = {
        amount: parseFloat(values.investmentAmount),
        leverage_ratio: leverageMultiple(leverageAmount),
        leverage_option_description: description,
        levered_amount: leveredAmount,
        unlevered_amount: unleveredAmount,
        cashless_commitment: cashlessCommitment

      };
      callbackSubmit(payload);
    }
    setSubmitting(false);
    logMixPanelEvent('Onboarding investment amount step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
  };

  const formInitialValues = { ...INITIAL_VALUES, name: userInfo.display_name };
  if (investmentInfo) {
    formInitialValues.investmentAmount = investmentInfo.amount.toString();
    if (investmentInfo.leverage_ratio >= 0) {
      formInitialValues.interestedInLeverage = JSON.stringify({description:investmentInfo.leverage_option_description, amount: investmentInfo.leverage_ratio});
    } else {
      formInitialValues.interestedInLeverage = 'none'
    }
    if(investmentInfo.cashless_commitment) {
      formInitialValues.cashless_commitment = investmentInfo.cashless_commitment
    }
  }
  if(formInitialValues.investmentAmount){
    const floatInvestmentAmount=parseFloat(formInitialValues.investmentAmount)
    formInitialValues.investmentAmount= (!!floatInvestmentAmount ?  floatInvestmentAmount.toFixed(2) : floatInvestmentAmount) as string
  }
if(maxLeveredCommitmentAmount) formInitialValues.max_levered_commitment_amount = maxLeveredCommitmentAmount

  const getInvestmentAmount = (values: any) => {
    return parseFloat(values.investmentAmount) || 0;
  };

  const getLeverageAmount = (values: any, leveredAmount: number) => {
    let leverageOption = JSON.parse(values?.interestedInLeverage || '{}')
    let leverageRatio = leverageMultiple(leverageOption?.amount);
    return leveredAmount * leverageRatio;
  };

  const getCashlessCommitmentAmount = (values: any) => {
    if(offerCashlessCommitment) {
      return Number(values.cashless_commitment)
    }
    return 0
  };

  const getValidationSchema = () => {
    const amount = !isNull(minimumInvestment) ? minimumInvestment : 1000;
    if (isOnBoarding) return getOnBoardingSchema(amount, currencyCode);
    return getSchemaValidation(amount);
  };


  const getComments = (comments: { [key: string]: Comment[]; }, field: string) => {
    const data = filter(comments, (comment, key) => includes(key, field))
    return get(data, `0.`);
  }

  return (
      <FormContainerDiv className="interest-form">
        <Formik
            initialValues={{ ...formInitialValues, offerLeverage, offerCashlessCommitment }}
            validationSchema={getValidationSchema()}
            onSubmit={onSubmit}
            enableReinitialize
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
            }) =>
              {
                // console.log(values, getLeverageAmount(values), getInvestmentAmount(values))
                const {leveredAmount, unleveredAmount} = getLeveredAndUnleveredAmount(getInvestmentAmount(values),maxLeveredCommitmentAmount)
                return <InterestForm onSubmit={handleSubmit}>
                  {showBasicInfoFields && (
                      <>
                        <TextInput
                            name={"name"}
                            label={"Name"}
                            placeholder={"Name"}
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        <SelectorField
                            label="Where were you when you decided to invest?"
                            name={"officeLocation"}
                            placeholder={""}
                            onChange={(value: any) =>
                                setFieldValue("officeLocation", value)
                            }
                            value={values.officeLocation}
                            options={OFFICE_LOCATIONS}
                        />

                        <TextInput
                            name={"jobTitle"}
                            label={"Job Title"}
                            placeholder={"Job Title"}
                            value={values.jobTitle}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        <SelectorField
                            label={"Department"}
                            name={"department"}
                            placeholder={""}
                            onChange={(value: any) => setFieldValue("department", value)}
                            value={values.department}
                            options={DEPARTMENTS}
                        />
                        <SelectorField
                            label={"Job Band"}
                            name={"jobBand"}
                            placeholder={""}
                            onChange={(value: any) => setFieldValue("jobBand", value)}
                            value={values.jobBand}
                            options={JOB_BANDS}
                        />
                        <RadioGroup
                            label={"Are you investing as an Individual or an Entity? "}
                            name={"entityType"}
                            onChange={(value: any) => setFieldValue("entityType", value)}
                            value={values.entityType}
                            options={ENTITY_TYPES}
                        />
                        <SelectorField
                            label={"What is your tax jurisdiction country?"}
                            name={"taxCountry"}
                            placeholder={""}
                            onChange={(value: any) => setFieldValue("taxCountry", value)}
                            value={values.taxCountry}
                            options={TAX_COUNTRY}
                        />
                      </>
                  )}
                  <CurrencyInput
                      name={"investmentAmount"}
                      label="How much equity would you like to invest?"
                      placeholder={"0"}
                      prefix={currencyCode}
                      value={values.investmentAmount}
                      disabled={isEditDisabled}
                      onChange={(value: any) => {
                        setFieldValue("investmentAmount", value);
                        if (customOnFieldUpdate)
                          customOnFieldUpdate({
                            leverage_ratio: leverageMultiple(
                                values.interestedInLeverage
                            ),
                            amount: value,
                          });
                      }}
                      onBlur={() => setFieldTouched("investmentAmount")}
                      helpText={`Min: ${currencyCode} ${minimumInvestment ? minimumInvestment.toLocaleString() : 0}`}
                  />
                  <CommentsContext.Consumer>
                    {({comments}) => (
                        <>
                          {map(getComments(comments, 'investment-amount'), (comment: IComment) => (
                              <CommentWrapper
                                  key={comment.id}
                                  comment={comment}
                              />
                          ))}
                        </>
                    )}
                  </CommentsContext.Consumer>
                  {offerLeverage && (
                      <RadioGroup
                          label={
                            <span>
                    How much leverage would you like?
                  </span>
                          }
                          disabled={isEditDisabled}
                          name={"interestedInLeverage"}
                          onChange={(value: any) => {
                            const leverageOption = JSON.parse(value)
                            setFieldValue("interestedInLeverage", value);
                            if (customOnFieldUpdate){
                              customOnFieldUpdate({
                                leverage_ratio: leverageMultiple(leverageOption.amount),
                                description: leverageOption.description,
                                amount: values.investmentAmount,
                              });
                            }
                          }}
                          value={values.interestedInLeverage}
                          options={getLeverageOptions(kycRecord, leverageOptions, maxLeverage)}
                          vertical
                      />
                  )}
                  {
                    offerCashlessCommitment && <>
                    <CurrencyInput
                    name={"cashless_commitment"}
                    label="Cashless Commitment"
                    placeholder={"0"}
                    prefix={currencyCode}
                    value={values.cashless_commitment}
                    disabled={isEditDisabled}
                    onChange={(value: any) => {
                      setFieldValue("cashless_commitment", value);
                    }}
                    onBlur={() => setFieldTouched("cashless_commitment")}
                    // helpText={`Min: ${currencyCode} ${minimumInvestment ? minimumInvestment.toLocaleString() : 0}`}
                />
                <CommentsContext.Consumer>
                    {({comments}) => (
                        <>
                          {map(getComments(comments, 'cashless_commitment'), (comment: IComment) => (
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
                  {Boolean(get(values,'max_levered_commitment_amount')) &&
                <Form.Group className={"mb-2"}>
                    <Form.Label>Max Levered Amount</Form.Label>
                    <TotalCont>
                      <FormattedCurrency
                          symbol={`${currencyCode} `}
                          showCents={true}
                          value={
                              get(values,'max_levered_commitment_amount')
                          }
                          replaceZeroWith={`${currencyCode} 0`}
                      />
                    </TotalCont>
                  </Form.Group>}
                  <Form.Group className={"mb-2"}>
                    <Form.Label>Total gross investment</Form.Label>
                    <TotalCont>
                      <FormattedCurrency
                          symbol={`${currencyCode} `}
                          showCents={true}
                          value={
                              getInvestmentAmount(values) + getLeverageAmount(values, leveredAmount) + getCashlessCommitmentAmount(values)
                          }
                          replaceZeroWith={`${currencyCode} 0`}
                      />
                    </TotalCont>
                    {offerLeverage && (
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
                                  value: getInvestmentAmount(values),
                                },
                              ]),
                          {
                            label: "Leverage",
                            value: getLeverageAmount(values, leveredAmount),
                          },
                          ...(offerCashlessCommitment ? 
                            [{
                              label: "Cashless Commitment",
                              value: getCashlessCommitmentAmount(values),
                            }]
                          : [])
                        ]}
                        prefix={`${currencyCode} `}
                      />
                      )}
                  </Form.Group>
                  <CommentsContext.Consumer>
                    {({comments}) => (
                        <>
                          {map(getComments(comments, 'leverage-requested'), (comment: IComment) => (
                              <CommentWrapper
                                  key={comment.id}
                                  comment={comment}
                              />
                          ))}
                        </>
                    )}
                  </CommentsContext.Consumer>

                  {!fullApplicationMode && (
                      <ButtonWrapper className="mt-4">
                        <BackButton onClick={onBack}>
                          <ArrowBack /> Previous Step
                        </BackButton>
                        <NextButton type="submit" disabled={isSubmitting || !isValid}>
                          Submit Info <Check />
                        </NextButton>
                      </ButtonWrapper>
                  )}
                </InterestForm>
              }
          }
        </Formik>
      </FormContainerDiv>
  );
};

DefaultIndicateInterestForm.defaultProps = {
  isOnBoarding: false,
  showBasicInfoFields: true,
};

export default DefaultIndicateInterestForm;