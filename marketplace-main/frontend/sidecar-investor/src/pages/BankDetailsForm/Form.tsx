import { FunctionComponent, useEffect, useMemo } from "react";
import get from "lodash/get";
import map from "lodash/map";
import find from "lodash/find";
import toLower from "lodash/toLower";
import { Formik } from "formik";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { useParams } from "react-router";
import { fetchGeoSelector } from "../EligibilityCriteria/thunks";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCountries } from "../EligibilityCriteria/selectors";
import { useGetCurrenciesQuery } from "../../api/rtkQuery/commonApi";
import TextField from "../../components/Form/TextField";
import SelectorField from "../IndicateInterest/components/DetailsForm/SelectorField";
import CommentsSection from "./Comments";
import { Params } from "../TaxForms/interfaces";
import { UK_CODE, US_CODE, getSchema } from "./config";
import { ICurrency } from "../../interfaces/currency";
import { NextButton, Checkbox } from "../TaxForms/styles";
import { initValues } from "./config";
import { IBankingDetails } from "../../interfaces/bankingDetails";
import { ArrowForward } from "@material-ui/icons";

interface BankDetailsFormProps {
  details?: IBankingDetails;
  submitOnBlur?: boolean;
  handleSubmit?: any;
  comments?: any;
  disabled?: boolean;
}


