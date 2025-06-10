import { Formik, Form } from 'formik';
import React, { FC } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import TextInput from '../../../EligibilityCriteriaPreview/components/Form/TextInput';
import { FormSelectorFieldRow } from '../../../../components/Form/SelectorField';
import { get, pick } from 'lodash';
import { PARTICIPANT_ENTITY_VALIDATION_SCHEMA } from '../../constants';
import { generateDateWithOffset, standardizeDateForApi } from '../../../../utils/dateFormatting';
import FormDateField from '../../../../components/Form/DateField';
import { FormContainer } from '../../styles';

const EditEntity: FC<any> = ({
    record,
    countries,
    currencies,
    show,
    onClose,
    onEditEntity,
    onEditPaymentDetail,
}) => {
    const onSubmit = (values: any) => {
        console.log(values)
        const payload: any = pick(values, [
            'date_of_formation',
            'entity_name',
            'entity_title',
            'nature_of_business',
            'registered_address',
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
        payload.jurisdiction = values.jurisdiction.id
        payload.date_of_formation = standardizeDateForApi(values.date_of_formation);
        onEditEntity(payload)
        onEditPaymentDetail(pdPayload)
    }
    console.log(record)
    return <Modal show={show} size="lg" onHide={onClose}>
        <Modal.Header>Edit Entity</Modal.Header>
        <Modal.Body>
            <FormContainer>
            <Formik
                initialValues={{
                    ...record,
                    date_of_formation: generateDateWithOffset(get(record, 'date_of_formation', new Date())),
                    jurisdiction: countries?.find((country: any) => country.id === get(record, 'jurisdiction.id')),
                    bank_account_name: get(record, 'payment_detail.account_name'),
                    bank_name: get(record, 'payment_detail.bank_name'),
                    bank_routing_number: get(record, 'payment_detail.routing_number'),
                    bank_account_number: get(record, 'payment_detail.account_number'),
                    bank_country: countries?.find((country: any) => country.id === get(record, 'payment_detail.bank_country.id')),
                    bank_currency: currencies?.find((currency: any) => currency.id === get(record, 'payment_detail.currency')),
                    bank_state: get(record, 'payment_detail.state'),
                    bank_street_address: get(record, 'payment_detail.street_address'),
                }}
                  validationSchema={PARTICIPANT_ENTITY_VALIDATION_SCHEMA}
                enableReinitialize={true}
                validateOnMount
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
                        <Row>
                            <Col md="12">
                                <TextInput
                                    name={'entity_name'}
                                    label={'Entity Name'}
                                    placeholder={'Entity Name'}
                                    value={values.entity_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <TextInput
                                    name={'entity_title'}
                                    label={'Title Signing on Behalf of Your Entity'}
                                    placeholder={'Title Signing on Behalf of Your Entity'}
                                    value={values.entity_title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <FormDateField
                                  name="date_of_formation"
                                  label="Date of Formation"
                                  placeholder="Enter Date of Formation"
                                  value={get(values, 'date_of_formation') ? get(values, 'date_of_formation') : new Date()}
                                  onChange={(e: any) => setFieldValue('date_of_formation', new Date(e))}
                                  onBlur={handleBlur}
                              />
                                <TextInput
                                    name={'nature_of_business'}
                                    label={'Nature of Business'}
                                    placeholder={'Nature of Business'}
                                    value={values.nature_of_business}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <FormSelectorFieldRow
                                    label={'Jurisdiction'}
                                    name={'jurisdiction'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('jurisdiction', value)}
                                    value={values.jurisdiction}
                                    options={countries}
                                />
                                <Row>
                                    <Col>
                                        <TextInput
                                            name={'registered_address'}
                                            label={'Registered Address'}
                                            placeholder={'Registered Address'}
                                            value={values.registered_address}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
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
                            </Col>
                        </Row>
                        <Modal.Footer className='mt-4'>
                            <Button variant="secondary" onClick={onClose}>Close</Button>
                            <Button 
                                variant="primary" 
                                type="submit"
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

export default EditEntity;