import { Formik, Form } from 'formik';
import React, { FC } from 'react';
import { Button, Col, Modal, Row , Form as ReactForm} from 'react-bootstrap';
import { FormSelectorFieldRow } from '../../../../components/Form/SelectorField';
import TextInput from '../../../EligibilityCriteriaPreview/components/Form/TextInput';
import { DocumentUploadWrapper } from '../../../../components/CompanyInfo/styles';
import DocTag from '../../../../components/FilePreviewModal/DocTag';
import DocumentDropZone from '../../../../components/FileUpload';
import { get, isDate } from 'lodash';
import { ID_DOCUMENT_TYPES } from '../../../EligibilityCriteriaPreview/components/CountrySelector/constants';
import { BASE_DOCUMENT_SCHEMA, EDIT_PARTICIPANT_SCHEMA } from '../../constants';
import moment from 'moment';
import { generateDateWithOffset, standardizeDateForApi } from '../../../../utils/dateFormatting';
import FormDateField from '../../../../components/Form/DateField';
import { FormContainer } from '../../styles';

const AddDefaultID: FC<any> = ({
    record,
    countries,
    show,
    asParticipant,
    onClose,
    onUpdateDefaultId,
}) => {

    const getInitialValues = () => {
        const values: any = {
            id_expiration_date: generateDateWithOffset(get(record, 'id_expiration_date', new Date())),
            id_issuing_country: countries?.find((country: any) => country.id === get(record, 'id_issuing_country.id')),
            number_of_id: get(record, 'number_of_id'),
            id_document_type: ID_DOCUMENT_TYPES.find((type: any) => type.value === get(record, 'id_document_type')),
            file: null
        }
        if(asParticipant){
            values.first_name = get(record, 'first_name');
            values.last_name = get(record, 'last_name');
        }
        return values;
    }

    const onSubmit = (values: any) => {
        values.id_issuing_country = values.id_issuing_country.id;
        values.id_document_type = values.id_document_type.value;
        values.id_expiration_date = standardizeDateForApi(values.id_expiration_date);
        onUpdateDefaultId(values)
    }

    return <Modal show={show} size="lg" onHide={onClose}>
        <Modal.Header>
            {asParticipant ? 'Edit Entity Participant' : 'Add Default ID'}
        </Modal.Header>
        <Modal.Body>
            {!asParticipant && <p>Adding a new default ID will replace the old Default ID</p>}
            <FormContainer>
            <Formik
                initialValues={getInitialValues()}
                validationSchema={asParticipant ? EDIT_PARTICIPANT_SCHEMA : BASE_DOCUMENT_SCHEMA}
                validateOnMount
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
                        <Row>
                            <Col md="12">
                            {
                                asParticipant && <>
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
                                </>
                            }
                            <FormSelectorFieldRow
                                    label={'Select ID Type'}
                                    name={'id_document_type'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('id_document_type', value)}
                                    value={values.id_document_type}
                                    options={ID_DOCUMENT_TYPES}
                                />
                                <FormSelectorFieldRow
                                    label={'ID Issuing Country'}
                                    name={'id_issuing_country'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('id_issuing_country', value)}
                                    value={values.id_issuing_country}
                                    options={countries}
                                />
                                <TextInput
                                    name={'number_of_id'}
                                    label={'Identification Number for the ID'}
                                    placeholder={'Identification Number for the ID'}
                                    value={values.number_of_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <FormDateField
                                  name="id_expiration_date"
                                  label="ID Expiration"
                                  placeholder="ID Expiration"
                                  minDate={moment().toDate()}
                                  value={get(values, 'id_expiration_date') && isDate(get(values, 'id_expiration_date')) ? get(values, 'id_expiration_date') : new Date()}
                                  onChange={(e: any) => setFieldValue('id_expiration_date', new Date(e))}
                                  onBlur={handleBlur}
                              />
                            </Col>
                        </Row>
                        <DocumentUploadWrapper>
                <ReactForm.Group className='mt-4' controlId="formFilterValue">
                    {values.file ? (
                      <DocTag documentName={values.file?.name}
                              handleDelete={() => setFieldValue("file", "")}/>
                    ) : (
                      <DocumentDropZone onFileSelect={(file: any) => {
                        setFieldValue("file", file)
                      }} disabled={false}/>
                    )}
                  </ReactForm.Group>
                </DocumentUploadWrapper>
                        <Modal.Footer className='mt-4'>
                            <Button variant="secondary" onClick={onClose}>Close</Button>
                            <Button 
                            disabled={!isValid}
                            variant="primary" 
                            type="submit">Save</Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
            </FormContainer>
        </Modal.Body>
    </Modal>
}

export default AddDefaultID;