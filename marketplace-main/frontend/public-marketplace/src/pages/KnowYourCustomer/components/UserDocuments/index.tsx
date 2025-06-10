import React, {FunctionComponent, useEffect, useState} from 'react';
import filter from "lodash/filter";
import size from "lodash/size";
import Button from "react-bootstrap/Button";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import DocumentUploadSection from "./DocumentUploadSection";


import {IRequiredDocument} from "../../../../interfaces/EligibilityCriteria/documents_required";
import eligibilityCriteriaApi from "../../../../api/eligibilityCriteria";
import NavableLoader from "../../../../components/NavableLoader";
import {
  selectFundCriteriaPreview,
  selectFundCriteriaResponse,
  selectIsLoading
} from "../../../OpportunityOnboarding/selectors";
import {ErrorDiv} from "../../../OpportunityOnboarding/components/UserDocsBlock/styled";
import {setIsLoading} from "../../../OpportunityOnboarding/eligibilityCriteriaSlice";


interface UserDocumentsProps {
  criteriaBlock: ICriteriaBlock;
  nextFunction: () => void;
}


const UserDocuments: FunctionComponent<UserDocumentsProps> = ({criteriaBlock, nextFunction}) => {
  const dispatch = useAppDispatch();
  const [requiredDocuments, setRequiredDocuments] = useState<IRequiredDocument[] | null>(null)
  const [isEligible, setIsEligible] = useState<boolean | null>(null)
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)
  const isLoading = useAppSelector(selectIsLoading)

  const fetchResponseStatus = async () => {
    if (fundCriteriaResponse) {
      const response = await eligibilityCriteriaApi.getResponseStatus(fundCriteriaResponse.id);
      setIsEligible(response?.is_eligible)
    }
  }

  const fetchRequiredDocuments = async () => {
    if (fundCriteriaResponse) {
      const response = await eligibilityCriteriaApi.getResponseDocuments(fundCriteriaResponse.id);
      setRequiredDocuments(response ? response : [])
    }
  }

  useEffect(() => {
      fetchRequiredDocuments()
      fetchResponseStatus()
  }, [fundCriteriaResponse])

  if (!fundCriteriaPreview || !fundCriteriaResponse) return <></>

  const handleNextButton = () => {
    nextFunction()
  }


  const isValid = () => {
    return size(filter(requiredDocuments, (doc) => size(doc.documents) === 0)) === 0;
  }

  if (!requiredDocuments || isEligible === null) {
    return <NavableLoader/>
  }

  if (isEligible === false || requiredDocuments?.length === 0) {
    handleNextButton()
  }

  return <div className={'mt-5'}>
    <h4>Upload Documents</h4>

    {requiredDocuments && requiredDocuments.map(requiredDocument => (
      <DocumentUploadSection
        key={`${requiredDocument.response_block_id}-${requiredDocument.options[0]?.id}`}
        requiredDocument={requiredDocument}
        handleIsUploading={(isLoading: boolean) => dispatch(setIsLoading(isLoading))}
        postUpload={fetchRequiredDocuments}
        postDelete={fetchRequiredDocuments}
      />
    ))}
    {!isValid() && (<ErrorDiv>Please upload the documents.</ErrorDiv>)}
    <Button onClick={handleNextButton} className={'mt-2'} disabled={Boolean(isLoading || !isValid())}>Next</Button>
  </div>
};

export default UserDocuments;
