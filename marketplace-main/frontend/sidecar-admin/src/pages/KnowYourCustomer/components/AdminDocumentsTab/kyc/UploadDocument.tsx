import React, {FC, useEffect} from "react";
import {ErrorMessage, Formik} from "formik";
import Select from "react-select";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import get from "lodash/get";
import {
  DEFAULT_ID_TYPE_OPTIONS,
  ID_DOC_IMAGE_VALUE,
  ID_TYPE_OPTIONS,
  showExpirationDate,
  VALIDATION_SCHEMA
} from "./constants";
import DocumentDropZone from "../../../../../components/FileUpload";
import DocTag from "../../../../../components/FilePreviewModal/DocTag";
import Container from "react-bootstrap/Container";
import {ISelectOption, ISelectOptionNumValue} from "../../../../../interfaces/form";
import {useAppDispatch, useAppSelector} from "../../../../../app/hooks";
import {fetchGeoSelector} from "../../../../EligibilityCriteria/thunks";
import {selectCountrySelector} from "../../../../EligibilityCriteria/selectors";
import {IKycRecord} from "../../../../../interfaces/kycRecord";
import DatePicker from "react-datepicker";
import find from "lodash/find";
import {DatePickerDiv, TextInput} from "../styles";


interface UploadDocumentProps {
  onCancel: () => void;
  onSave: (payload: any) => void;
  options: ISelectOption[],
  kycRecord: IKycRecord;
  countryDocumentIdMap: any
}


