import {FunctionComponent, useEffect, useMemo, useRef} from 'react';
import {Form, Formik} from 'formik';
import toLower from "lodash/toLower";
import isEqual from "lodash/isEqual";
import get from "lodash/get";
import find from "lodash/find";
import {Button} from "react-bootstrap";
import {ISelectOption} from "../../../../interfaces/form";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {DEPARTMENTS, getValidationSchema, INVESTOR_TYPE_OPTIONS, JOB_BANDS, VALIDATION_SCHEMA} from "./constants";
import {initApplicantInfo} from "../../eligibilityCriteriaSlice";
import SelectorField from "../../../IndicateInterest/components/DetailsForm/SelectorField";
import TextInput from "../../../IndicateInterest/components/DetailsForm/TextInput";
import {selectApplicantInfo, selectCountries, selectServerError} from "../../selectors";
import {getFundCriteriaResponse} from "../../thunks";
import {updateApplicantInfo} from "../../eligibilityCriteriaSlice";
import {useGetDefaultOnBoardingDetailsQuery, useGetFundDetailsQuery} from "../../../../api/rtkQuery/fundsApi";
import {MODIFY_ELIGBILITY} from "../../../../constants/urlHashes";
import {useLocation} from "react-router-dom";
import {NextButton, StyledLink} from '../../../KnowYourCustomer/styles';
import {ArrowBack, ArrowForward} from '@material-ui/icons';
import {logMixPanelEvent} from '../../../../utils/mixpanel';
import {useCompanyPrefix} from '../../../../utils/hooks';
import {getHomepageUrl} from '../../../../utils/routes';
import { useSelector } from 'react-redux';
import { useGetOnboardingCustomTextQuery } from '../../../../api/rtkQuery/pageConfigsApi';


interface ApplicantInfoFormProps {
  externalId: string
}


