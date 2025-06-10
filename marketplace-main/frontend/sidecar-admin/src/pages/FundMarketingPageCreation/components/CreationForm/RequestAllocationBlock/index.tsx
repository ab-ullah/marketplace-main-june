import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import classNames from "classnames";
import RequestAllocationIcon from "../../../../../assets/images/fundMarketingPage/request-allocation.svg"
import DatePickerComponent from "../../../../../components/DatePicker";
import FundMarketingPageAPI from "../../../../../api/fundMarketingPageAPI/marketing_page_api"
import styled from "styled-components";
import APISyncCurrencyField from "../../../../../components/AutoSyncedInputs/CurrencyInput";
import DocumentDropZone from "../../../../../components/FileUpload";
import {fetchFundPageDetail} from "../../../thunks";
import {useAppDispatch} from "../../../../../app/hooks";
import API from "../../../../../api";
import DocumentIcon from "../../../../../components/DocumentIcon";

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: row;

  .datepicker {
    width: 45%;
    margin-right: 2%;
  }

  input {
    background: #FFFFFF;
    border: 1px solid #D5CBCB;
    box-sizing: border-box;
    border-radius: 8px;
    min-width: 100%;
    padding: 15px;
    font-family: Quicksand;
    font-weight: normal;
    font-size: 16px !important;
  }
`


interface RequestAllocationBlockProps {
  marketingPageDetail: IFundMarketingPageDetail;
}


const RequestAllocationBlock: FunctionComponent<RequestAllocationBlockProps> = ({marketingPageDetail}) => {
  const requestAllocation = marketingPageDetail.request_allocation_criteria[0];
  const dispatch = useAppDispatch()

  const onChange = async (name: string, value: string) => {
    const payload = {[name]: value}
    await FundMarketingPageAPI.updateRequestAllocation(
      marketingPageDetail.id,
      requestAllocation.id,
      payload
    )
  }

  const onDocumentUpload = async (allocationId: number, fileData: any) => {
    const formData = new FormData();
    formData.append('file_data', fileData);
    formData.append('allocation_criteria_id', allocationId.toString());
    await FundMarketingPageAPI.createAllocationDocument(
      marketingPageDetail.id,
      allocationId,
      formData
    )
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  const onDeleteDocument = async (docId: number) => {
    await API.deleteDocument(docId)
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  return (
    <div className="create-form-card">
      <span className={classNames("block-tag", {'blue-background': true})}>5
        <img src={RequestAllocationIcon} alt="World icon" width={20} height={20}/>
        <span>Request allocation</span>
      </span>
      <h4>Dates</h4>
      <DatePickerContainer>
        <div className='datepicker'><DatePickerComponent onChange={(value) => onChange('start_date', value)}
                                                         startDate={requestAllocation.start_date}/></div>
        <div className='datepicker'><DatePickerComponent onChange={(value) => onChange('end_date', value)}
                                                         startDate={requestAllocation.end_date}/></div>
      </DatePickerContainer>
      <h4 className={'mt-5'}>Minimum Equity Investment Amount ($)</h4>
      <APISyncCurrencyField
        name={'investment_amount'}
        placeholder="Enter minimum equity investment amount"
        onChange={(value: string) => onChange('investment_amount', value)}
        value={requestAllocation.investment_amount}
        isNumber={true}
      />
      <h4 className={'mt-5'}>Eligibility Criteria</h4>
      <p className={'text-muted'}>Please upload your eligibility criteria as a word or pdf file</p>
      {requestAllocation.allocation_documents.map(doc => <DocumentIcon
        documentInfo={doc}
        onDelete={() => onDeleteDocument(doc.doc_id)}
      />)}
      {requestAllocation.allocation_documents && requestAllocation.allocation_documents.length === 0 &&
        <DocumentDropZone
          onFileSelect={(file: any) => onDocumentUpload(requestAllocation.id, file)}
        />}
    </div>
  )
};

export default RequestAllocationBlock;
