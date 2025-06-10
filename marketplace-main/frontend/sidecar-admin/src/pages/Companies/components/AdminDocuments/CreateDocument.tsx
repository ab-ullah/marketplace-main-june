import React, { FC, useMemo, useState } from 'react';
import { Button, Col, Form, Modal, ModalBody, Row } from 'react-bootstrap';
import { DocumentFormDiv, DocumentUploadWrapper } from '../../../../components/CompanyInfo/styles';
import { ErrorMessage, Formik } from 'formik';
import { v4 as uuidv4 } from "uuid";
import { StyledForm, StyledSwitch } from '../../../../presentational/forms';
import API from '../../../../api/backendApi';
import RadioField from '../../../../components/Form/RadioField';
import { FormSelectorFieldRow } from '../../../../components/Form/SelectorField';
import { useGetFundsQuery } from '../../../../api/rtkQuery/fundsApi';
import { IFund } from '../../../Funds/interfaces';
import { useGetInvestorsQuery } from '../../../../api/rtkQuery/usersApi';
import { FormTextFieldRow } from '../../../../components/Form/TextField';
import DatePickerComponent from '../../../../components/DatePicker';
import { DatePickerContainer } from '../../../FundSetup/components/CapitalDistributionComps/ListPage/components/CreateModal/styles';
import { Label } from '../../../../components/Form/styles';
import { get, each, orderBy } from 'lodash';
import DocTag from '../../../../components/FilePreviewModal/DocTag';
import DocumentDropZone from '../../../../components/FileUpload';
import { UserActionDiv } from '../../../Users/styles';
import { CAPITAL_CALL, DOCUMENT_TYPES } from './constants';
import styled from 'styled-components';
import { UPDATE_VALIDATION_SCHEMA, VALIDATION_SCHEMA } from './config';
import FilePreviewModal from '../../../../components/FilePreviewModal';


interface IOption {
  value: string,
  label: string
}

interface IFormData {
  document_for: IOption | null,
  selected_fund: IOption | null,
  selected_investor: IOption | null,
  document_name: string;
  document_date: string;
  skip_notification: boolean;
  document_file: File | null;
  document_type: IOption | null;
  due_date: string;
}

const initialValues: IFormData = {
  document_for: null,
  selected_fund: null,
  selected_investor: null,
  document_name: '',
  document_date: '',
  skip_notification: true,
  document_file: null,
  document_type: null,
  due_date: ''
}

interface ICreateDocumentProps {
  data: any;
  showModal: boolean;
  toggleModal: () => void;
  onCreateOrUpdateDocumentCallback: () => void
}

const StyledButton = styled(Button)`
  float: right;
  margin-bottom: 10px;
`

