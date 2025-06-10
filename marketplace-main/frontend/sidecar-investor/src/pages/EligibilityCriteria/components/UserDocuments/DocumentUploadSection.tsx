import {FunctionComponent} from 'react';
import get from "lodash/get";
import map from "lodash/map";
import filter from "lodash/filter";
import {IRequiredDocument} from "../../../../interfaces/EligibilityCriteria/documents_required";
import DocumentDropZone from "../../../../components/FileUpload";
import eligibilityCriteria from "../../../../api/eligibilityCriteria";
import Document from "../../../../components/Document";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectFundCriteriaResponse} from "../../selectors";
import {getFundCriteriaResponseDocuments} from "../../thunks";
import CommentWrapper from "../../../../components/CommentWrapper";
import { Comment } from '../../../../interfaces/workflows';

interface DocumentUploadSectionProps {
  handleIsUploading?: (isUploading: boolean) => void;
  requiredDocument: IRequiredDocument;
  comments?: Object[];
  postUpload?: () => void;
  postDelete?: () => void;
  isDisabled?: boolean;
}


const DocumentUploadSection: FunctionComponent<DocumentUploadSectionProps> = ({
                                                                                requiredDocument,
                                                                                comments,
                                                                                handleIsUploading,
                                                                                postUpload,
                                                                                postDelete,
                                                                                isDisabled
                                                                              }) => {
  const dispatch = useAppDispatch()
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)


  const setUploading = (isUploading: boolean) => {
    if (handleIsUploading)
      handleIsUploading(isUploading);
  }

  const onDelete = () => {
    if (fundCriteriaResponse) {
      dispatch(getFundCriteriaResponseDocuments(fundCriteriaResponse.id))
    }
    if (postDelete) postDelete()
  }

  const uploadFile = async (fileData: any) => {
    const formData = new FormData();
    formData.append('file_data', fileData);
    formData.append('response_block_id', requiredDocument.response_block_id.toString());
    formData.append('options', JSON.stringify(requiredDocument.options));
    setUploading(true);
    await eligibilityCriteria.createResponseBlockDocument(formData)
    if (fundCriteriaResponse) dispatch(getFundCriteriaResponseDocuments(fundCriteriaResponse.id))
    if (postUpload) postUpload()
    setUploading(false);
  }
  return requiredDocument.options ? <div className={'mb-3'}>
  <p>{get(requiredDocument.options, `0.requirement_text`)}</p>
  <DocumentDropZone onFileSelect={uploadFile} isDisabled={isDisabled} />
  {map(get(requiredDocument, 'documents'), document => (
    <>
      <Document
        key={document.document_id}
        documentInfo={document}
        postDelete={onDelete}
        isDisabled={isDisabled}
      />
      {map(
        filter(comments, (comment: Comment) => comment.document_identifier === document.document_id),
        (comment: Comment, key) => (
        <CommentWrapper key={key} comment={comment} />
      ))}
    </>
  ))}
</div>: null
};

export default DocumentUploadSection;