const UploadDocument: FC<UploadDocumentProps> = ({onSave, onCancel, options, kycRecord, countryDocumentIdMap}) => {
    const dispatch = useAppDispatch()
    const countries = useAppSelector(selectCountrySelector);

    useEffect(() => {
      dispatch(fetchGeoSelector());
    }, [])


    if (!countries) return <></>

    const handleChange = async (values: any) => {
      const formData = new FormData();
      if (values.file_data)
        formData.append("file_data", values.file_data);

      formData.append("field_id", get(values.field_id, "value"));
      await onSave(values)
      onCancel()
      return true;
    }

    const onSubmit = async (
      values: any,
      {setSubmitting}: any
    ) => {
      setSubmitting(true);
      await handleChange(values);
      setSubmitting(false);
    }

    const getCountryOption = (countryId: number | null) => {
      if (!countryId) return null;
      return find(
        countries,
        (country: any) => country.id === countryId
      )
    }

    const getIdDocumentTypeOption = (documentTypeId: number | null) => {
      if (!documentTypeId) return null;
      return find(
        ID_TYPE_OPTIONS,
        (idType: ISelectOptionNumValue) => idType.value === documentTypeId
      )
    }

    const getDocumentIdOptions = (values: any) => {
      if (!values.id_issuing_country) return []
      const countryAllowedDocuments = get(countryDocumentIdMap, `${values.id_issuing_country}`)
      if (!countryAllowedDocuments) return DEFAULT_ID_TYPE_OPTIONS
      return ID_TYPE_OPTIONS.filter((option) => countryAllowedDocuments.includes(option.value))
    }

    const getInitialValues = () => {
      return {
        "file_data": null,
        "field_id": null,
        "id_issuing_country": kycRecord.id_issuing_country,
        "id_document_type": kycRecord.id_document_type,
        "id_expiration_date": kycRecord.id_expiration_date ? new Date(kycRecord.id_expiration_date) : null,
        "number_of_id": kycRecord.number_of_id,
      }
    }

    return (

      <Formik
        initialValues={getInitialValues()}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({
            errors,
            values,
            handleSubmit,
            isSubmitting,
            setFieldValue
          }) => {
          const isIdDocumentSelected = get(values, 'field_id.value') === ID_DOC_IMAGE_VALUE
          return (
            <Container>
              <Row>
                <Col md={12} className={'mb-2'}>
                  Select Document Type
                </Col>
                <Col md={9} className={'mb-2 p-2'}>
                  <Select
                    placeholder="Document Type"
                    onChange={(value: any) => {
                      setFieldValue("field_id", value);
                    }}
                    className="basic-single ms-lg-3"
                    classNamePrefix="select"
                    isSearchable={true}
                    isMulti={false}
                    value={values.field_id}
                    name="field_id"
                    options={options}
                    onBlur={() => {
                    }}
                  />
                  <ErrorMessage className="text-danger" name="field_id" component="div"/>
                </Col>
              </Row>

              {isIdDocumentSelected && <>
                <Row>
                  <Col md={12} className={'mb-2'}>
                    ID Issuing Country
                  </Col>
                  <Col md={9} className={'mb-2 p-2'}>
                    <Select
                      placeholder="ID Issuing Country"
                      onChange={(value: any) => {
                        setFieldValue("id_issuing_country", value.id);
                      }}
                      className="basic-single ms-lg-3"
                      classNamePrefix="select"
                      isSearchable={true}
                      isMulti={false}
                      value={getCountryOption(values.id_issuing_country)}
                      name="id_issuing_country"
                      options={countries}
                      onBlur={() => {
                      }}
                    />
                    <ErrorMessage className="text-danger" name="id_issuing_country" component="div"/>
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className={'mb-2'}>
                    ID Document type
                  </Col>
                  <Col md={9} className={'mb-2 p-2'}>
                    <Select
                      placeholder="DocumentType"
                      onChange={(value: any) => {
                        setFieldValue("id_document_type", value.value);
                      }}
                      className="basic-single ms-lg-3"
                      classNamePrefix="select"
                      isSearchable={true}
                      isMulti={false}
                      value={getIdDocumentTypeOption(values.id_document_type)}
                      name="id_document_type"
                      options={getDocumentIdOptions(values)}
                      onBlur={() => {
                      }}
                    />
                    <ErrorMessage className="text-danger" name="id_document_type" component="div"/>
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className={'mb-2'}>
                    Identification Number for the ID
                  </Col>
                  <Col md={9} className={'mb-2 p-2'}>
                    <TextInput
                      className={'text-input ms-lg-3 pe-0'}
                      type="text"
                      name={'number_of_id'}
                      placeholder={'Id Number'}
                      onChange={(e: any) => setFieldValue("number_of_id", e.target.value)}
                      value={values.number_of_id}
                    />
                    <ErrorMessage className="text-danger" name="number_of_id" component="div"/>
                  </Col>
                </Row>
                {showExpirationDate(values.id_document_type) && <Row>
                  <Col md={12} className={'mb-2'}>
                    ID Expiration
                  </Col>
                  <Col md={9} className={'mb-2 p-2'}>
                    <DatePickerDiv className={'ms-lg-3'}>
                      <DatePicker
                        selected={values.id_expiration_date}
                        onChange={(date) => setFieldValue('id_expiration_date', date)}
                        minDate={new Date()}
                        name="id_expiration_date"
                        dateFormat={'yyyy-MM-dd'}
                        className={'form-control'}
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                      <ErrorMessage className="text-danger" name="id_expiration_date" component="div"/>
                    </DatePickerDiv>
                  </Col>
                </Row>}
              </>}
              <Row className={"mt-2 mb-3"}>
                <Col md={12} className="field-label">
                  Upload Document
                </Col>
                <Col md={12}>
                  <Form.Group controlId="formFilterValue">
                    {values.file_data ? (
                      <DocTag
                        // @ts-ignore
                        documentName={values.file_data?.name}
                        handleDelete={() => setFieldValue("file_data", null)}
                      />
                    ) : (
                      <DocumentDropZone onFileSelect={(file) => {
                        setFieldValue("file_data", file)
                      }} disabled={false}/>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className={'mt-3 mb-2'}>
                  <Button
                    variant="outline-primary"
                    type="cancel"
                    className={"cancel-button float-end"}
                    disabled={isSubmitting}
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    className={"submit-button"}
                    disabled={isSubmitting || (!values.file_data && !isIdDocumentSelected)}
                    onClick={() => handleSubmit()}
                  >
                    Save
                  </Button>
                </Col>
              </Row>
            </Container>
          )
        }}
      </Formik>
    )
  }
;


export default UploadDocument;