const BankDetailsForm: FunctionComponent<BankDetailsFormProps> = ({
  details,
  comments,
  submitOnBlur,
  handleSubmit,
  disabled
}) => {
  const dispatch = useAppDispatch();
  const { externalId } = useParams<Params>();
  const countriesApiData = useAppSelector(selectCountries);
  // const { resetForm} = useFormikContext();

  const { data: currenciesApiData, isLoading: isLoadingCurrencies } =
    useGetCurrenciesQuery(externalId, {
      skip: !externalId,
    });

  const countries = useMemo(() => {
    return map(get(countriesApiData, "0.options"), (country: any) => ({
      value: country.id,
      label: country.label,
      shortCode: country.value
    }));
  }, [countriesApiData]);

  const US_BANK_ID = useMemo(() => {
    const country = find(
      countries,
      (country: any) => toLower(country.label) === "united states"
    );
    return country?.value;
  }, [countries]);

  const currencies = useMemo(() => {
    return map(currenciesApiData, (currency: ICurrency) => ({
      value: currency.id,
      label: currency.code,
    }));
  }, [currenciesApiData]);

  const getInitialData = () => {
    if (details) {
      return {
        ...details,
        bank_country:
          find(
            countries,
            (country: any) => country.value === details.bank_country
          ) || null,
        currency:
          find(
            currencies,
            (currency: any) => currency.value === details.currency
          ) || null,
      };
    }
    return initValues;
  };

  useEffect(() => {
    dispatch(fetchGeoSelector(externalId));
  }, [dispatch, externalId]);

  if (!US_BANK_ID || !currencies || isLoadingCurrencies) return <></>;

  return (
    <Formik
      initialValues={getInitialData()}
      validationSchema={getSchema()}
      onSubmit={handleSubmit}
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
        resetForm
      }) => {
        const onBlur = (event: any) => {
          handleBlur(event);
          submitOnBlur && handleSubmit();
        };
        const isUKBank= get(values, "bank_country.shortCode") === UK_CODE

        const handleCountryChange = (country: any) => {
          // other countries mean other that US and UK
          const isOtherCountry = (shortCode: string): boolean =>
            ![US_CODE, UK_CODE].includes(shortCode);
          const prevSelctedCountryCode = values.bank_country?.shortCode;
          if (
            prevSelctedCountryCode &&
            prevSelctedCountryCode !== country.shortCode &&
            !(
              isOtherCountry(country.shortCode) &&
              isOtherCountry(prevSelctedCountryCode)
            )
          ) {
            resetForm();
          }
          setFieldValue("bank_country", country);
        };

        return (
          <>
            <SelectorField
              label={"Where is your bank located?"}
              name={"bank_country"}
              className="mt-2"
              placeholder={"Where is your bank located?"}
              onChange={(value: any) => handleCountryChange(value)}
              value={values.bank_country}
              options={countries}
              disabled={Boolean(disabled)}
            />
            <CommentsSection fieldId="bank_country" comments={comments} />

            {values.bank_country && (
              <>
                <Row>
                  <Col>
                    <TextField
                      label={"Bank name"}
                      placeholder={"Bank name"}
                      name={"bank_name"}
                      value={values.bank_name}
                      onChange={handleChange}
                      onBlur={onBlur}
                      onFocus={() => {}}
                    />
                    <CommentsSection fieldId="bank_name" comments={comments} />
                  </Col>
                  <Col>
                    {get(values, "bank_country.value") === US_BANK_ID && (
                      <>
                        <TextField
                          label={"Routing number"}
                          placeholder={"Routing number"}
                          name={"routing_number"}
                          value={values.routing_number}
                          onChange={handleChange}
                          onBlur={onBlur}
                          onFocus={() => {}}
                        />
                        <CommentsSection
                          fieldId="routing_number"
                          comments={comments}
                        />
                      </>
                    )}
                    {get(values, "bank_country.value") !== US_BANK_ID && (
                      <>
                        <TextField
                          label={isUKBank ? "Sort Code" : "Swift/ABA"}
                          placeholder={isUKBank ? "Sort Code" : "Swift/ABA"}
                          name={"swift_code"}
                          value={values.swift_code}
                          onChange={handleChange}
                          onBlur={onBlur}
                          onFocus={() => {}}
                        />
                        <CommentsSection
                          fieldId="swift_code"
                          comments={comments}
                        />
                      </>
                    )}
                  </Col>
                </Row>
                {get(values, "bank_country.value") !== US_BANK_ID && (
                  <>
                    <Row className="mt-2">
                      <Col>
                        <Checkbox
                          type="checkbox"
                          label="I need to add an Intermediary Bank"
                          onChange={(value: any) =>
                            setFieldValue(
                              "have_intermediary_bank",
                              !values.have_intermediary_bank
                            )
                          }
                          value={`${values.have_intermediary_bank}`}
                          checked={values.have_intermediary_bank}
                          onClick={(e: any) => e.stopPropagation()}
                          id={`approval-${values.have_intermediary_bank}`}
                        />
                        <CommentsSection
                          fieldId="have_intermediary_bank"
                          comments={comments}
                        />
                      </Col>
                    </Row>

                    {values.have_intermediary_bank && (
                      <Card>
                        <Card.Body>
                          <Row>
                            <Col>
                              <TextField
                                name={"intermediary_bank_name"}
                                label={"Bank name"}
                                placeholder={"Bank name"}
                                value={values.intermediary_bank_name}
                                onChange={handleChange}
                                onBlur={onBlur}
                                onFocus={() => {}}
                              />
                              <CommentsSection
                                fieldId="intermediary_bank_name"
                                comments={comments}
                              />
                            </Col>
                            <Col>
                              <TextField
                                name={"intermediary_bank_swift_code"}
                                label={isUKBank ? "Sort Code" : "Swift/ABA"}
                                placeholder={isUKBank ? "Sort Code" : "Swift/ABA"}
                                value={values.intermediary_bank_swift_code}
                                onChange={handleChange}
                                onBlur={onBlur}
                                onFocus={() => {}}
                              />
                              <CommentsSection
                                fieldId="intermediary_bank_swift_code"
                                comments={comments}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}
                  </>
                )}

                <TextField
                  name={"street_address"}
                  label={"Street address of the bank"}
                  placeholder={"Street address of the bank"}
                  value={values.street_address}
                  onChange={handleChange}
                  onBlur={onBlur}
                  onFocus={() => {}}
                />
                <CommentsSection fieldId="street_address" comments={comments} />
                <Row>
                  <Col>
                    <TextField
                      name={"city"}
                      label={"City"}
                      placeholder={"City"}
                      value={values.city}
                      onChange={handleChange}
                      onBlur={onBlur}
                      onFocus={() => {}}
                    />
                    <CommentsSection fieldId="city" comments={comments} />
                  </Col>
                  {((get(values, "bank_country.value") === US_BANK_ID )|| !isUKBank) &&
                  <Col>
                    {get(values, "bank_country.value") === US_BANK_ID ? (
                      <>
                        <TextField
                          name={"state"}
                          label={"State"}
                          placeholder={"State"}
                          value={values.state}
                          onChange={handleChange}
                          onBlur={onBlur}
                          onFocus={() => {}}
                        />
                        <CommentsSection fieldId="state" comments={comments} />
                      </>
                    ) : (
                      !isUKBank &&
                      <>
                        <TextField
                          name={"province"}
                          label={"Province"}
                          placeholder={"Province"}
                          value={values.province}
                          onChange={handleChange}
                          onBlur={onBlur}
                          onFocus={() => {}}
                        />
                        <CommentsSection
                          fieldId="province"
                          comments={comments}
                        />
                      </>
                    )}
                  </Col>
      }
                  <Col>
                    <TextField
                      name={"postal_code"}
                      label={"Postal code"}
                      placeholder={"Postal code"}
                      value={values.postal_code}
                      onChange={handleChange}
                      onBlur={onBlur}
                      onFocus={() => {}}
                    />
                    <CommentsSection
                      fieldId="postal_code"
                      comments={comments}
                    />
                  </Col>
                </Row>
                <TextField
                  name={"account_name"}
                  label={"Account name"}
                  placeholder={"Account name"}
                  value={values.account_name}
                  onChange={handleChange}
                  onBlur={onBlur}
                  onFocus={() => {}}
                />
                <CommentsSection fieldId="account_name" comments={comments} />
                <TextField
                  name={"account_number"}
                  label={"Account number"}
                  placeholder={"Account number"}
                  value={values.account_number}
                  onChange={handleChange}
                  onBlur={onBlur}
                  onFocus={() => {}}
                />
                <CommentsSection fieldId="account_number" comments={comments} />

                {get(values, "bank_country.value") !== US_BANK_ID && !isUKBank && (
                  <>
                    <TextField
                      name={"iban_number"}
                      label={"IBAN number"}
                      placeholder={"IBAN number"}
                      value={values.iban_number}
                      onChange={handleChange}
                      onBlur={onBlur}
                      onFocus={() => {}}
                    />
                    <CommentsSection
                      fieldId="iban_number"
                      comments={comments}
                    />
                  </>
                )}
                <TextField
                  name={"credit_account_name"}
                  label={"For further credit account name (optional)"}
                  placeholder={"For further credit account name (optional)"}
                  value={values.credit_account_name}
                  onChange={handleChange}
                  onBlur={onBlur}
                  onFocus={() => {}}
                />
                <CommentsSection
                  fieldId="credit_account_name"
                  comments={comments}
                />
                <TextField
                  name={"credit_account_number"}
                  label={"For further credit account number (optional)"}
                  placeholder={"For further credit account number (optional)"}
                  value={values.credit_account_number}
                  onChange={handleChange}
                  onBlur={onBlur}
                  onFocus={() => {}}
                />
                <CommentsSection
                  fieldId="credit_account_number"
                  comments={comments}
                />

                {!isLoadingCurrencies && (
                  <>
                    <SelectorField
                      label={"Currency"}
                      name={"currency"}
                      placeholder={"Currency"}
                      className="mt-2"
                      onChange={(value: any) =>
                        setFieldValue("currency", value)
                      }
                      value={values.currency}
                      onBlur={onBlur}
                      options={currencies}
                      disabled={Boolean(disabled)}
                    />
                    <CommentsSection fieldId="currency" comments={comments} />
                  </>
                )}

                <TextField
                  name={"reference"}
                  label={"Reference (optional)"}
                  placeholder={"Reference (optional)"}
                  value={values.reference}
                  onChange={handleChange}
                  onBlur={onBlur}
                  onFocus={() => {}}
                />
                <CommentsSection fieldId="reference" comments={comments} />
              </>
            )}
            {!submitOnBlur && (
              <Row className="mt-4">
                <Col>
                  <NextButton
                    onClick={(e: any) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    isDisabled={isSubmitting && !isValid}
                  >
                    Submit <ArrowForward />
                  </NextButton>
                </Col>
              </Row>
            )}
          </>
        );
      }}
    </Formik>
  );
};

export default BankDetailsForm;
