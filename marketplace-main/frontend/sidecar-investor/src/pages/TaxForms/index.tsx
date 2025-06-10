import React, {FunctionComponent, useEffect, useState} from "react";
import map from "lodash/map";
import filter from "lodash/filter";
import includes from "lodash/includes";
import get from "lodash/get";
import first from "lodash/first";
import {useHistory} from "react-router";
import API from "../../api";
import {
  createTaxWorkflow,
  fetchAppRecord,
  fetchGeoSelector,
  fetchTaxDetails,
  fetchTaxDocuments,
  fetchTaxForms,
  updateTaxRecord
} from "./thunks";
import {
  BackButton,
  BigTitle,
  ButtonWrapper,
  Container,
  FakeLink,
  FormContainer,
  NextButton,
  StyledForm,
  TableCellBody,
  TableCellHeader,
  TableHead,
  TaxEndDiv,
  TaxForm,
  Title,
  ThemeCheckbox,
  ThemeRadio
} from "./styles";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {Link, useLocation, useParams} from "react-router-dom";
import {selectAppRecords, selectGeoSelector} from "./selectors";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import Select, {OptionTypeBase} from "react-select";
import {Params} from "./interfaces";


import Col from "react-bootstrap/Col";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import {makeStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import {deleteLink, updateLink, resetToDefault} from "./taxRecordsSlice";
import {
  useFetchModulePositionQuery,
  useGetFundDetailsQuery,
  useUpdateModulePositionMutation
} from "../../api/rtkQuery/fundsApi";
import {hasOnBoardingPermission} from '../../components/FundReview/onboardingPermission';
import Logo from "../../components/Logo";

import {
  ENITY_CERTIFICATION_DOCUMENT_ID,
  FORM_FIELDS_OPTIONS,
  INDIVIDUAL_CERTIFICATION_DOCUMENT_ID,
  Tax_FORM_STEPS,
  VALIDATION_SCHEMA
} from "./constants";
import NavableLoader from "../../components/NavableLoader";
import {TAX_RECORD} from "../../constants/commentModules";
import RadioGroup from "../IndicateInterest/components/DetailsForm/RadioGroup";
import {Container as BSContainer, Form} from "react-bootstrap";
import {ErrorMessage, Formik} from "formik";
import {selectKYCRecord} from "../KnowYourCustomer/selectors";
import {fetchKYCRecord} from "../KnowYourCustomer/thunks";
import TextInput from "../IndicateInterest/components/DetailsForm/TextInput";
import AutoSave from "./components/AutoSave";
import {KYC_ENTITY_INVESTORS} from "../KnowYourCustomer/constants";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {getDateFromString} from "../../utils/dateFormatting";
import size from "lodash/size";
import {lowerCase, some} from "lodash";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import { StyledLink } from "../KnowYourCustomer/styles";
import { INVESTOR_URL_PREFIX } from "../../constants/routes";
import {orderBy} from "lodash";
import { logMixPanelEvent } from "../../utils/mixpanel";
import { useCompanyPrefix } from "../../utils/hooks";



type CountryType = OptionTypeBase | null | undefined;

const TaxFormsPage: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const {
    taxForms,
    hasFetchedAppRecords,
    taxDocumentsList,
    appRecords,
    taxFormsLinks,
    taxDetails,
  } = useAppSelector(selectAppRecords);
  const {answers} = useAppSelector(selectKYCRecord);
  const {externalId} = useParams<Params>();
  const {companyPrefix} =useCompanyPrefix()
  const {state} = useLocation() as any;
  const [selectedCountry, setSelectedCountry] = useState<CountryType>(null);
  const [isUpdatingDocument, setIsUpdatingDocument] = useState(false);
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const [displayedFormNumber, setDisplayedFormNumber] = useState(Tax_FORM_STEPS.COUNTRY_SELECTION as number);
  const [selectedRadioButton, setSelectedRadioButton] = useState(null);
  const [disableRadioButtons, setDisableRadioButtons] = useState(false);
  const [disableLinks, setDisableLinks] = useState(false);
  const geoSelector = useAppSelector(selectGeoSelector);
  const [updateTaxPosition] = useUpdateModulePositionMutation();
  const {data: taxPosition} = useFetchModulePositionQuery(externalId, {
    skip: !externalId
  });

  const useStyles = makeStyles({
    table: {
      minWidth: 0,
      boxShadow: "0px 76px 74px rgba(0,0,0,0.75)",
    },
  });

  useEffect(() => {
    dispatch(fetchTaxForms(externalId));
    dispatch(fetchAppRecord(externalId));
    dispatch(fetchGeoSelector(externalId));
    dispatch(createTaxWorkflow(externalId));
    return () => {
      dispatch(resetToDefault())
    }
  }, []);


  useEffect(() => {
    if (hasFetchedAppRecords && appRecords.length > 0 && !appRecords[0].tax_record ){
      const createTaxRecord = async () => API.createTaxRecord(externalId);
      createTaxRecord().then((taxResult)=>{
        const updateAppRecord = async () => API.updateAppRecord(appRecords[0].uuid,  {tax_record: {uuid: taxResult.uuid}});
        updateAppRecord().then((result)=>{
          dispatch(fetchAppRecord(externalId));
          dispatch(fetchTaxDocuments(taxResult.uuid));
        });
      });
    }else{
      if (hasFetchedAppRecords) {
        dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
        saveForm();
      }
    }
  }, [dispatch, hasFetchedAppRecords, appRecords, externalId]);

  useEffect(() => {
    const urlParams = getUrlParams()
    const envelopeId = urlParams.get("envelope_id");
    if(envelopeId){
      setDisplayedFormNumber(Tax_FORM_STEPS.DOCUMENTS);
      markDisabled();
    }
  }, [])

  useEffect(() => {
    const [record] = appRecords;
    if(record && record?.kyc_record && record?.tax_record){
      dispatch(fetchKYCRecord(record.kyc_record.uuid));
      dispatch(fetchTaxDetails(record.tax_record.uuid));
    }
  }, [appRecords])

  const getUrlParams = () => {
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
  }

  const saveForm = () => {
    const urlParams = getUrlParams()
    const envelopeId = urlParams.get("envelope_id");
    const event = urlParams.get("event");

    if (envelopeId) {
      if (event === "signing_complete") {
        setIsUpdatingDocument(true);
        saveSignedForm(envelopeId).then(() => {
          dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
          setIsUpdatingDocument(false);
        });
      } else {
        dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
      }
    }
  };

  const refetchDocuments = async () => {
    if (get(appRecords, '[0].tax_record.uuid'))
    dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
  }

  const saveSignedForm = async (envelope_id: string) => {
    await API.saveSignedForm(externalId, envelope_id);
  };

  const signingUrl = async (envelope_id: string, fund: string) => {
    const {host, protocol} = window.location;
    const return_url = encodeURIComponent(
      `${protocol}//${host}${companyPrefix}/investor/funds/${fund}/tax?envelope_id=${envelope_id}`
    );
    const response = await API.getSigningUrl(envelope_id, return_url);
    window.open(response.signing_url, "_self");
    return response;
  };

  const markDisabled = () => {
    for (const [key, value] of Object.entries(taxFormsLinks)) {
      if (value.checked === true) {
        value.inputType === "radio" && setDisableRadioButtons(true);
        dispatch(
          updateLink({
            id: key,
            linkInfo: {
              disabled: true,
            },
          })
        );
      }
    }
  };

  const createEnvelopes = async () => {
    for (const [key, value] of Object.entries(taxFormsLinks)) {
      if (value.envelope_id === "" && value.disabled === false) {
        const payload = {
          form_id: key,
        };
        dispatch(
          updateLink({
            id: key,
            linkInfo: {
              isCreatingEnvelop: true
            }
          })
        );
        API.createEnvelope(taxDetails?.uuid,payload).then((response) => {
          dispatch(
            updateLink({
              id: key,
              linkInfo: {
                envelope_id: response.envelope_id,
                document_id: response.document_id,
                record_id: response.record_id,
                isCreatingEnvelop: false
              },
            })
          );
        });
      }
    }
    await refetchDocuments()
  };

  const checkedCheckbox = (e: any, helpUrl: string | null, type: string) => {
    const isChecked = e.target.checked;
    const checkedValue = e.target.value;
    if (isChecked === true) {
      const payload = {
        id: checkedValue,
        linkInfo: {
          documentName: checkedValue,
          checked: true,
          inputType: "checkbox",
          helpUrl: helpUrl,
          type
        },
      };
      dispatch(updateLink(payload));
    } else if (isChecked === false) {
      dispatch(deleteLink(checkedValue));
    }
  };

  const onDocumentDeletion = async (formId: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      if (taxFormsLinks[formId]) {
        const recordId = taxFormsLinks[formId].record_id;
        const documentId = taxFormsLinks[formId].document_id;
        taxFormsLinks[formId].inputType === "radio" &&
          setDisableRadioButtons(false);
        dispatch(deleteLink(formId));
        await API.deleteTaxDocument(recordId, documentId);
        await refetchDocuments()
      }
    }
  };

  useEffect(() => {
    updateTaxPosition({moduleId: TAX_RECORD, externalId, currentStep: displayedFormNumber});
  }, [displayedFormNumber]);

  useEffect(() => {
    if (taxDetails && taxDetails.countries)
      setSelectedCountry(taxDetails.countries);
  }, [taxDetails]);

  useEffect(() => {
    const positionDetails = first(taxPosition);
    const urlParams = getUrlParams()
    const envelopeId = urlParams.get("envelope_id");
    const position = get(positionDetails, 'last_position');
    const module =  get(positionDetails, 'module');
    if(position && module === TAX_RECORD && !envelopeId) {
      setDisplayedFormNumber(Number(position));
    }
  }, [taxPosition]);

  const onSubmitTaxDetails = async (values: any) => {
    await dispatch(updateTaxRecord({
      recordUUID: appRecords[0].tax_record.uuid,
      values: { countries: selectedCountry, ...values }
    }))
    dispatch(fetchTaxDetails(appRecords[0].tax_record.uuid))
    logMixPanelEvent('Tax details form submitted', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
  }

  const handleTaxCountry = (value: OptionTypeBase) => {
    const countryIds = map(value, 'id');
    setSelectedCountry(countryIds);
  }

  const getSelectedCountry = () => {
    return filter(geoSelector, (country: any) => includes(selectedCountry, country.id));
  }

  const classes = useStyles();

  const selectedCountryNames = getSelectedCountry().map(country => country.label)
  const taxExemptLabel = <div>Are you generally exempt from taxation in the
    countries: <i>{selectedCountryNames.join(', ')}</i></div>

  const hasPendingSigning = !size(taxDocumentsList) || some(taxDocumentsList, (
    (record: any) => lowerCase(record.completed) === "false"
  ))
  const isCreatingEnvelope = some(
    Object.keys(taxFormsLinks).map((form) => taxFormsLinks[form].isCreatingEnvelop)
  )
  const isGovernmentTaxFormSelected = some(
    Object.keys(taxFormsLinks).map((form) => taxFormsLinks[form].type === 'Goverment')
  )
  const isSelfCertificationFormSelected = some(
    Object.keys(taxFormsLinks).map((form) => taxFormsLinks[form].type !== 'Goverment')
  )

  const forms = [
    <>
      <Title>Country</Title>
      <div>
        In order to complete your investment application, we need to gather the
        relevant tax details.
        <br />
        <br />
        Please select the relevant country or countries of tax residency. Be
        sure to select the relevant country or countries depending on whether
        you are applying as an individual or entity.
      </div>

      <label htmlFor="country">Country</label>
      <br />
      <Select
        isMulti={true}
        options={geoSelector}
        value={getSelectedCountry()}
        onChange={handleTaxCountry}
        className="inspectlet-sensitive"
      />
      <ButtonWrapper>
      <NextButton
        onClick={async () => {
          await onSubmitTaxDetails({})
          setDisplayedFormNumber(Tax_FORM_STEPS.TAX_DETAILS);
          logMixPanelEvent('Tax country selector step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
        }}
        disabled={!size(selectedCountryNames)}
      >
        Next step <ArrowForward />
      </NextButton>
      </ButtonWrapper>
    </>,
    <>
      <BSContainer fluid className={"pb-5"}>
      <br />
      <br />
      Next, please provide following details
      <br />
      <br />
        <Formik
          initialValues={{
            us_holder: get(taxDetails, "us_holder", ""),
            is_tax_exempt: get(taxDetails, "is_tax_exempt", ""),
            is_entity: get(taxDetails, "is_entity", ""),
            is_tax_exempt_in_country: get(taxDetails, "is_tax_exempt_in_country", ""),
            tin_or_ssn: get(taxDetails, "tin_or_ssn", ""),
            kyc_investor_type_name: get(answers, "kyc_investor_type_name", ""),
            tax_year_end: get(taxDetails, "tax_year_end", ""),
          }}
          enableReinitialize
          validationSchema={VALIDATION_SCHEMA}
          validateOnMount
          onSubmit={onSubmitTaxDetails}
        >
          {({values, handleChange, handleBlur, setFieldValue, isValid, isSubmitting, errors}) => {
            const taxYearEnd = getDateFromString(values.tax_year_end)
            return (
              <TaxForm>
                <AutoSave />
                <RadioGroup
                  label="U.S. Holder"
                  name="us_holder"
                  onChange={(value: any) => setFieldValue("us_holder", value)}
                  options={FORM_FIELDS_OPTIONS}
                  value={values.us_holder}
                />
                {
                  values.us_holder === 'Yes' && <RadioGroup
                  label="Are you Tax-Exempt under section 501(a) of the code"
                  name="is_tax_exempt"
                  onChange={(value: any) => setFieldValue("is_tax_exempt", value)}
                  options={FORM_FIELDS_OPTIONS}
                  value={values.is_tax_exempt}
                />
                }
                {
                  answers?.kyc_investor_type_name && KYC_ENTITY_INVESTORS.includes(answers?.kyc_investor_type_name) && values.us_holder === 'Yes' && <RadioGroup
                  label="Are you a partnership, estate, trust, S corporation, nominee or similar pass-through entity that is owned, directly or indirectly through one or more other such pass-through entities, by a U.S. Holder"
                  name="is_entity"
                  onChange={(value: any) => setFieldValue("is_entity", value)}
                  options={FORM_FIELDS_OPTIONS}
                  value={values.is_entity}
                />
                }
                <RadioGroup
                  label={taxExemptLabel}
                  name="is_tax_exempt_in_country"
                  onChange={(value: any) => setFieldValue("is_tax_exempt_in_country", value)}
                  options={FORM_FIELDS_OPTIONS}
                  value={values.is_tax_exempt_in_country}
                />
                <TextInput
                  name={"tin_or_ssn"}
                  label={"Taxpayer Identification Number or Social Security Number"}
                  placeholder={"Taxpayer Identification Number or Social Security Number"}
                  value={values.tin_or_ssn}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Form.Label>Taxable year end of applicant</Form.Label>
                <TaxEndDiv>
                  <DatePicker
                    selected={taxYearEnd}
                    onChange={(v: any) => {
                      setFieldValue('tax_year_end', moment.parseZone(v).format('YYYY-MM-DD'))
                    }}
                    className="inspectlet-sensitive"
                    dateFormat={'MM/dd'}
                    name={'tax_year_end'}
                    dateFormatCalendar={'LLLL'}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                  />
                </TaxEndDiv>
                <ErrorMessage name="tax_year_end_day" component="div" className={'errorText'}/>
                <ButtonWrapper style={{display:'flex', justifyContent:'space-between'}}>
                <BackButton onClick={() => setDisplayedFormNumber(Tax_FORM_STEPS.COUNTRY_SELECTION)}>
                  <ArrowBackIcon /> Previous step
                </BackButton>
                <NextButton
                  disabled={!isValid || isSubmitting}
                  onClick={() => {
                    setDisplayedFormNumber(Tax_FORM_STEPS.INVESTOR_FORMS)
                  }}
                >
                  Next Step <ArrowForward />
                </NextButton>
                </ButtonWrapper>
              </TaxForm>
            );
          }}
        </Formik>
      </BSContainer>
    </>,
    <>
      <br />
      <br />
      Next, please select the appropriate investor tax forms
      <br />
      <br />
      <Col md={12} className={"mb-3"}>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCellHeader align="center">Selection</TableCellHeader>
                <TableCellHeader align="center" width="130">
                  Form
                </TableCellHeader>
                <TableCellHeader align="center">Description</TableCellHeader>
                <TableCellHeader align="center">More Details</TableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxForms.map((form: any) => {
                const checked = taxFormsLinks[form.form_id]?.checked || false;
                const disabled = taxFormsLinks[form.form_id]?.disabled || false;

                if (form.type === "Goverment") {
                  return (
                    <TableRow key={form.form_id}>
                      <TableCellBody align="center">
                        <ThemeCheckbox
                          type="checkbox"
                          onChange={(e) => checkedCheckbox(e, form.help_link, form.type)}
                          value={form.form_id}
                          checked={checked}
                          disabled={disabled}
                        />
                      </TableCellBody>
                      <TableCellBody align="center">
                        {form.form_id}
                      </TableCellBody>
                      <TableCellBody align="center">
                        {form.description}
                      </TableCellBody>
                      <TableCellBody align="justify">
                        <div
                          dangerouslySetInnerHTML={{ __html: form.details }}
                        />
                      </TableCellBody>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Col>
      <ButtonWrapper>
      <BackButton onClick={() => setDisplayedFormNumber(Tax_FORM_STEPS.TAX_DETAILS)}>
        <ArrowBackIcon /> Previous step
      </BackButton>
      <NextButton
        disabled={!isGovernmentTaxFormSelected}
        onClick={async () => {
          setDisplayedFormNumber(Tax_FORM_STEPS.CERTIFICATION_FORMS);
          markDisabled();
          await createEnvelopes();
          logMixPanelEvent('Tax forms selection step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
        }}
      >
        Next step <ArrowForward />
      </NextButton>
      </ButtonWrapper>
    </>,
    <>
      <Title>Self-Certification</Title>
      Next, please select the appropriate Self-Certification
      <br />
      <br />
      <Col md={12} className={"mb-3"}>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCellHeader align="center">Selection</TableCellHeader>
                <TableCellHeader align="center">Description</TableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderBy(taxForms, ['form_id'], ['desc']).map((form: any) => {
                if (form.type === "Self Certification") {
                  const formName = form.form_id;
                  const checked = taxFormsLinks[formName]?.checked || false;

                  return (
                    <TableRow key={formName}>
                      <TableCellBody align="center">
                        <ThemeRadio
                          type="radio"
                          onClick={() => {
                            setSelectedRadioButton(formName);
                            const payload = {
                              id: formName,
                              linkInfo: {
                                documentName: formName,
                                checked: true,
                                inputType: "radio",
                                type: form.type
                              },
                            };
                            if (formName === ENITY_CERTIFICATION_DOCUMENT_ID) {
                              dispatch(
                                deleteLink(INDIVIDUAL_CERTIFICATION_DOCUMENT_ID)
                              );
                            } else {
                              dispatch(
                                deleteLink(ENITY_CERTIFICATION_DOCUMENT_ID)
                              );
                            }
                            dispatch(updateLink(payload));
                          }}
                          value={formName}
                          checked={checked}
                          name="self-certificate"
                          disabled={disableRadioButtons}
                        />
                      </TableCellBody>
                      <TableCellBody align="center">
                        {form.description}
                      </TableCellBody>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Col>
      <ButtonWrapper>
      <BackButton onClick={() => setDisplayedFormNumber(Tax_FORM_STEPS.INVESTOR_FORMS)}>
        <ArrowBackIcon /> Previous step
      </BackButton>
      <NextButton
        disabled={!isSelfCertificationFormSelected}
        onClick={async () => {
          setDisplayedFormNumber(Tax_FORM_STEPS.DOCUMENTS);
          markDisabled();
          await createEnvelopes();
          logMixPanelEvent('Tax self certification forms step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
        }}
      >
        Next step <ArrowForward />
      </NextButton>
      </ButtonWrapper>
    </>,
    <>
      <Title>Documents</Title>
      <div>Click on each link to start filling out the forms.</div>
      <br />

      <Col md={12} className={"mb-3"}>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCellHeader align="center">Document</TableCellHeader>
                <TableCellHeader align="center">Tax Instructions</TableCellHeader>
                <TableCellHeader align="center">Status</TableCellHeader>
                <TableCellHeader align="center">Actions</TableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(taxFormsLinks).length === 0 ||
                (isUpdatingDocument && (
                  <TableRow key={1}>
                    <TableCellBody colSpan={3} align="center">
                      <NavableLoader />
                    </TableCellBody>
                  </TableRow>
                ))}
              {!isUpdatingDocument &&
                Object.keys(taxFormsLinks).map((form) => {
                  const helpUrl = taxFormsLinks[form].helpUrl;
                  return (
                    <TableRow key={form}>
                      <TableCellBody align="center">
                        {taxFormsLinks[form].status === "Completed" ? (
                          <span>{form}</span>
                        ) : (
                          <FakeLink
                            onClick={() => {
                              if (disableLinks === false && taxFormsLinks[form].isCreatingEnvelop === false) {
                                setDisableLinks(true);
                                signingUrl(
                                  taxFormsLinks[form].envelope_id,
                                  externalId
                                );
                              }
                            }}
                            disableLink={disableLinks || taxFormsLinks[form].isCreatingEnvelop}
                          >
                            {taxFormsLinks[form].documentName}
                          </FakeLink>
                        )}
                      </TableCellBody>
                      <TableCellBody align="center">
                        {helpUrl && <a href={helpUrl} target={'_blank'}>IRS Instructions</a>}
                      </TableCellBody>

                      <TableCellBody align="center">
                        {taxFormsLinks[form].status}
                      </TableCellBody>
                      <TableCellBody align="center">
                        <DeleteOutlineIcon
                          htmlColor="#F42222"
                          style={{ cursor: "pointer" }}
                          onClick={() => onDocumentDeletion(form)}
                        />
                      </TableCellBody>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Col>
      <br />

      <p>{Object.keys(taxFormsLinks).length > 0 &&
        !Object.values(taxFormsLinks).some(
          (form: any) => form.status === "Pending"
        ) &&
        !taxDocumentsList.some((record: any) => record.completed === "False") &&
        "You have successfully completed all the selected forms."}</p>

      <Link to={`${companyPrefix}/investor/funds/${externalId}/application`}>
        Go to My Application
      </Link>

     <ButtonWrapper>
     <BackButton onClick={() => setDisplayedFormNumber(Tax_FORM_STEPS.INVESTOR_FORMS)}>
        <ArrowBackIcon /> Change Forms
      </BackButton>

      <NextButton
        disabled={hasPendingSigning || isCreatingEnvelope}
        onClick={() => {
          API.createTaxReviewTask(externalId, appRecords[0].tax_record.uuid)
          history.push(`${companyPrefix}/investor/funds/${externalId}/bank_details`)
        }}
      >
        Add banking details <ArrowForward />
      </NextButton>
     </ButtonWrapper>
    </>,
  ];

  return (
    <Container>
      <BigTitle>
      <Logo size="md" suffixText={fundDetails?.name} />
      Tax Forms
      </BigTitle>

      <StyledForm onSubmit={() => alert()}>
        <FormContainer>
          <StyledLink to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`}><ArrowBack /> Back to Application Overview</StyledLink>
          {forms[displayedFormNumber]}
          </FormContainer>
      </StyledForm>
    </Container>
  );
};

export default hasOnBoardingPermission(TaxFormsPage);
