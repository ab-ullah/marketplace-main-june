import React, { useMemo } from 'react';
import { FormSelectorFieldRow } from '../../../../components/Form/SelectorField';
import { StyledForm } from '../../../../presentational/forms';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import { DocumentFormDiv, DocumentUploadWrapper } from '../../../../components/CompanyInfo/styles';
import DocTag from '../../../../components/FilePreviewModal/DocTag';
import DocumentDropZone from '../../../../components/FileUpload';
import { Label } from '../../../../components/Form/styles';
import { AddNoticesButtonWrapper } from '../../Details/styles';
import { useGetInvestorsQuery } from '../../../../api/rtkQuery/usersApi';
import {each, get, orderBy} from 'lodash';
import { VALIDATION_SCHEMA } from './utils';
import {v4 as uuidv4} from "uuid";
import API from "../../../../api/backendApi";

export enum UploadType{
    TRANSACTIONAL = "transactional",
    COMPENSATION = "compensation",
    VALUATION = "valuation",
    EMPLOYEE = "employee",
    ORGANIZATIONAL_CHART = "organization_chart"

}

const AddNotice = () => {

    const {
        data: investorsList,
    } = useGetInvestorsQuery();

    const investorOptions = useMemo(() => {
        const options: any[] = [];
        const orderInvestorsList = orderBy(investorsList, (investor: any) => investor.name, 'asc');
        orderInvestorsList?.forEach((investor: any) => {
            options.push({
                value: investor.id,
                label: `${investor.name} - ${investor.investor_account_code}`
            })
        })
        return options;
    }, [investorsList])

    const uploadTypeOptions = [
      { value: UploadType.TRANSACTIONAL, label: "Transactional" },
      { value: UploadType.VALUATION, label: "Valuation" },
      { value: UploadType.COMPENSATION, label: "Compensation" },
      { value: UploadType.EMPLOYEE, label: "Employee"},
      { value: UploadType.ORGANIZATIONAL_CHART, label: "Organizational Chart"}
    ];

    const getInitialValues: any = () => {
        return {
            documentFile: null,
            selectedInvestor: null,
            uploadType: null
        }
    }

    const onAddNotice = async (values: {uploadType: { value: UploadType }, selectedInvestor: {value: string}, documentFile: any}) => {
        const uploadType = values.uploadType?.value;
        const investor = uploadType !== 'compensation' ? values.selectedInvestor?.value : null;
        const formData = new FormData();

        if(['compensation', 'valuation', 'transactional', 'organization_chart'].includes(uploadType)) {
            formData.append("document_file", values.documentFile);
            investor && formData.append("investor", investor);
            formData.append("notice_type", uploadType)
            await API.createNoticeDocument(formData);
        }
        if([UploadType.EMPLOYEE].includes(uploadType)){
            formData.append("employees_onboarding_file", values.documentFile)
            await API.uploadEmployeesOnboarding(formData);
        }
            
    }
    return (
        <>
            <DocumentFormDiv>
                <Formik
                    initialValues={getInitialValues()}
                    validationSchema={VALIDATION_SCHEMA}
                    onSubmit={onAddNotice}
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
                    }) => {
                        console.log(isValid, errors)
                        return (
                            <StyledForm onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <FormSelectorFieldRow
                                            label="Select Type"
                                            name="uploadType"
                                            placeholder="Select Type"
                                            onChange={(value: any) => setFieldValue("uploadType", value)}
                                            onBlur={handleBlur}
                                            value={values.uploadType}
                                            options={uploadTypeOptions}
                                        />
                                    </Col>
                                </Row>
                                {!([UploadType.COMPENSATION, UploadType.EMPLOYEE, UploadType.ORGANIZATIONAL_CHART].includes(values.uploadType?.value)) &&
                                    <Row>
                                        <Col md={6}>
                                            <FormSelectorFieldRow
                                                label="Select Investor"
                                                name="selectedInvestor"
                                                placeholder="Select Investor"
                                                onChange={(value: any) => setFieldValue("selectedInvestor", value)}
                                                onBlur={handleBlur}
                                                value={values.selectedInvestor}
                                                options={investorOptions}
                                            />

                                        </Col>
                                    </Row>
                                }
                                <Row className='mt-3'>
                                    <Col md={6}>
                                        <Label>CSV</Label>
                                        <DocumentUploadWrapper>
                                            <Form.Group controlId="formFilterValue">
                                                {values.documentFile ? (
                                                    <DocTag documentName={values.documentFile?.name}
                                                            handleDelete={() => setFieldValue("documentFile", "")}/>
                                                ) : (
                                                    <DocumentDropZone onFileSelect={(file) => {
                                                        setFieldValue("documentFile", file)
                                                    }} disabled={false}/>
                                                )}
                                            </Form.Group>
                                        </DocumentUploadWrapper>
                                        <div className='text-danger'>
                                            {errors.documentFile}
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <AddNoticesButtonWrapper>
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                className={'filled'}
                                                disabled={!isValid || isSubmitting}
                                            >
                                                Upload
                                            </Button>
                                        </AddNoticesButtonWrapper>
                                    </Col>
                                </Row>
                            </StyledForm>
                        )
                    }}
                </Formik>
            </DocumentFormDiv>
        </>
    )
}

export default AddNotice;