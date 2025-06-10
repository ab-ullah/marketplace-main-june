import {Form, Formik} from 'formik';
import React, {FunctionComponent} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {DEPARTMENTS, INVESTOR_TYPE_OPTIONS, JOB_BANDS, VALIDATION_SCHEMA} from "./constants";

import {Button} from "react-bootstrap";

import {selectApplicantInfo, selectFundCriteriaPreview} from "../../selectors";
import {updateApplicantInfo} from "../../eligibilityCriteriaPreviewSlice";
import SelectorField from "../Form/SelectorField";
import TextInput from "../Form/TextInput";

interface ApplicantInfoFormProps {
  handleNextFunction: () => void
}

const ApplicantInfoForm: FunctionComponent<ApplicantInfoFormProps> = ({handleNextFunction}) => {
  const dispatch = useAppDispatch()
  const criteria = useAppSelector(selectFundCriteriaPreview)
  const applicantInfo = useAppSelector(selectApplicantInfo)
  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true)
    dispatch(updateApplicantInfo(values))
    setSubmitting(false)
    handleNextFunction();
  }

  if (!criteria) return <></>


  return <div>
    <Formik
      initialValues={applicantInfo}
      validationSchema={VALIDATION_SCHEMA}
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
          <SelectorField
            label={'How will you be investing?'}
            name={'entityType'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('entityType', value)}
            value={values.entityType}
            options={INVESTOR_TYPE_OPTIONS}
          />

          <SelectorField
            label={'Where were you when you decided to invest?'}
            name={'officeLocation'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('officeLocation', value)}
            value={values.officeLocation}
            options={criteria.countries}
          />

          <TextInput
            name={'firstName'}
            label={'First Name'}
            placeholder={'First Name'}
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <TextInput
            name={'lastName'}
            label={'Last Name'}
            placeholder={'Last Name'}
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <TextInput
            name={'jobTitle'}
            label={'Job Title'}
            placeholder={'Job Title'}
            value={values.jobTitle}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <SelectorField
            label={'Department'}
            name={'department'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('department', value)}
            value={values.department}
            options={DEPARTMENTS}
          />

          <SelectorField
            label={'Job Band'}
            name={'jobBand'}
            placeholder={''}
            onChange={(value: any) => setFieldValue('jobBand', value)}
            value={values.jobBand}
            options={JOB_BANDS}
            helpText={'Find this in Workday under your Job Details'}
          />

          <Button variant="primary" type="submit" disabled={isSubmitting || !isValid} className={'mt-3'}>
            Next
          </Button>
        </Form>
      )}
    </Formik>
  </div>
};

export default ApplicantInfoForm;
