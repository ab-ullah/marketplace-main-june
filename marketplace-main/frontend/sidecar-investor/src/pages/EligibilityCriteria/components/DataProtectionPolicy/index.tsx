import React, {FunctionComponent, useState} from 'react';

import {Button, Form} from 'react-bootstrap';
import { useAppDispatch } from '../../../../app/hooks';
import { AgreeDocumentBlock } from '../../styles';
import API from "../../../../api";
import ELigibilityCriteriaApi from '../../../../api/eligibilityCriteria'
import { useParams } from 'react-router-dom';



interface DataProtectionPolicyProps {
  nextFunction: () => void;
  document: DataProtectionPolicyDocument;
}

interface DataProtectionPolicyDocument {
  title: string;
  document_id: string;
}


const DataProtectionPolicyCheckbox: FunctionComponent<DataProtectionPolicyProps> = ({nextFunction, document}) => {
  let {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch()
  const [isPolicyDownloaded, setIsPolicyDownload] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const downloadDocument = async () => {
    await API.downloadDocument(document.document_id, document.title)
    setIsPolicyDownload(true)
  }

  const handleNextButton = () => {
    nextFunction()
  }

  const onCheckPolicy = async (e: any) => {
    const checked = e.target.checked
    setIsChecked(checked)
    setIsLoading(true)
    await ELigibilityCriteriaApi.updateDataProtectionPolicyResponse(externalId, {is_data_protection_policy_agreed: checked})
    setIsLoading(false)
  }

  return <>
    <h4 className="mt-5 mb-4 ms-3">I agree with data protection policy</h4>
    <div>
      {!isPolicyDownloaded &&
        <p className="note-text ms-3">* Please download the document to enable the checkbox</p>}
    </div>
    <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
    <AgreeDocumentBlock>
            <Form.Check
              type="checkbox"
              label={document.title}
              onChange={(e) => {
                onCheckPolicy(e)
              }}
              checked={isChecked}
              disabled={!isPolicyDownloaded}
              id={`approval-${document.document_id}`}
            />
            <Button className={'document-container ms-3'} variant={'outline-primary'}
                    onClick={downloadDocument}>{document.title}</Button>
          </AgreeDocumentBlock>
    </div>
    <Button onClick={handleNextButton} disabled={!isChecked || isLoading} className={'mt-4'}>Next</Button>
  </>
};

export default DataProtectionPolicyCheckbox;
