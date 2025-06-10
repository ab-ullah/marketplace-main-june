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
  LEVERAGE_OPTIONS,
  OFFICE_LOCATIONS,
  TAX_COUNTRY,
  getOnBoardingSchema,
  getSchemaValidation,
} from "./constants";
import { Formik } from "formik";
import { InterestForm } from "./styles";
import styled from "styled-components";
import Form from "react-bootstrap/Form";
import TextInput from "./TextInput";
import SelectorField from "./SelectorField";
import RadioGroup from "./RadioGroup";
import BarGraph from "./BarGraph";
import Button from "react-bootstrap/Button";
import API from "../../../../api/marketplaceApi";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { markIndicateInterest } from "../../indicateInterestSlice";
import CurrencyInput from "./CurrencyInput";


import { IInvestmentAmount } from "../../../../interfaces/EligibilityCriteria/criteriaResponse";
import CommentWrapper from "../../../../components/CommentWrapper";

import { Comment as IComment } from "../../../../interfaces/workflows";
import { useGetFundDetailsQuery } from "../../../../api/rtkQuery/fundsApi";
import { useParams } from "react-router-dom";
import { selectKYCRecord } from "../../../KnowYourCustomer/selectors";
import {LEVERAGE_DETAIL_URL, SKIP_LEVERAGE_RATIOS} from "../../constants";
import {selectUserInfo} from "../../../User/selectors";
import { CommentsContext } from "pages/ApplicationView";
import FormattedCurrency from "../../../../utils/FormattedCurrency";

interface IndicateInterestFormProps {
  fund?: IFundWithProfile;
  isOnBoarding?: boolean;
  showBasicInfoFields?: boolean;
  callbackSubmit?: (args0: any) => void;
  investmentInfo?: IInvestmentAmount | null;
  customOnFieldUpdate?: (arg0: any) => void;
  fullApplicationMode?: boolean;
  maxLeverage?: number | null;
  minimumInvestment?: number | null;
  offerLeverage?: boolean | null;
  isEditDisabled?: boolean;
}

export const FormContainerDiv = styled.div`
  width: 100%;
  padding: 24px 45px;
  background: #eceff1;
`;

export const TotalGrossInvestment = styled.div`
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 4px;
`;

const leverageMultiple = (value: string) => {
  if (value === "2:1") {
    return 2;
  }

  if (value === "3:1") {
    return 3;
  }

  if (value === "4:1") {
    return 4;
  }

  return 0;
};

const IndicateInterestForm: FunctionComponent<IndicateInterestFormProps> = ({
  fund,
  isOnBoarding,
  showBasicInfoFields,
  callbackSubmit,
  investmentInfo,
  customOnFieldUpdate,
  fullApplicationMode,
  maxLeverage,
  minimumInvestment,
  offerLeverage,
  isEditDisabled
}) => {
  const {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const kycRecord = useAppSelector(selectKYCRecord)
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const currencyCode = fundDetails?.currency ? fundDetails?.currency.code : 'USD'

  if (isNull(minimumInvestment)) return <></>;

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);

    if (fund && !showBasicInfoFields && !setSubmitting) {
      const payload = {
        fund: fund.id,
        equity_amount: values.investmentAmount,
        leverage_amount:
          values.investmentAmount *
          leverageMultiple(values.interestedInLeverage),
        interest_details: values,
      };
      // await API.createFundInterest(payload);
      dispatch(markIndicateInterest(true));
      setSubmitting(false);
    } else if (callbackSubmit) {
      const payload = {
        amount: parseFloat(values.investmentAmount),
        leverage_ratio: leverageMultiple(values.interestedInLeverage),
      };
      callbackSubmit(payload);
    }
    setSubmitting(false);
  };

  const formInitialValues = { ...INITIAL_VALUES, name: userInfo?.display_name };
  if (investmentInfo) {
    formInitialValues.investmentAmount = investmentInfo.amount;
    if (!investmentInfo.leverage_ratio)
      formInitialValues.interestedInLeverage = "none";
    else
      formInitialValues.interestedInLeverage = `${investmentInfo.leverage_ratio}:1`;
  }

  const getInvestmentAmount = (values: any) => {
    return parseFloat(values.investmentAmount) || 0;
  };

  const getLeverageAmount = (values: any) => {
    let leverageRatio = leverageMultiple(values.interestedInLeverage);
    return getInvestmentAmount(values) * leverageRatio;
  };

  const getLeverageOptions = () => {
    const maxLeverageRatio = maxLeverage ? maxLeverage : get(kycRecord, 'applicationRecord.max_leverage_ratio', undefined)
    const filteredLeverages = filter(
        LEVERAGE_OPTIONS,
        (option) => !includes(SKIP_LEVERAGE_RATIOS, option.multiple));
    if (maxLeverageRatio && maxLeverageRatio > -1)
      return filter(
        filteredLeverages,
        (option) => option.multiple <= maxLeverageRatio
      );
    return filteredLeverages;
  };

  const getValidationSchema = () => {
    const amount = minimumInvestment ? minimumInvestment : 1000;
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
        initialValues={{ ...formInitialValues, offerLeverage }}
        validationSchema={getValidationSchema()}
        onSubmit={onSubmit}
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
        }) => (
          <InterestForm onSubmit={handleSubmit}>
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
                    How much leverage would you like? (Please <a href={LEVERAGE_DETAIL_URL} target="_blank">click here</a> to view eligibility limits on page 5 of the Co-Invest Plan Document):
                  </span>
                }
                disabled={isEditDisabled}
                name={"interestedInLeverage"}
                onChange={(value: any) => {
                  setFieldValue("interestedInLeverage", value);
                  if (customOnFieldUpdate)
                    customOnFieldUpdate({
                      leverage_ratio: leverageMultiple(value),
                      amount: values.investmentAmount,
                    });
                }}
                value={values.interestedInLeverage}
                options={getLeverageOptions()}
              />
            )}

            <Form.Group className={"mb-2"}>
              <Form.Label>Total gross investment</Form.Label>
              <TotalGrossInvestment>
                <FormattedCurrency
                symbol={`${currencyCode} `}
                showCents={true}
                  value={
                    getInvestmentAmount(values) + getLeverageAmount(values)
                  }
                  replaceZeroWith={`${currencyCode} 0`}
                />
              </TotalGrossInvestment>
              {offerLeverage && <BarGraph
                data={[
                  { label: "Your Equity", value: getInvestmentAmount(values) },
                  { label: "Leverage", value: getLeverageAmount(values) },
                ]}
                prefix={`${currencyCode} `}
              />}
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
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isValid}
                className={"submit-button mt-3"}
              >
                Next
              </Button>
            )}
          </InterestForm>
        )}
      </Formik>
    </FormContainerDiv>
  );
};

IndicateInterestForm.defaultProps = {
  isOnBoarding: false,
  showBasicInfoFields: true,
};

export default IndicateInterestForm;
