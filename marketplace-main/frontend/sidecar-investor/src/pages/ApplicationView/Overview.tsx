import {FunctionComponent, useEffect} from 'react';
import {Form, Formik} from 'formik';
import toLower from "lodash/toLower";
import get from "lodash/get";
import find from "lodash/find";
import API from "../../api";
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {selectCountries} from '../EligibilityCriteria/selectors';
import {
  useGetApplicationStatusQuery,
  useGetDefaultOnBoardingDetailsQuery,
  useGetFundDetailsQuery
} from '../../api/rtkQuery/fundsApi';
import {fetchGeoSelector} from '../EligibilityCriteria/thunks';
import {ISelectOption} from '../../interfaces/form';
import {
  DEPARTMENTS, getValidationSchema,
  INVESTOR_TYPE_OPTIONS,
  JOB_BANDS,
  VALIDATION_SCHEMA
} from '../EligibilityCriteria/components/CountryInvestorSelector/constants';
import SelectorField from '../../components/Form/SelectorField';
import TextInput from '../IndicateInterest/components/DetailsForm/TextInput';
import {selectKYCRecord} from '../KnowYourCustomer/selectors';
import AutoSave from '../KnowYourCustomer/components/AutoSave';
import {OverviewWrapper, SubTitle} from './styles';
import {CommentsContext} from '.';
import {filter, includes, map} from 'lodash';
import CommentWrapper from '../../components/CommentWrapper';
import {useParams} from 'react-router-dom';
import {fetchApplicationKYCRecord, fetchCommentsByApplicationId, fetchCommentsByKycRecordId, fetchKYCRecord} from '../KnowYourCustomer/thunks';
import CountrySelector from "./Components/CountrySelector";
import {IApplicationStatus} from "../../interfaces/application";
import { isApplicationPage } from '../../utils/routes';

interface ApplicantInfoFormProps {
}


const Overview: FunctionComponent<ApplicantInfoFormProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch()
  const countries = useAppSelector(selectCountries)
  const {data: defaultOnboardingDetails} = useGetDefaultOnBoardingDetailsQuery(externalId);
  const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
  const isAllocationApproved = get(defaultOnboardingDetails, 'is_allocation_approved');
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const isLocked = applicationStatus?.is_locked || (applicationStatus?.application_view_editing_disabled && isApplicationPage())
  const employeeCoInvest = get(fundDetails, 'employee_co_invest')

  const {
    answers,
    kycRecordId,
    workflow,
    recordUUID,
    applicationRecord
   } = useAppSelector(selectKYCRecord);

  useEffect(() => {
    dispatch(fetchGeoSelector(externalId))
  }, [dispatch])

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true)
    const vehicleType = values.entityType.value
    let payload: any = {
      kyc_investor_type_name: vehicleType,
      first_name: values.firstName,
      last_name: values.lastName,

      fund_external_id: externalId
    }
    if (employeeCoInvest) {
      payload = {
        ...payload,
        job_title: values.jobTitle,
        department: values.department?.value,
        job_band: values.jobBand?.value,
      }
    }
    await API.updateKYCRecord(workflow!.slug, kycRecordId!, payload);
    if (recordUUID) dispatch(fetchApplicationKYCRecord({
      recordUUID,
      applicationId: applicationRecord?.id
    }))
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
        whereWereYouWhenYouDecidedToInvest: getOption(get(countries, `0.options`), get(applicationRecord, 'investment_country.id', '')),
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
          isSubmitting,
          isValid
        }) => (
        <Form onSubmit={handleSubmit}>
        <fieldset disabled={isLocked}>
            <AutoSave />
          <SelectorField
            label={'How will you be investing?'}
            name={'entityType'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('entityType', value)}
            value={values.entityType}
            disabled={isLocked}
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
          <CountrySelector values={values} isAllocationApproved={isAllocationApproved} disabled={isLocked}/>
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
            isInspectletSensitive={false}
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
            isInspectletSensitive={false}
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
          {employeeCoInvest && <TextInput
            name={'jobTitle'}
            label={'Job Title'}
            placeholder={'Job Title'}
            value={values.jobTitle}
            onChange={handleChange}
            onBlur={handleBlur}
          />}
          <CommentsContext.Consumer>
            {({comments}) => (
              <>
                {map(getComments(comments, 'job_title'), (comment: any) => (
                  <CommentWrapper
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </>
            )}
            </CommentsContext.Consumer>
          {employeeCoInvest && <SelectorField
            label={'Department'}
            name={'department'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('department', value)}
            value={values.department}
            options={DEPARTMENTS}
            disabled={checkFieldDisabled('department') || isLocked}
          />}
          <CommentsContext.Consumer>
            {({comments}) => (
              <>
                {map(getComments(comments, 'department'), (comment: any) => (
                  <CommentWrapper
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </>
            )}
            </CommentsContext.Consumer>

          {employeeCoInvest && <SelectorField
            label={'Job Band'}
            name={'jobBand'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('jobBand', value)}
            value={values.jobBand}
            options={JOB_BANDS}
            disabled={checkFieldDisabled('job_band') || isLocked}
          />}
          <CommentsContext.Consumer>
            {({comments}) => (
              <>
                {map(getComments(comments, 'job_band'), (comment: any) => (
                  <CommentWrapper
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </>
            )}
            </CommentsContext.Consumer>
          {employeeCoInvest && <TextInput
            name={'restricted_geographic_area'}
            label={'Restricted Geographic Area'}
            placeholder={'Restricted Gepgraphic Area'}
            value={values.restrictedGeographicArea}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled
          />}
          {employeeCoInvest && <TextInput
            name={'restricted_time_period'}
            label={'Restricted Time Period'}
            placeholder={'Restricted Time Period'}
            value={values.restrictedTimePeriod}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled
          />}
          </fieldset>
        </Form>
      )}
    </Formik>
  </OverviewWrapper>
};

export default Overview;
