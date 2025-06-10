import { Formik, Form } from 'formik';
import React, { FC } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import TextInput from '../../../../../../../../../EligibilityCriteriaPreview/components/Form/TextInput';
import { FormSelectorFieldRow } from '../../../../../../../../../../components/Form/SelectorField';
import { get, pick } from 'lodash';
import { PARTICIPANT_ENTITY_VALIDATION_SCHEMA } from '../../constants';
import { generateDateWithOffset, standardizeDateForApi } from '../../../../../../../../../../utils/dateFormatting';
import FormDateField from '../../../../../../../../../../components/Form/DateField';
import { FormContainer } from '../../styles';

const EditEntity: FC<any> = ({
    record,
    countries,
    show,
    onClose,
    onEditEntity
}) => {

    const onSubmit = (values: any) => {
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
        payload.jurisdiction = values.jurisdiction.id
        payload.date_of_formation = standardizeDateForApi(values.date_of_formation);
        onEditEntity(payload)
    }

    return <Modal show={show} size="lg" onHide={onClose}>
        <Modal.Header>Edit Entity</Modal.Header>
        <Modal.Body>
           <FormContainer>
           <Formik
                initialValues={{
                    ...record,
                    date_of_formation: generateDateWithOffset(get(record, 'date_of_formation', new Date())),
                    jurisdiction: countries?.find((country: any) => country.id === get(record, 'jurisdiction.id')),
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