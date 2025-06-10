import React, {FC, useEffect} from "react";
import {ErrorMessage, Formik} from "formik";
import {useParams} from "react-router-dom";
import get from "lodash/get";
import map from "lodash/map";
import filter from "lodash/filter";
import includes from "lodash/includes";
import {Form} from "react-bootstrap";
import {Params} from "../../TaxForms/interfaces";
import RadioGroup from "../../IndicateInterest/components/DetailsForm/RadioGroup";
import TextInput from "../../IndicateInterest/components/DetailsForm/TextInput";
import {KYC_ENTITY_INVESTORS} from "../../KnowYourCustomer/constants";
import {fetchGeoSelector,} from "../../TaxForms/thunks";
import AutoSave from "../../TaxForms/components/AutoSave";
import {FORM_FIELDS_OPTIONS, VALIDATION_SCHEMA,} from "../../TaxForms/constants";
import {selectGeoSelector} from "../../TaxForms/selectors";
import Select, {OptionTypeBase} from "react-select";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {selectKYCRecord} from "../../KnowYourCustomer/selectors";
import {TAX_RECORD} from "../../../constants/commentModules";
import CommentsSection from "../../BankDetailsForm/Comments";
import {TaxEndDiv} from "../../TaxForms/styles";
import DatePicker from "react-datepicker";
import {getDateFromString} from "../../../utils/dateFormatting";
import moment from "moment";

interface ITaxDetails {
  taxDetails: {
    id: number;
    us_holder: string;
    is_tax_exempt: string;
    is_entity: string;
    is_tax_exempt_in_country: string;
    tin_or_ssn: string;
    tax_year_end: string;
  };
  kyc_investor_type_name: string;
  isApplicationLocked?: boolean;
  onSubmit: (values: any) => void;
}

const TaxDetailsForm: FC<ITaxDetails> = ({
  taxDetails,
  kyc_investor_type_name,
  isApplicationLocked,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const { externalId } = useParams<Params>();
  const { commentsByRecord } = useAppSelector(selectKYCRecord);
  const geoSelector = useAppSelector(selectGeoSelector);

  const getSelectedCountry = (countriesId: any) => {
    return filter(geoSelector, (country: any) => includes(countriesId, country.id));
  }

  useEffect(() => {
    dispatch(fetchGeoSelector(externalId));
  }, [])

  let commentsOfThisRecord = {};
  if (taxDetails && commentsByRecord)
    commentsOfThisRecord = get(
      commentsByRecord,
      `${TAX_RECORD}.${taxDetails.id}`
    );

  return (
    <Formik
      initialValues={{
        countries: get(taxDetails, "countries", null),
        us_holder: get(taxDetails, "us_holder", ""),
        is_tax_exempt: get(taxDetails, "is_tax_exempt", ""),
        is_entity: get(taxDetails, "is_entity", ""),
        is_tax_exempt_in_country: get(
          taxDetails,
          "is_tax_exempt_in_country",
          ""
        ),
        tin_or_ssn: get(taxDetails, "tin_or_ssn", ""),
        tax_year_end: get(taxDetails, "tax_year_end", ""),
        kyc_investor_type_name: kyc_investor_type_name,
      }}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur, setFieldValue, isValid }) => {
        const taxYearEnd = getDateFromString(values.tax_year_end)
        return (
          <>
            {isValid && <AutoSave />}
            <div className="mb-2">
              <label htmlFor="country">Country</label>
              <br />
              <Select
                isMulti={true}
                options={geoSelector}
                value={getSelectedCountry(values.countries)}
                onChange={(values: OptionTypeBase) => {
                  setFieldValue('countries', map(values, 'id'));
                }}
                isDisabled={!isApplicationLocked}
              />
              <CommentsSection
                fieldId="countries"
                comments={commentsOfThisRecord}
              />
            </div>
            <RadioGroup
              label="U.S. Holder"
              name="us_holder"
              onChange={(value: any) => setFieldValue("us_holder", value)}
              options={FORM_FIELDS_OPTIONS}
              value={values.us_holder}
            />
            <CommentsSection
              fieldId="us_holder"
              comments={commentsOfThisRecord}
            />
            {values.us_holder === "Yes" && (
              <>
                <RadioGroup
                  label="Are you Tax-Exempt under section 501(a) of the code"
                  name="is_tax_exempt"
                  onChange={(value: any) =>
                    setFieldValue("is_tax_exempt", value)
                  }
                  options={FORM_FIELDS_OPTIONS}
                  value={values.is_tax_exempt}
                />
                <CommentsSection
                  fieldId="is_tax_exempt"
                  comments={commentsOfThisRecord}
                />
              </>
            )}
            {kyc_investor_type_name &&
              KYC_ENTITY_INVESTORS.includes(kyc_investor_type_name) &&
              values.us_holder === "Yes" && (
                <>
                  <RadioGroup
                    label="Are you a partnership, estate, trust, S corporation, nominee or similar pass-through entity that is owned, directly or indirectly through one or more other such pass-through entities, by a U.S. Holder"
                    name="is_entity"
                    onChange={(value: any) => setFieldValue("is_entity", value)}
                    options={FORM_FIELDS_OPTIONS}
                    value={values.is_entity}
                  />
                  <CommentsSection
                    fieldId="is_entity"
                    comments={commentsOfThisRecord}
                  />
                </>
              )}
            <RadioGroup
              label="Are you generally exempt from taxation in the countries above"
              name="is_tax_exempt_in_country"
              onChange={(value: any) =>
                setFieldValue("is_tax_exempt_in_country", value)
              }
              options={FORM_FIELDS_OPTIONS}
              value={values.is_tax_exempt_in_country}
            />
            <CommentsSection
              fieldId="is_tax_exempt_in_country"
              comments={commentsOfThisRecord}
            />
            <TextInput
              name={"tin_or_ssn"}
              label={"Taxpayer Identification Number or Social Security Number"}
              placeholder={
                "Taxpayer Identification Number or Social Security Number"
              }
              value={values.tin_or_ssn}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <CommentsSection
              fieldId="tin_or_ssn"
              comments={commentsOfThisRecord}
            />
            <Form.Label>Taxable year end of applicant</Form.Label>
            <TaxEndDiv>
              <DatePicker
                selected={taxYearEnd}
                onChange={(v: any) => {
                  setFieldValue('tax_year_end', moment.parseZone(v).format('YYYY-MM-DD'))
                }}
                dateFormat={'MM/dd'}
                name={'tax_year_end'}
                dateFormatCalendar={'LLLL'}
                disabled={isApplicationLocked}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
              />
            </TaxEndDiv>
            <ErrorMessage name="tax_year_end" component="div" className={'errorText'}/>
            <CommentsSection
              fieldId="tax_year_end"
              comments={commentsOfThisRecord}
            />
          </>
        );
      }}
    </Formik>
  );
};

TaxDetailsForm.defaultProps = {
  isApplicationLocked: false
}

export default TaxDetailsForm;
