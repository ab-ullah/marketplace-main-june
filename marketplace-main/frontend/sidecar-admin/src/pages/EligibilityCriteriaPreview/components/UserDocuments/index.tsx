import React, {FunctionComponent} from 'react';

import Button from "react-bootstrap/Button";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {DocumentUploadContainer} from '../../../../presentational/DocumentUploadZone';
import {setLogicFlowValues} from "../../eligibilityCriteriaPreviewSlice";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectFundCriteriaPreview, selectUserFileText, selectRenderedBlockIds} from "../../selectors";


interface UserDocumentsProps {
  criteriaBlock: ICriteriaBlock;
  nextFunction: () => void;
}


const UserDocuments: FunctionComponent<UserDocumentsProps> = ({criteriaBlock, nextFunction}) => {
  const dispatch = useAppDispatch();
  const userDocumentText = useAppSelector(selectUserFileText);
  const renderedBlockIds = useAppSelector(selectRenderedBlockIds);
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);

  if (!fundCriteriaPreview) return <></>

  const handleNextButton = () => {
    dispatch(setLogicFlowValues({[criteriaBlock.id]: true}))
    nextFunction()
  }
  console.log("user docs text", userDocumentText, renderedBlockIds)

  return <div className={'mt-5'}>
    <h4>Supporting Documentation</h4>
    <p>
      **This is a generic block for uploading documents that support a 
      prior question in the flow. The user will be able to upload documents 
      in this step. FYI- the uploading feature is not available for admins 
      or reviewers; just visible when investors are applying.
    </p>
    {Object.keys(userDocumentText).map(key => {
      if (!userDocumentText[key]) return <></>
      if(!renderedBlockIds.some(e => e.includes(key))) return <></>
      return <div className={'mb-3'}>
        <p>{userDocumentText[key]}</p>
        <DocumentUploadContainer>
          <p>Drag and drop files here, or select on your device</p>
          <Button className={'select-button'}>Select</Button>
        </DocumentUploadContainer>
      </div>
    })
    }


    <Button onClick={handleNextButton} className={'mt-2'}>Next</Button>
  </div>
};

export default UserDocuments;
