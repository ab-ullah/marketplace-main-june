import {FunctionComponent, useEffect} from 'react';
import {Form, Formik} from 'formik';
import toLower from "lodash/toLower";
import get from "lodash/get";
import find from "lodash/find";
import API from "../../api/marketplaceApi";
import {useAppDispatch, useAppSelector} from '../../app/hooks';

import {useGetDefaultOnBoardingDetailsQuery} from '../../api/rtkQuery/fundsApi';


import {selectKYCRecord} from '../KnowYourCustomer/selectors';
import AutoSave from '../KnowYourCustomer/components/AutoSave';
import {OverviewWrapper, SubTitle} from './styles';
import {CommentsContext} from '.';
import {filter, includes, map} from 'lodash';
import CommentWrapper from '../../components/CommentWrapper';
import {useParams} from 'react-router-dom';
import {fetchCommentsByApplicationId, fetchCommentsByKycRecordId, fetchKYCRecord} from '../KnowYourCustomer/thunks';
import CountrySelector from "./components/CountrySelector";
import {selectCountries} from "../OpportunityOnboarding/selectors";
import {fetchGeoSelector} from "../OpportunityOnboarding/thunks";
import {ISelectOption} from "../OpportunityOnboarding/interfaces";
import {
  DEPARTMENTS,
  INVESTOR_TYPE_OPTIONS,
  JOB_BANDS
} from "../OpportunityOnboarding/components/JobInfoSection/constants";
import {VALIDATION_SCHEMA} from "./components/CountryInvestorSelector/constants";
import SelectorField from "../../components/SelectorField";
import TextInput from 'pages/TaxForms/components/TextInput';

interface ApplicantInfoFormProps {
}


const Overview: FunctionComponent<ApplicantInfoFormProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch()
  const countries = useAppSelector(selectCountries)
  const {data: defaultOnboardingDetails} = useGetDefaultOnBoardingDetailsQuery(externalId);
  const isAllocationApproved = get(defaultOnboardingDetails, 'is_allocation_approved');
  const {
    answers,
    kycRecordId,
    workflow,
    recordUUID,
    applicationRecord
   } = useAppSelector(selectKYCRecord);

  useEffect(() => {
    if (externalId)
    dispatch(fetchGeoSelector(externalId))
  }, [dispatch])

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true)
    const countryId = values.whereWereYouWhenYouDecidedToInvest?.id
    const vehicleType = values.entityType.value
    const payload = {
      investor_location: countryId,
      kyc_investor_type_name: vehicleType,
      first_name: values.firstName,
      last_name: values.lastName,
      job_title: values.jobTitle,
      department: values.department?.value,
      job_band: values.jobBand?.value
    }
    await API.updateKYCRecord(workflow!.slug, kycRecordId!, payload);
    if (recordUUID) dispatch(fetchKYCRecord(recordUUID));
    if (applicationRecord) {
      dispatch(fetchCommentsByApplicationId(applicationRecord.id))
      dispatch(fetchCommentsByKycRecordId(applicationRecord.kyc_record.id));
    }
    setSubmitting(false)
  }

  const getInitialValues = () => {
    const getOption = (options: ISelectOption[], value: string) => find(options, (option) => toLower(option.label) === toLower(value) || toLower(option.value) === toLower(value) || toLower(get(option, 'id')) === toLower(value));
    return {
        entityType: getOption(INVESTOR_TYPE_OPTIONS, get(answers, 'kyc_investor_type_name', '')),
        whereWereYouWhenYouDecidedToInvest: getOption(get(countries, `0.options`, []), get(answers, 'investor_location', '')),
        firstName: get(answers, 'first_name', ''),
        lastName: get(answers, 'last_name', ''),
        jobTitle: get(answers, 'job_title', ''),
        department: getOption(DEPARTMENTS, get(answers, 'department', '')),
        jobBand: getOption(JOB_BANDS, get(answers, 'job_band', '')),
        restrictedGeographicArea: get(applicationRecord, 'restricted_geographic_area', ''),
        restrictedTimePeriod: get(applicationRecord, 'restricted_time_period', '')
      }
  };

  const getComments = (comments: { [key: string]: Comment[]; }, field: string) => {
    const data = filter(comments, (comment, key) => includes(key, field))
    return get(data, `0.`);
  }

  const checkFieldDisabled = (field: string) => {
    const defaults = get(defaultOnboardingDetails, 'defaults_from_fund_file');
    const fieldValue = get(defaults, field, undefined)
    if(fieldValue) return true;
    return false
  }

  return <OverviewWrapper>
    <SubTitle>Investor Information</SubTitle>
    <Formik
      initialValues={getInitialValues()}
      validationSchema={VALIDATION_SCHEMA}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid
        }) => (
        <Form onSubmit={handleSubmit}>
            <AutoSave />
          <SelectorField
            label={'How will you be investing?'}
            name={'entityType'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('entityType', value)}
            value={values.entityType}
            options={INVESTOR_TYPE_OPTIONS}
          />
          <CommentsContext.Consumer>
            {({comments}) => (
              <>
                {map(getComments(comments, 'kyc_investor_type_name'), (comment: any) => (
                  <CommentWrapper
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </>
            )}
            </CommentsContext.Consumer>
          <CountrySelector values={values} isAllocationApproved={isAllocationApproved}/>
          <CommentsContext.Consumer>
            {({comments}) => (
              <>
                {map(getComments(comments, 'investor_location'), (comment: any) => (
                  <CommentWrapper
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </>
            )}
            </CommentsContext.Consumer>

          <TextInput
            name={'firstName'}
            label={'First Name'}
            placeholder={'First Name'}
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <CommentsContext.Consumer>
            {({comments}) => (
              <>
                {map(getComments(comments, 'first_name'), (comment: any) => (
                  <CommentWrapper
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </>
            )}
            </CommentsContext.Consumer>

          <TextInput
            name={'lastName'}
            label={'Last Name'}
            placeholder={'Last Name'}
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <CommentsContext.Consumer>
            {({comments}) => (
              <>
                {map(getComments(comments, 'last_name'), (comment: any) => (
                  <CommentWrapper
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </>
            )}
            </CommentsContext.Consumer>
        </Form>
      )}
    </Formik>
  </OverviewWrapper>
};

export default Overview;
