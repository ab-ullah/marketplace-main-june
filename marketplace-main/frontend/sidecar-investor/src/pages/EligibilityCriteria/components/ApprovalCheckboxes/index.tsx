import { FunctionComponent } from 'react';
import { ICriteriaBlock } from "../../../../interfaces/EligibilityCriteria/criteria";
import Button from "react-bootstrap/Button";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectDownloadedDocuments, selectFundCriteriaPreview, selectFundCriteriaResponse, selectIsLoading } from "../../selectors";
import { setDownloadedDocument, updateResponseBlock, setIsLoading } from "../../eligibilityCriteriaSlice";
import { getCriteriaBlockAnswer } from "../../utils/getCriteriaBlockAnswer";
import eligibilityCriteriaAPI from "../../../../api/eligibilityCriteria";
import FilePreviewModal from "../../../../components/FilePreviewModal";
import ApprovalDropdown from "../../../../components/FilePreviewModal/ApprovalDropdown";
import { ButtonWrapper } from '../styles';
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, ArrowForward } from '@material-ui/icons';


interface ApprovalCheckboxesProps {
  criteriaBlock: ICriteriaBlock;
  nextFunction: () => void;
  backFunction: () => void;
}

interface CriteriaBlockDocument {
  document_name: string;
  document_id: string;
  doc_id: number;
}


const ApprovalCheckboxes: FunctionComponent<ApprovalCheckboxesProps> = ({ criteriaBlock, nextFunction, backFunction }) => {
  const dispatch = useAppDispatch()
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const downloadedDocuments = useAppSelector(selectDownloadedDocuments)
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)
  const isLoading = useAppSelector(selectIsLoading)

  if (!fundCriteriaPreview) return <></>
  if (!fundCriteriaResponse) return <></>

  const blockKey = criteriaBlock.block.block_id;
  const selectedAnswer = getCriteriaBlockAnswer(criteriaBlock, fundCriteriaResponse)
  const answerPayload = selectedAnswer ? selectedAnswer.response_json : {};

  const getDocumentKey = (document: CriteriaBlockDocument) => `${blockKey}_${document.doc_id}`

  const getDocumentDownloadKey = (document: CriteriaBlockDocument) => `${blockKey}_DOWNLOADED_${document.doc_id}`

  const updateApproval = async (document: CriteriaBlockDocument) => {
    const documentKey = getDocumentKey(document)
    const currentValue = answerPayload[documentKey]
    const payload = {
      block_id: criteriaBlock.id,
      response_json: { ...answerPayload, [documentKey]: !currentValue },
      eligibility_criteria_id: fundCriteriaPreview.id
    }
    dispatch(setIsLoading(true));
    const responseData = await eligibilityCriteriaAPI.createUpdateResponseBlock(payload)
    dispatch(updateResponseBlock(responseData))
    dispatch(setIsLoading(false));
  }


  const downloadDocument = async (document: CriteriaBlockDocument) => {
    const documentDownloadedKey = getDocumentDownloadKey(document)
    const payload = { [documentDownloadedKey]: true }
    dispatch(setDownloadedDocument(payload))
  }

  const allDocumentsChecked = () => {
    return criteriaBlock.criteria_block_documents.map(document => Boolean(answerPayload[getDocumentKey(document)])).every(Boolean)
  }

  const allDocumentsDownloaded = () => {
    return criteriaBlock.criteria_block_documents.map(document => Boolean(downloadedDocuments[getDocumentDownloadKey(document)])).every(Boolean)
  }

  const handleNextButton = () => {
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
        {criteriaBlock.criteria_block_documents.map((document) => <li
          className={'mt-2'}
          key={`${criteriaBlock.id}-${document.doc_id}`}
        >
          <FilePreviewModal
            documentId={`${document.document_id}`}
            documentName={document.document_name}
            callbackPreviewFile={() => {}}
            callbackDownloadFile={() => downloadDocument(document)}
          >
            <ApprovalDropdown document={document}
              disabled={!downloadedDocuments[getDocumentDownloadKey(document)]}
              value={answerPayload[getDocumentKey(document)]}
              onChange={() => updateApproval(document)}
            />
          </FilePreviewModal>
        </li>)}
      </ul>
    </div>
    <ButtonWrapper>
      <BackButton onClick={backFunction} >
        <ArrowBack /> Previous Step
      </BackButton>
      <NextButton onClick={handleNextButton} disabled={!allDocumentsChecked() || isLoading}>
        Next Step <ArrowForward />
      </NextButton>
    </ButtonWrapper>
  </>
};

export default ApprovalCheckboxes;
