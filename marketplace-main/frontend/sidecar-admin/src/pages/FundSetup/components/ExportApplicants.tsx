import React, {FunctionComponent, useState} from "react";
import {IFundBaseInfo} from "../../../interfaces/fundDetails";
import applicationsAPI from "../../../api/applicationsAPI";
// @ts-ignore
import {useJsonToCsv} from 'react-json-csv';
import Button from "react-bootstrap/Button";
import {formatDownloadableData, headers} from "./ApplicantsList/formatDownloadableData";
import {useAppSelector} from "../../../app/hooks";
import {selectStatuses} from "../selectors";
import AmlKYCReport from "./AmlKycExport/export";
import {selectCountrySelector} from "../../EligibilityCriteria/selectors";
import {Col, Dropdown, Form, Row} from "react-bootstrap";
import get from "lodash/get";
import each from "lodash/each";
import API from "../../../api";
import {logMixPanelEvent} from "../../../utils/mixPanel";
import SidecarModal from "../../../components/SidecarModal";
import {DocumentFormDiv, DocumentUploadWrapper} from "../../../components/CompanyInfo/styles";
import {Formik} from "formik";
import {StyledForm} from "../../../presentational/forms";
import DocTag from "../../../components/FilePreviewModal/DocTag";
import DocumentDropZone from "../../../components/FileUpload";
import {AddNoticesButtonWrapper} from "../../Companies/Details/styles";
import {VALIDATION_SCHEMA} from "./utils";
import Alert from "react-bootstrap/Alert";


interface UploadInvestorAccountCodesProps {
  fund: IFundBaseInfo;
}

const UploadInvestorAccountCodes: FunctionComponent<UploadInvestorAccountCodesProps> = ({fund}) => {
  const [fetchingData, setFetchingData] = useState<boolean>(false)
  const [exportData, setExportData] = useState<object[]>([])
  const [importSuccesses, setImportSuccesses] = useState<number | null>(null)
  const [importErrors, setImportErrors] = useState<{ message: string }[]>([])
  const [exportInvestorAccountCodesData, setExportInvestorAccountCodesData] = useState<object[]>([])
  const [amlKycData, setAmlKycData] = useState<object[]>([])
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false)
  const applicantStatuses = useAppSelector(selectStatuses);
  const countries = useAppSelector(selectCountrySelector);
  const {saveAsCsv} = useJsonToCsv();

  const onDownloadApplicants = () => {
    const csvFields = {} as any;
    headers(fund).forEach((header) => csvFields[header] = header)
    const filename = `applicants-${fund.slug}`
    const handleClick = async () => {
      setFetchingData(true)
      if (!exportData?.length) {
        const response = await applicationsAPI.getApplicationsExportList(fund.external_id)
        const data = formatDownloadableData(response, applicantStatuses, fund)
        setExportData(data)
        saveAsCsv({data, fields: csvFields, filename})
      } else {
        saveAsCsv({data: exportData, fields: csvFields, filename})
      }
      setFetchingData(false)
    }
    handleClick()
  }

  const onDownloadAmlKyc = () => {
    const handleDownload = async () => {
      const filename = `aml_kyc-${fund.slug}`;
      if(!amlKycData.length){
        const data = await applicationsAPI.getApplicationAmlKycData(fund.external_id)
        const report = new AmlKYCReport(data, countries, filename);
        report.downloadAmlKycReport();
        setAmlKycData(data)
      }
      else {
        const report = new AmlKYCReport(amlKycData, countries, filename);
        report.downloadAmlKycReport();
      }
    }
    handleDownload();
  }

  const onSubmit = async (
      values: any,
      { setSubmitting, setFieldError, setFieldValue, setValues }: any
  ) => {
    setSubmitting(true);

    const formData: any = new FormData();
    formData.append("bulk_update_file", values.bulk_update_file);
    try {
      const data = await API.uploadInvestorAccountCodesBulkUpdate(fund.external_id, formData);
      setImportSuccesses(data.successes)
      setImportErrors(data.errors)
      logMixPanelEvent(`Investor Account Code Bulk Update for ${fund.external_id}`);
      setSubmitting(false);
    } catch (e: any) {
      setSubmitting(false);
      switch (get(e.response, "status")) {
        case 400:
          each(get(e.response, "data"), (error, key) => {
            setFieldError(key, error);
          });
          break;
        case 500:
          setImportSuccesses(null);
          setImportErrors([{message: "Internal server error"}]);
          break;
      }
    }
  };

  const getInitialValues: any = () => {
    return {
      bulk_update_file: null,
    }
  }

  const handleCloseModal = () => {
    setImportSuccesses(null)
    setImportErrors([])
    setShowUploadModal(false)
  }
  return (
      <>
        <SidecarModal
            title={"Upload Investor Account Codes"}
            showModal={showUploadModal}
            handleClose={handleCloseModal}
        >
          <DocumentFormDiv>
            <Formik
                initialValues={getInitialValues()}
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
                  isValid,
                  errors
                }) => {
                return (
                    <StyledForm onSubmit={handleSubmit}>
                      <Row className='mt-3'>
                        <Col md={12}>
                          <DocumentUploadWrapper>
                            <Form.Group controlId="formFilterValue">
                              {values.bulk_update_file ? (
                                  <DocTag documentName={values.bulk_update_file?.name}
                                          handleDelete={() => setFieldValue("bulk_update_file", "")}/>
                              ) : (
                                  <DocumentDropZone onFileSelect={(file) => {
                                    setFieldValue("bulk_update_file", file)
                                  }} disabled={false}/>
                              )}
                            </Form.Group>
                          </DocumentUploadWrapper>
                          <div className='text-danger'>
                            {errors.bulk_update_file}
                          </div>
                        </Col>
                      </Row>
                      <Row style={{padding: 10}}>
                        <Col md={12}>
                          <AddNoticesButtonWrapper>
                            <Button
                                variant="primary"
                                type="submit"
                                className={'filled'}
                                disabled={!isValid || isSubmitting}
                            >
                              Submit
                            </Button>
                          </AddNoticesButtonWrapper>
                        </Col>
                      </Row>
                      <Row>
                        {importSuccesses!=null &&
                            <Col>
                              <Alert variant="success">
                                Successes: {importSuccesses}
                              </Alert>
                            </Col>
                        }
                        {importErrors && importErrors.length > 0 &&
                            <Col>
                              {importErrors.map((value, index, array) => {
                                return <p className="text-danger">{value.message}</p>
                              })}
                            </Col>
                        }
                      </Row>
                    </StyledForm>
                )
              }}
            </Formik>
          </DocumentFormDiv>
        </SidecarModal>
        <Dropdown>
          <Dropdown.Toggle
              variant="outline-primary"
              disabled={fetchingData}
          >
            Export
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
                onClick={onDownloadApplicants}
            >
              Export Applicants
            </Dropdown.Item>
            <Dropdown.Item
                onClick={onDownloadAmlKyc}
            >
              Export AML/KYC report
            </Dropdown.Item>
            <Dropdown.Item
                onClick={onDownloadApplicants}
            >
              Export Investor Account Codes
            </Dropdown.Item>
            <Dropdown.Item
                onClick={() => {
                  setShowUploadModal(true)
                }}
            >
              Import Investor Account Codes
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </>
  );
};

export default UploadInvestorAccountCodes;