const CreateDocument: FC<ICreateDocumentProps> = ({
  data,
  showModal,
  toggleModal,
  onCreateOrUpdateDocumentCallback,
}) => {
    const [formError, setFormError] = useState<string | null>(null);
    const {
      data: fundsList,
    } = useGetFundsQuery({
      skip: false,
    });

    const {
      data: investorsList,
    } = useGetInvestorsQuery();

    const fund_options = useMemo(() => {
      const options: any[]= [];
      const orderedFundList = orderBy(fundsList, (fund: any) => fund.name, 'asc');
      orderedFundList?.forEach((fund: IFund) => {
        options.push({
          value: fund.external_id,
          label: fund.name
        })
      })
      return options;
    }, [fundsList])

    const investor_options = useMemo(() => {
      const options: any[]= [];
      const orderInvestorsList = orderBy(investorsList, (investor: any) => investor.name, 'asc');
      orderInvestorsList?.forEach((investor: any) => {
        options.push({
          value: investor.partner_id,
          label: `${investor.name} - ${investor.investor_account_code}`
        })
      })
      return options;
    }, [investorsList])

    const getDocumentOption = () => {
      const option = DOCUMENT_TYPES.find(type => type.label === data.document_type);
      if(option) return option
      if(data.document_type === CAPITAL_CALL) return DOCUMENT_TYPES[0];
      return null;
    }

    const getSelectedFund = () => {
      if(data.fund){
        return {label: get(data, 'fund.name', ''), value: get(data, 'fund.external_id', '')}
      }
      else if(data.investor_fund){
        return {label: get(data, 'investor_fund.name', ''), value: get(data, 'investor_fund.external_id', '')}
      }
      else {
        return null
      }
    }

    const getInitialValues = () => {
      if(!data) return initialValues;
      return {
        document_for: data.fund ? { value: 'document_for_fund', label: 'Fund' } : { value: 'document_for_investor', label: 'Investor'},
        selected_fund: getSelectedFund(),
        selected_investor: {label: get(data, 'investor.name', ''), value: get(data, 'investor.partner_id', '')},
        document_name: data.title,
        document_date: data.file_date,
        skip_notification: true,
        document_file: null,
        document_type: getDocumentOption(),
        due_date: get(data, 'due_date', '')
      }
    }

    const onCreateDocument = async (values: IFormData, { setFieldError }: any) => {
      setFieldError(null);
      const formData = new FormData();
      formData.append("file_content_type", get(values, 'document_file.type', ''));
      formData.append("file_date", values.document_date);
      formData.append("file_name", values.document_name);
      formData.append("skip_notification", `${values.skip_notification}`);
      formData.append('id', uuidv4().split("-").join(""));
      formData.append('is_admin_upload', 'true');
      if(values.document_file) formData.append("file_data", values.document_file);
      if(values.selected_fund) formData.append('fund_external_id', values.selected_fund?.value);
      if(values.document_type) formData.append("file_type", values.document_type.value);
      if(values.selected_investor) formData.append("investor_vehicle_id", values.selected_investor.value);
      if(values.due_date) formData.append("due_date", values.due_date);

      try{
        if(values.document_for?.value === 'document_for_fund'){
          await API.createFundDocument(formData);
          onCreateOrUpdateDocumentCallback();
        }
        else {
          await API.createInvestorDocument(formData)
          onCreateOrUpdateDocumentCallback();
        }
       }
       catch(e){
        if(get(e.response, "status") === 400){
          each(get(e.response, "data"), (error: any, key: any) => {
            setFieldError(key, error);
          })
        }
        else {
          setFormError('Unable to upload the document');
        }
       }
    }

    const onUpdateDocument = async (values: any, { setFieldError }: any) => {
      const formData = new FormData();
      formData.append("file_date", values.document_date);
      formData.append("title", values.document_name);
      formData.append("document_type", values.document_type.value);
      if(values.document_file){
        formData.append("file_data", values.document_file);
        formData.append("file_content_type", get(values, 'document_file.type', ''));
      }
      if(values.due_date) formData.append("due_date", values.due_date);

      try{
        await API.updateInvestorDocument(data.document_id, formData)
        onCreateOrUpdateDocumentCallback();
      }
      catch(e){
        if(get(e.response, "status") === 400){
          each(get(e.response, "data"), (error: any, key: any) => {
            setFieldError(key, error);
          })
        }
        else {
          setFormError('Unable to upload the document');
        }
      }
    }

    return <>
    <StyledButton variant='primary' onClick={toggleModal}>Create Document</StyledButton>
    <Modal show={showModal} onHide={toggleModal} size="lg">
      <Modal.Header>
        <Modal.Title>{data ? 'Update' : 'Create'} Document</Modal.Title>
      </Modal.Header>
      <ModalBody>
        <DocumentFormDiv>
          <Formik
            initialValues={getInitialValues()}
            validationSchema={data ? UPDATE_VALIDATION_SCHEMA : VALIDATION_SCHEMA}
            onSubmit={data ? onUpdateDocument : onCreateDocument}
          >
            {({
                values,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                isSubmitting,
                errors
              }) => (
              <StyledForm onSubmit={handleSubmit}>
                <Row>
                 <RadioField
                     label="Select who the document is for"
                     name="document_for"
                     onChange={(value: any) => setFieldValue("document_for", value)}
                     options={[{
                      value: 'document_for_fund',
                      label: 'Fund'
                     },
                     {
                      value: 'document_for_investor',
                      label: 'Investor'
                     }
                    ]}
                     value={values.document_for}
                     disabled={!!data}
                 />
                 
                </Row>
                {
                  values.document_for?.value && <FormSelectorFieldRow 
                  label="Select Fund"
                  name="selected_fund"
                  placeholder="Select Fund"
                  onChange={(value: any) => setFieldValue("selected_fund", value)}
                  onBlur={handleBlur}
                  value={values.selected_fund}
                  options={fund_options}
                  isDisabled={!!data}
                  />
                }
                 {
                  values.document_for?.value === 'document_for_investor' && <FormSelectorFieldRow 
                  label="Select Investor"
                  name="selected_investor"
                  placeholder="Select Investor"
                  onChange={(value: any) => setFieldValue("selected_investor", value)}
                  onBlur={handleBlur}
                  value={values.selected_investor}
                  options={investor_options}
                  isDisabled={!!data}
                  />
                }
                {(values.selected_fund || values.selected_investor) && <>
                  <Row>
                <FormSelectorFieldRow 
                  label="Select Document Type"
                  name="document_type"
                  placeholder="Select Document Type"
                  onChange={(value: any) => setFieldValue("document_type", value)}
                  onBlur={handleBlur}
                  value={values.document_type}
                  options={orderBy(DOCUMENT_TYPES, (type: IOption) => type.label, 'asc')}
                  />
                </Row>
                <Row>
                <FormTextFieldRow
                label="Document Name"
                name="document_name"
                placeholder="Document Name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.document_name} />
                </Row>
                <Row>
                  <Label>Document Date</Label>
                  <DatePickerContainer>
                    <DatePickerComponent
                      placeholder='Select Date'
                      value={data ? new Date(values.document_date) : null}
                      onChange={(value) => setFieldValue('document_date', value)}
                    />
                  </DatePickerContainer>
                  <ErrorMessage className="text-danger" name="document_date" component="div"/>
                </Row>
                {['capital-call', 'capital-calls'].includes(get(values, 'document_type.value')) && <Row>
                  <Label>Due Date</Label>
                  <DatePickerContainer>
                    <DatePickerComponent
                      placeholder='Select Due Date'
                      value={data ? new Date(values.due_date) : null}
                      onChange={(value) => setFieldValue('due_date', value)}
                    />
                  </DatePickerContainer>
                  <ErrorMessage className="text-danger" name="due_date" component="div"/>
                </Row>}
                {!data && <Row>
                  <StyledSwitch
                    id="skip_notification"
                    className="m-2"
                    label="Skip Notification"
                    type="switch"
                    onChange={(e: any) => setFieldValue('skip_notification', get(e, 'target.checked'))}
                    onBlur={handleBlur}
                    value={values.skip_notification}
                    checked={values.skip_notification}
                />
                 <ErrorMessage className="text-danger" name="skip_notification" component="div"/>
                </Row>}
                <Row className='mt-2'>
                <DocumentUploadWrapper>
                <Form.Group controlId="formFilterValue">
                    {values.document_file ? (
                      <DocTag documentName={values.document_file?.name}
                              handleDelete={() => setFieldValue("document_file", "")}/>
                    ) : (
                      <DocumentDropZone onFileSelect={(file) => {
                        setFieldValue("document_file", file)
                      }} disabled={false}/>
                    )}
                  </Form.Group>
                </DocumentUploadWrapper>
                <ErrorMessage className="text-danger" name="document_file" component="div"/>
                </Row>
                {data && <Row className='mt-2'>
                  <FilePreviewModal
                    documentId={data.document_id}
                    documentName={data.title.replace(/\./g, '_')}
                  />
                  </Row>}
                {
                  get(errors, 'non_field_errors') && <Row>
                    {
                      get(errors, 'non_field_errors', []).map((error: any) => (
                        <div className="text-danger">{error}</div>
                      ))
                    }
                  </Row>
                }
                {
                  formError && <Row>
                    <div className="text-danger">{formError}</div>
                  </Row>
                }
                </>}
                <UserActionDiv>
                  <Button
                    variant="primary"
                    type="submit"
                    className={'filled'}
                    disabled={isSubmitting}>
                    {data ? "Update" : "Save"}
                  </Button>
                  <Button
                    variant="outline-primary"
                    type="button"
                    onClick={toggleModal}
                  >
                    Cancel
                  </Button>
                </UserActionDiv>
              </StyledForm>
            )}
          </Formik>
        </DocumentFormDiv>
      </ModalBody>
    </Modal>
    </>
}

export default CreateDocument;