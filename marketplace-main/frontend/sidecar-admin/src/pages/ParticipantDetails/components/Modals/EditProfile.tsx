import { Formik, Form } from 'formik';
import React, { FC } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { FormSelectorFieldRow } from '../../../../components/Form/SelectorField';
import TextInput from '../../../EligibilityCriteriaPreview/components/Form/TextInput';
import { PARTICIPANT_PROFILE_VALIDATION_SCHEMA, POLITICALLY_EXPOSED_OPTIONS } from '../../constants';
import RadioField from '../../../../components/Form/RadioField';
import { get, pick } from 'lodash';
import { DEPARTMENTS, JOB_BANDS } from '../../../EligibilityCriteriaPreview/components/CountrySelector/constants';
import FormDateField from '../../../../components/Form/DateField';
import { generateDateWithOffset, standardizeDateForApi } from '../../../../utils/dateFormatting';
import { FormContainer } from '../../styles';

const EditProfile: FC<any> = ({
    record,
    countries,
    show,
    onClose,
    currencies,
    onEditProfile,
    onEditPaymentDetail,
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
        const pdPayload = {
            account_name: values.bank_account_name,
            account_number: values.bank_account_number,
            routing_number: values.bank_routing_number,
            bank_name: values.bank_name,
            bank_country: values.bank_country.id,
            currency: values.bank_currency.id,
            state: values.bank_state,
            street_address: values.bank_street_address
        }
        payload.citizenship_country = values.citizenship_country.id
        payload.department = values.department.value
        payload.office_location = values.office_location.id
        payload.job_band = values.job_band.value
        payload.pollitically_exposed_person = values.pollitically_exposed_person.value === 'yes' ? true : false;
        payload.date_of_birth = standardizeDateForApi(values.date_of_birth);
        onEditProfile(payload)
        onEditPaymentDetail(pdPayload)
    }

    return <Modal show={show} size="lg" onHide={onClose}>
        <Modal.Header>Edit Profile</Modal.Header>
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
                    },
                    bank_account_name: get(record, 'payment_detail.account_name'),
                    bank_name: get(record, 'payment_detail.bank_name'),
                    bank_routing_number: get(record, 'payment_detail.routing_number'),
                    bank_account_number: get(record, 'payment_detail.account_number'),
                    bank_country: countries?.find((country: any) => country.id === get(record, 'payment_detail.bank_country.id')),
                    bank_currency: currencies?.find((currency: any) => currency.id === get(record, 'payment_detail.currency')),
                    bank_state: get(record, 'payment_detail.state'),
                    bank_street_address: get(record, 'payment_detail.street_address'),
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
                        console.log("errors ====>>>>>", errors)
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
                        <h6 className='mt-4'>Banking details</h6>
                        <Row>
                            <Col>
                                <TextInput
                                    name={'bank_name'}
                                    label={'Bank name'}
                                    placeholder={'Bank name'}
                                    value={values.bank_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <TextInput
                                    name={'bank_account_number'}
                                    label={'Account number'}
                                    placeholder={'Account number'}
                                    value={values.bank_account_number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <TextInput
                                    name={'bank_routing_number'}
                                    label={'Routing number'}
                                    placeholder={'Routing number'}
                                    value={values.bank_routing_number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <TextInput
                                    name={'bank_account_name'}
                                    label={'Account name'}
                                    placeholder={'Account name'}
                                    value={values.bank_account_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <FormSelectorFieldRow
                                    label={'Bank country'}
                                    name={'bank_country'}
                                    placeholder={'Bank country'}
                                    onChange={(value: any) => setFieldValue('bank_country', value)}
                                    value={values.bank_country}
                                    options={countries}
                                />
                                <TextInput
                                    name={'bank_state'}
                                    label={'Bank state'}
                                    placeholder={'Bank state'}
                                    value={values.bank_state}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <TextInput
                                    name={'bank_street_address'}
                                    label={'Bank street address'}
                                    placeholder={'Bank street address'}
                                    value={values.bank_street_address}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <FormSelectorFieldRow
                                    label={'Currency'}
                                    name={'currency'}
                                    placeholder={'Currency'}
                                    onChange={(value: any) => setFieldValue('bank_currency', value)}
                                    value={values.bank_currency}
                                    options={currencies}
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

export default EditProfile;