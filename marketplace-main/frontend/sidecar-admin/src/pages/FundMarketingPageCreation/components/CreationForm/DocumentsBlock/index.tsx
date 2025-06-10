import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import FundMarketingPageAPI from '../../../../../api/fundMarketingPageAPI/marketing_page_api';
import API from '../../../../../api';
import classNames from "classnames";
import documentIcon from "../../../../../assets/images/fundMarketingPage/documents.svg"
import DocumentDropZone from "../../../../../components/FileUpload";
import {useAppDispatch} from "../../../../../app/hooks";
import {fetchFundPageDetail} from "../../../thunks";
import DocumentIcon from "../../../../../components/DocumentIcon";

interface MainBlockProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const DocumentsBlock: FunctionComponent<MainBlockProps> = ({marketingPageDetail}) => {
  const dispatch = useAppDispatch()

  const onDocumentUpload = async (fileData: any) => {
    const formData = new FormData();
    formData.append('file_data', fileData);
    formData.append('marketing_page_id', marketingPageDetail.id.toString());
    await FundMarketingPageAPI.createDocument(
      marketingPageDetail.id,
      formData
    )
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  const onDeleteDocument = async (docId: number) => {
    await API.deleteDocument(docId)
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }


  return <div className="create-form-card">
    <span className={classNames("block-tag", {'blue-background': true})}>
        {4}
      <img src={documentIcon} alt="World icon" width={20} height={20}/>
        <span>Documents</span>
      </span>
    <h4>Upload Documents</h4>
    <div>
      {marketingPageDetail.fund_page_documents.map((doc) => <DocumentIcon
          documentInfo={doc}
          onDelete={() => onDeleteDocument(doc.doc_id)}
        />
      )}
    </div>
    <DocumentDropZone
      onFileSelect={(file: any) => onDocumentUpload(file)}
    />
  </div>


};

export default DocumentsBlock;
