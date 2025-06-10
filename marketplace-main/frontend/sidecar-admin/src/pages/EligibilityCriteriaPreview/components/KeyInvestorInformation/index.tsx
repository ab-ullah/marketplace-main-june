import React, {FunctionComponent} from 'react';

import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import Button from "react-bootstrap/Button";
import {Form} from "react-bootstrap";
import {setAnswer, setLogicFlowValues, setSelectedOption} from "../../eligibilityCriteriaPreviewSlice";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectAnswers, selectFundCriteriaPreview} from "../../selectors";
import FilePreviewModal from "../../../../components/FilePreviewModal";


interface KeyInvestorInformationProps {
  criteriaBlock: ICriteriaBlock;
  nextFunction: () => void;
}

interface CriteriaBlockDocument {
  document_name: string;
  document_id: string;
  doc_id: number;
}


const KeyInvestorInformation: FunctionComponent<KeyInvestorInformationProps> = ({criteriaBlock, nextFunction}) => {
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const answers = useAppSelector(selectAnswers)
  const blockKey = criteriaBlock.block.block_id;
  const answerKey = `${blockKey}-${criteriaBlock.id}`

  const dispatch = useAppDispatch()

  const updateAgreeKiid = (value: any) => {
    const selectedOption = criteriaBlock.block.options?.individual.find((option: any) => option.text === value)
    const payload = {[answerKey]: value}
    dispatch(setLogicFlowValues({[criteriaBlock.id]: true}))
    dispatch(setAnswer(payload))
    dispatch(setSelectedOption({[criteriaBlock.id]: selectedOption}))
  }

  const getDocumentDownloadKey = (document: CriteriaBlockDocument) => `${blockKey}_DOWNLOADED_${document.doc_id}`

  const callbackPreviewFile = async (document: CriteriaBlockDocument) => {
    const documentDownloadedKey = getDocumentDownloadKey(document)
    const payload = {[documentDownloadedKey]: true}
    dispatch(setAnswer(payload))
  }

  const allDocumentsChecked = () => {
    return criteriaBlock.criteria_block_documents.map(document => Boolean(answers[getDocumentDownloadKey(document)])).every(Boolean)
  }


  return <div>
    <h4 className="mt-5 mb-4">I have read the related Key Investment Information Document</h4>
    {!allDocumentsChecked() && <p className="note-text">* Please download the documents to enable the checkbox</p>}
    <div>
      <ul className={'p-0'}>
        {criteriaBlock.criteria_block_documents.map((document) => (
          <li>
            <FilePreviewModal 
              documentId={document?.document_id}
              documentName={document?.document_name}
              callbackPreviewFile={() => callbackPreviewFile(document)}
              callbackDownloadFile={() => callbackPreviewFile(document)}
            />
          </li>
        ))}
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
        checked={answers[answerKey]}
        disabled={!allDocumentsChecked()}
        id={`kiid-agree`}
      />
    </div>
    <Button onClick={nextFunction} disabled={!answers[answerKey]} className={'mt-4'}>Next</Button>
  </div>
};

export default KeyInvestorInformation;
