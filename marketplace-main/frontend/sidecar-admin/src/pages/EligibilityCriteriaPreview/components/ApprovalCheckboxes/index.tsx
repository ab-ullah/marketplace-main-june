import {FunctionComponent} from 'react';

import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import Button from "react-bootstrap/Button";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectAnswers} from "../../selectors";
import FilePreviewModal from "../../../../components/FilePreviewModal";
import ApprovalDropdown from "../../../../components/FilePreviewModal/ApprovalDropdown";
import {setAnswer, setLogicFlowValues} from "../../eligibilityCriteriaPreviewSlice";
import {AgreeDocumentBlock} from "../../styles";


interface ApprovalCheckboxesProps {
  criteriaBlock: ICriteriaBlock;
  nextFunction: () => void;
}

interface CriteriaBlockDocument {
  document_name: string;
  document_id: string;
  doc_id: number;
}


const ApprovalCheckboxes: FunctionComponent<ApprovalCheckboxesProps> = ({criteriaBlock, nextFunction}) => {
  const answers = useAppSelector(selectAnswers)

  const dispatch = useAppDispatch()
  const blockKey = criteriaBlock.block.block_id;

  const getDocumentKey = (document: CriteriaBlockDocument) => `${blockKey}_${document.doc_id}`

  const getDocumentDownloadKey = (document: CriteriaBlockDocument) => `${blockKey}_DOWNLOADED_${document.doc_id}`


  const updateLogicalValue = (updatedDocumentKey: string, value: boolean) => {
    let logicalValue = true;
    criteriaBlock.criteria_block_documents.forEach(document => {
      const documentKey = getDocumentKey(document)
      const docValue = documentKey === updatedDocumentKey ? value : !!answers[documentKey]
      logicalValue = logicalValue && docValue
    })
    dispatch(setLogicFlowValues({[criteriaBlock.id]: logicalValue}))
  }

  const updateApproval = (document: CriteriaBlockDocument) => {
    console.log({updateApproval});
    const documentKey = getDocumentKey(document)
    const currentValue = answers[documentKey]
    const updatedValue = !currentValue
    const payload = {[documentKey]: !currentValue}
    dispatch(setAnswer(payload))
    updateLogicalValue(documentKey, updatedValue)
  }

  const callbackPreviewFile = async (document: CriteriaBlockDocument) => {
    const documentDownloadedKey = getDocumentDownloadKey(document)
    const payload = {[documentDownloadedKey]: true}
    dispatch(setAnswer(payload))
  }

  const allDocumentsChecked = () => {
    return criteriaBlock.criteria_block_documents.map(document => Boolean(answers[getDocumentKey(document)])).every(Boolean)
  }

  const allDocumentsDownloaded = () => {
    return criteriaBlock.criteria_block_documents.map(document => Boolean(answers[getDocumentDownloadKey(document)])).every(Boolean)
  }

  const handleNextButton = () => {
    dispatch(setLogicFlowValues({[criteriaBlock.id]: true}))
    nextFunction()
  }

  return <>
    <h4 className="mt-5 mb-4 ms-3">I have reviewed and agree with the following documents:</h4>
    <div>
      {!allDocumentsDownloaded() &&
        <p className="note-text ms-3">* Please download the documents to enable the checkboxes</p>}
    </div>
    <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
      <ul>
        {criteriaBlock.criteria_block_documents.map((document) => <li className={'mt-2'}>
          <AgreeDocumentBlock>
            <FilePreviewModal 
              documentId={`${document.document_id}`} 
              documentName={document.document_name}
              callbackPreviewFile={() => callbackPreviewFile(document)}
              callbackDownloadFile={() => callbackPreviewFile(document)}
            >
              <ApprovalDropdown 
                document={document}
                disabled={!answers[getDocumentDownloadKey(document)]}
                value={answers[getDocumentKey(document)]}
                onChange={() => updateApproval(document)}
              />
            </FilePreviewModal>
          </AgreeDocumentBlock>
        </li>)}
      </ul>
    </div>
    <Button onClick={handleNextButton} disabled={!allDocumentsChecked()} className={'mt-4'}>Next</Button>
  </>
};

export default ApprovalCheckboxes;
