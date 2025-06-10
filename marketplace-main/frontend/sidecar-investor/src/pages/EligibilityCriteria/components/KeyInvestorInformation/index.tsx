import {FunctionComponent} from 'react';
import API from "../../../../api"
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import Button from "react-bootstrap/Button";
import {Form} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectDownloadedDocuments, selectFundCriteriaPreview, selectFundCriteriaResponse, selectIsLoading} from "../../selectors";
import {setDownloadedDocument, updateResponseBlock, setIsLoading} from "../../eligibilityCriteriaSlice";
import eligibilityCriteriaAPI from "../../../../api/eligibilityCriteria";
import {getCriteriaBlockAnswer} from "../../utils/getCriteriaBlockAnswer";
import { ButtonWrapper } from '../styles';
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { ThemeButton } from '../../../../components/Button/styles';


interface KeyInvestorInformationProps {
  criteriaBlock: ICriteriaBlock;
  nextFunction: () => void;
  backFunction: () => void;
}

interface CriteriaBlockDocument {
  document_name: string;
  document_id: string;
  doc_id: number;
}


const KeyInvestorInformation: FunctionComponent<KeyInvestorInformationProps> = ({criteriaBlock, nextFunction, backFunction}) => {
  const dispatch = useAppDispatch()
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const downloadedDocuments = useAppSelector(selectDownloadedDocuments)
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)
  const isLoading = useAppSelector(selectIsLoading)

  if (!fundCriteriaResponse) return <></>

  const selectedAnswer = getCriteriaBlockAnswer(criteriaBlock, fundCriteriaResponse)
  const blockKey = criteriaBlock.block.block_id;

  if (!fundCriteriaPreview) return <></>
  const answerValue = selectedAnswer ? selectedAnswer.response_json.value : null;

  const updateAgreeKiid = async (value: any) => {
    const responseJson = {
      value: value
    }
    const payload = {
      block_id: criteriaBlock.id,
      response_json: responseJson,
      eligibility_criteria_id: fundCriteriaPreview.id
    }
    dispatch(setIsLoading(true));
    const responseData = await eligibilityCriteriaAPI.createUpdateResponseBlock(payload)
    dispatch(updateResponseBlock(responseData))
    dispatch(setIsLoading(false));
  }

  const getDocumentDownloadKey = (document: CriteriaBlockDocument) => `${blockKey}_DOWNLOADED_${document.doc_id}`


  const downloadDocument = async (document: CriteriaBlockDocument) => {
    await API.downloadDocument(document.document_id, document.document_name)
    const documentDownloadedKey = getDocumentDownloadKey(document)
    const payload = {[documentDownloadedKey]: true}
    dispatch(setDownloadedDocument(payload))
  }

  const allDocumentsChecked = () => {
    return criteriaBlock.criteria_block_documents.map(document => Boolean(downloadedDocuments[getDocumentDownloadKey(document)])).every(Boolean)
  }


  return <div>
    <h4 className="mt-5 mb-4">I have read the related Key Investment Information Document</h4>
    {!allDocumentsChecked() && <p className="note-text">* Please download the documents to enable the checkbox</p>}
    <div>
      <ul className={'p-0'}>
        {criteriaBlock.criteria_block_documents.map((document) => <li key={`${criteriaBlock.id}-${document.doc_id}`}>
          <ThemeButton className={'document-container mt-2'}
                  onClick={() => downloadDocument(document)}>{document.document_name}</ThemeButton>
        </li>)}
      </ul>
    </div>
    <p className="text-muted">By clicking below I certify that I have reviewed the KIID
      for {fundCriteriaPreview?.name}</p>

    <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
      <Form.Check
        type={"radio"}
        inline
        label={'I agree'}
        onChange={() => updateAgreeKiid(true)}
        checked={answerValue}
        disabled={!allDocumentsChecked()}
        id={`kiid-agree`}
      />
    </div>
    <ButtonWrapper className='mt-4'>
      <BackButton onClick={backFunction} >
        <ArrowBack /> Previous Step
      </BackButton>
      <NextButton onClick={nextFunction} disabled={!answerValue || isLoading}>
        Next Step <ArrowForward />
      </NextButton>
    </ButtonWrapper>
  </div>
};

export default KeyInvestorInformation;
