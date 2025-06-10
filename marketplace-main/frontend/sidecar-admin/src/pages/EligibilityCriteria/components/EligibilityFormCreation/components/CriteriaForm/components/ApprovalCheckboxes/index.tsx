import {FunctionComponent, useEffect, useState} from 'react';
import { eligibilityConfig } from "../../../../utils/EligibilityContext";
import {ICriteriaBlock} from "../../../../../../../../interfaces/EligibilityCriteria/criteria";
import DocumentDropZone from "../../../../../../../../components/FileUpload";
import API from "../../../../../../../../api"
import MissingInfo from "../MissingInfo";
import {useAppDispatch} from "../../../../../../../../app/hooks";
import {updateAdminFilledStatus} from "../../../../utils/updateAdminFilledStatus";
import FilePreviewModal from "../../../../../../../../components/FilePreviewModal";
import {DocumentList} from "../styles";

interface ApprovalCheckboxesProps {
  criteriaBlock: ICriteriaBlock;
  allowEdit?: boolean;
}

interface CriteriaBlockDocument {
  document_name: string;
  document_id: string;
  doc_id: number;
}


const ApprovalCheckboxes: FunctionComponent<ApprovalCheckboxesProps> = ({criteriaBlock, allowEdit}) => {
  const [documents, setDocuments] = useState<CriteriaBlockDocument[]>(criteriaBlock.criteria_block_documents)
  const dispatch = useAppDispatch()

  const fetchDocuments = async () => {
    const documentData = await API.getCriteriaBlockDocuments(criteriaBlock.id)
    setDocuments(documentData);
  }

  useEffect(() => {
    updateAdminFilledStatus(criteriaBlock, false, dispatch)
    fetchDocuments()
  }, [])

  useEffect(() => {
    updateAdminFilledStatus(criteriaBlock, documents.length > 0, dispatch)
  }, [criteriaBlock, dispatch, documents])


  
  useEffect(() => {
    fetchDocuments();
  }, [criteriaBlock.criteria_block_documents])
  
  const uploadFile = async (fileData: any) => {
    const formData = new FormData();
    formData.append('file_data', fileData);
    formData.append('criteria_id', criteriaBlock.id.toString());
    await API.createCriteriaBlockDocument(criteriaBlock.id, formData)
    await fetchDocuments()
  }

  const deleteDocument = async (docId: number) => {
    await API.deleteDocument(docId)
    await fetchDocuments()
  }

  const hasDocuments = documents.length > 0;

  return <div>
    {!hasDocuments && <MissingInfo/>}
    <h4>{criteriaBlock.block.title}</h4>
    <DocumentDropZone onFileSelect={uploadFile} disabled={!allowEdit} />
    <div className="mt-4">
      <ul>
        {documents.map(({doc_id, document_name, document_id}) => (
          <DocumentList key={`approval-${doc_id}`} >
            <FilePreviewModal 
              documentId={document_id} 
              documentName={document_name} 
              handleDelete={allowEdit ? () => deleteDocument(doc_id) : undefined}
            />
          </DocumentList>
        ))}
      </ul>
    </div>
  </div>
};

ApprovalCheckboxes.defaultProps = {
  allowEdit: true  
}

export default eligibilityConfig(ApprovalCheckboxes);
