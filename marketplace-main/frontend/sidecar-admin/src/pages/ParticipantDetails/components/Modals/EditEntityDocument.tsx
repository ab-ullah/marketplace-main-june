import { Formik, Form } from 'formik';
import React, { FC } from 'react';
import { Button, Col, Modal, Row, Form as ReactForm } from 'react-bootstrap';
import { FormSelectorFieldRow } from '../../../../components/Form/SelectorField';
import { DocumentUploadWrapper } from '../../../../components/CompanyInfo/styles';
import DocTag from '../../../../components/FilePreviewModal/DocTag';
import DocumentDropZone from '../../../../components/FileUpload';
import { Label } from '../../../../components/Form/styles';
import { useGetKYCDocumentOptionsQuery } from '../../../../api/rtkQuery/kycApi';

const INIT_VALUES: any = { file: null, field_id: null };

const EditEntityDocuments: FC<any> = ({
    show,
    onClose,
    onCreate
}) => {
    const {data: kycDocumentOptions} = useGetKYCDocumentOptionsQuery()
    return <Modal show={show} size="xl" onHide={onClose}>
        <Modal.Header>
            Edit Entity Documents
        </Modal.Header>
        <Modal.Body>
            <Formik
                initialValues={INIT_VALUES}
                //   validationSchema={VALIDATION_SCHEMA}
                enableReinitialize={true}
                onSubmit={onCreate}
            >
                {({
                    values,
                    handleSubmit,
                    setFieldValue,
                    isSubmitting,
                    isValid
                }) => (
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md="6">
                                <FormSelectorFieldRow
                                    label={'Select Document Type'}
                                    name={'field_id'}
                                    placeholder={''}
                                    onChange={(value: any) => setFieldValue('field_id', value)}
                                    value={values.document_type}
                                    options={kycDocumentOptions.options}
                                />
                            </Col>
                        </Row>
                        <Label>Upload Document</Label>
                        <DocumentUploadWrapper>
                            <ReactForm.Group controlId="formFilterValue">
                                {values.file ? (
                                    <DocTag documentName={values.file?.name}
                                        handleDelete={() => setFieldValue("file", "")} />
                                ) : (
                                    <DocumentDropZone onFileSelect={(file: any) => {
                                        setFieldValue("file", file)
                                    }} disabled={false} />
                                )}
                            </ReactForm.Group>
                        </DocumentUploadWrapper>
                        <Modal.Footer className='mt-4'>
                            <Button variant="secondary" onClick={onClose}>Close</Button>
                            <Button variant="primary" type='submit'>Save</Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal.Body>
    </Modal>
}

export default EditEntityDocuments;