const ApplicantInfoForm: FunctionComponent<ApplicantInfoFormProps> = ({externalId}) => {
  const dispatch = useAppDispatch()
  const location = useLocation();
  const countries = useAppSelector(selectCountries)
  const {companyPrefix} = useCompanyPrefix();
  const buttonRef = useRef<any>();
  const applicantInfo = useAppSelector(selectApplicantInfo);
  const serverError = useSelector(selectServerError);
  const {data: defaultOnboardingDetails, refetch} = useGetDefaultOnBoardingDetailsQuery(externalId);
  const {data: onboardingCustomText} = useGetOnboardingCustomTextQuery(undefined);
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const isModify = location.hash === MODIFY_ELIGBILITY;
  const isAllocationApproved = get(defaultOnboardingDetails, 'is_allocation_approved');
  const employeeCoInvest = get(fundDetails, 'employee_co_invest')

  useEffect(() => {
    refetch()
  }, [])

  useEffect(() => {
    if(buttonRef.current){
      buttonRef.current.disabled = false;
    }
  }, [serverError])

  const onSubmit = async (values: any) => {
    if(buttonRef.current){
      buttonRef.current.disabled = true;
    }
    const countryCode = values.whereWereYouWhenYouDecidedToInvest?.value
    const vehicleType = values.entityType.value
    let payload: any = {
      first_name: values.firstName,
      last_name: values.lastName,
    }
    if (employeeCoInvest) {
      payload = {
        ...payload,
        job_title: values.jobTitle,
        department: values.department,
        job_band: values.jobBand
      }

    }
    dispatch(updateApplicantInfo(values))
    dispatch(
      getFundCriteriaResponse(
        {
          externalId,
          countryCode: countryCode,
          vehicleType: vehicleType,
          applicantInfo: payload
        }
      )
    )
    logMixPanelEvent('Onboarding country selector step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
  }

  const getInitialValues = () => {
    const defaults = get(defaultOnboardingDetails, 'defaults_from_fund_file');
    const applicationData = get(defaultOnboardingDetails, 'application_data')
    const getOption = (options: ISelectOption[], value: string) => find(options, (option) => toLower(option.label) === toLower(value) || toLower(option.value) === toLower(value) || toLower(get(option, 'id')) === toLower(value));
    if (isEqual(applicantInfo, initApplicantInfo)) {
      if (isAllocationApproved || (isModify && applicationData)) {
        const data = {...applicantInfo, ...applicationData};
        return {
          ...applicantInfo,
          entityType: getOption(INVESTOR_TYPE_OPTIONS, data.entity_type),
          whereWereYouWhenYouDecidedToInvest: getOption(
            get(countries, `0.options`),
            data.office_location
          ),
          firstName: data.first_name,
          lastName: data.last_name,
          jobTitle: data.job_title,
          department: getOption(DEPARTMENTS, data.department),
          jobBand: getOption(JOB_BANDS, data.job_band),
        }
      }

      if (defaults) {
        const data = {...applicantInfo, ...defaults};
        return {
          ...applicantInfo,
          entityType: null,
          whereWereYouWhenYouDecidedToInvest: getOption(
            get(countries, `0.options`),
            data.office_location
          ),
          firstName: data.first_name,
          lastName: data.last_name,
          jobTitle: data.job_title,
          department: getOption(DEPARTMENTS, data.department),
          jobBand: getOption(JOB_BANDS, data.job_band),
        }
      }
    }
    return applicantInfo;
  };

  const checkFieldDisabled = (field: string) => {
    const defaults = get(defaultOnboardingDetails, 'defaults_from_fund_file');
    const fieldValue = get(defaults, field, undefined)
    if (fieldValue) return true;
    return false
  }

  return <div>
    <StyledLink to="#" onClick={() => window.open(getHomepageUrl(companyPrefix), "_self")}>
      <ArrowBack/> Back to Dashboard
    </StyledLink>
    <Formik
      initialValues={getInitialValues()}
      validationSchema={getValidationSchema(employeeCoInvest)}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          isValid
        }) => (
        <Form onSubmit={handleSubmit} className='mt-5'>
          <SelectorField
            label={'How will you be investing?'}
            name={'entityType'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('entityType', value)}
            value={values.entityType}
            options={INVESTOR_TYPE_OPTIONS}
          />

          <SelectorField
            label={onboardingCustomText?.custom_domicile_text ?? 'Where were you when you decided to invest?'}
            name={'whereWereYouWhenYouDecidedToInvest'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('whereWereYouWhenYouDecidedToInvest', value)}
            value={values.whereWereYouWhenYouDecidedToInvest}
            options={countries}
            disabled={isAllocationApproved}
          />

          <TextInput
            name={'firstName'}
            label={'First Name'}
            placeholder={'First Name'}
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            isInspectletSensitive={false}
          />

          <TextInput
            name={'lastName'}
            label={'Last Name'}
            placeholder={'Last Name'}
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            isInspectletSensitive={false}
          />
          {employeeCoInvest && <TextInput
            name={'jobTitle'}
            label={'Job Title'}
            placeholder={'Job Title'}
            value={values.jobTitle}
            onChange={handleChange}
            onBlur={handleBlur}
          />}
          {employeeCoInvest && <SelectorField
            label={'Department'}
            name={'department'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('department', value)}
            value={values.department}
            options={DEPARTMENTS}
            disabled={checkFieldDisabled('department')}
          />}

          {employeeCoInvest && <SelectorField
            label={'Job Band'}
            name={'jobBand'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('jobBand', value)}
            value={values.jobBand}
            options={JOB_BANDS}
            disabled={checkFieldDisabled('job_band')}
          />}

          <NextButton ref={buttonRef} className="mt-4" type="submit" disabled={!isValid}>
            Next Step <ArrowForward/>
          </NextButton>
        </Form>
      )}
    </Formik>
  </div>
};

export default ApplicantInfoForm;
