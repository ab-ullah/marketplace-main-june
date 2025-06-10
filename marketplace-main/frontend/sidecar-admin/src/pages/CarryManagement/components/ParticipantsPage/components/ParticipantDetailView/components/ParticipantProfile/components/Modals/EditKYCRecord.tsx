import { Formik, Form } from 'formik';
import React, { FC } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import TextInput from '../../../../../../../../../EligibilityCriteriaPreview/components/Form/TextInput';
import { FormSelectorFieldRow } from '../../../../../../../../../../components/Form/SelectorField';
import { PARTICIPANT_PROFILE_VALIDATION_SCHEMA, POLITICALLY_EXPOSED_OPTIONS } from '../../constants';
import { get, pick } from 'lodash';
import RadioField from '../../../../../../../../../../components/Form/RadioField';
import { DEPARTMENTS, JOB_BANDS } from '../../../../../../../../../EligibilityCriteriaPreview/components/CountrySelector/constants';
import { generateDateWithOffset, standardizeDateForApi } from '../../../../../../../../../../utils/dateFormatting';
import FormDateField from '../../../../../../../../../../components/Form/DateField';
import { FormContainer } from '../../styles';

const EditKYCRecord: FC<any> = ({
    record,
    countries,
    show,
    onClose,
    onEditProfile
}) => {

    const onSubmit = (values: any) => {
        const payload: any = pick(values, [
            'first_name',
            'last_name',
            'phone_number',
            'date_of_birth',
            'home_address',
            'home_city',
            'home_state',
            'home_region',
            'job_title',
        ])
        payload.citizenship_country = values.citizenship_country.id
        payload.department = values.department.value
        payload.office_location = values.office_location.id
        payload.job_band = values.job_band.value
        payload.pollitically_exposed_person = values.pollitically_exposed_person.value === 'yes';
        payload.date_of_birth = standardizeDateForApi(values.date_of_birth);
        onEditProfile(payload)
    }

    return <Modal show={show} size="lg" onHide={onClose}>
        <Modal.Header>Edit KyC Record</Modal.Header>
        <Modal.Body>
            <h6>Profile</h6>
            <FormContainer>
            <Formik
                initialValues={{
                    ...record,
                    date_of_birth: generateDateWithOffset(get(record, 'date_of_birth', new Date())),
                    citizenship_country: countries?.find((country: any) => country.id === get(record, 'citizenship_country.id')),
                    office_location: countries?.find((country: any) => country.id === get(record, 'office_location.id')),
                    department: DEPARTMENTS.find((department: any) => department.value === get(record, 'department')),
                    job_band: JOB_BANDS.find((band: any) => band.value === get(record, 'job_band')),
                    pollitically_exposed_person: {
                        label: get(record, 'pollitically_exposed_person', undefined) === true ? 'Yes' : 'No',
                        value: get(record, 'pollitically_exposed_person', undefined) === true ? 'yes' : 'no'
                    }
                }}
                validationSchema={PARTICIPANT_PROFILE_VALIDATION_SCHEMA}
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
                    isValid,
                    errors
                }) => (
                    <Form onSubmit={(data: any) => {
                        handleSubmit(data)
                    }}>
                        <Row>
                            <Col md="12">
                                <TextInput
                                    name={'first_name'}
                                    label={'First Name'}
                                    placeholder={'Name'}
                                    value={values.first_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <TextInput
                                    name={'last_name'}
                                    label={'Last Name'}
                                    placeholder={'Name'}
                                    value={values.last_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <TextInput
                                    name={'phone_number'}
                                    label={'Phone'}
                                    placeholder={'Phone'}
                                    value={values.phone_number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <FormDateField
                                  name="date_of_birth"
                                  label="Date of Birth"
                                  placeholder="Enter Date of Birth"
                                  value={get(values, 'date_of_birth') ? get(values, 'date_of_birth') : new Date()}
                                  onChange={(e: any) => setFieldValue('date_of_birth', new Date(e))}
                                  onBlur={handleBlur}
                              />
                                <h6 className='mt-4'>Home Address</h6>
                                <Row>
                                    <Col>
                                        <TextInput
                                            name={'home_address'}
                                            label={'Street Address'}
                                            placeholder={'Street Address'}
                                            value={values.home_address}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="9">
                                        <TextInput
                                            name={'home_city'}
                                            label={'City'}
                                            placeholder={'City'}
                                            value={values.home_city}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </Col>
                                    <Col md="3">
                                        { 
                                            values.home_state ? <TextInput
                                            name={'home_state'}
                                            label={'State'}
                                            placeholder={'State'}
                                            value={values.home_state}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        /> : <TextInput
                                        name={'home_region'}
                                        label={'Region'}
                                        placeholder={'Region'}
                                        value={values.home_region}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                        }
                                    </Col>
                                </Row>
                                <FormSelectorFieldRow
                                    label={'Country of Citizenship'}
                                    name={'citizenship_country'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('citizenship_country', value)}
                                    value={values.citizenship_country}
                                    options={countries}
                                />
                                <RadioField
                                    label="Politically Exposed"
                                    name="pollitically_exposed_person"
                                    onChange={(value: any) => setFieldValue("pollitically_exposed_person", value)}
                                    options={POLITICALLY_EXPOSED_OPTIONS}
                                    value={values.pollitically_exposed_person}
                                />
                            </Col>
                        </Row>
                        <h6 className='mt-4'>Job Information</h6>
                        <Row>
                            <Col md="12">
                                <TextInput
                                    name={'job_title'}
                                    label={'Job Title'}
                                    placeholder={'Job Title'}
                                    value={values.job_title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <FormSelectorFieldRow
                                    label={'Department'}
                                    name={'department'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('department', value)}
                                    value={values.department}
                                    options={DEPARTMENTS}
                                />
                                <FormSelectorFieldRow
                                    label={'Office Location'}
                                    name={'office_location'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('office_location', value)}
                                    value={values.office_location}
                                    options={countries}
                                />
                                <FormSelectorFieldRow
                                    label={'Job Band'}
                                    name={'job_band'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('job_band', value)}
                                    value={values.job_band}
                                    options={JOB_BANDS}
                                />
                            </Col>
                        </Row>
                        <Modal.Footer className='mt-4'>
                            <Button variant="secondary" onClick={onClose}>Close</Button>
                            <Button 
                                variant="primary" 
                                type='submit'
                                disabled={!isValid}
                                >Save</Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
            </FormContainer>
        </Modal.Body>
    </Modal>
}

export default EditKYCRecord;