import React, { FunctionComponent, useEffect } from "react";
import {
  Field,
  FieldProps,
  Formik,
} from "formik";
import { CommentBadge, CommentContainer, Form } from '../styles';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import FileUpload from "./FileUpload";
import AutoSave from "../../KnowYourCustomer/components/AutoSave";
import { uploadApplicationDocumentsRequestResponse, fetchApplicationDocumentRequestResponse, deleteApplicationDocumentRequestResponse } from '../../KnowYourCustomer/thunks'
import { IApplicationRequestedDocument } from "../../KnowYourCustomer/interfaces";
import CommentWrapper from "../../../components/CommentWrapper";
import uniqBy from "lodash/uniqBy";
import {selectKYCRecord} from "../../KnowYourCustomer/selectors";
import get from "lodash/get";
import {DOCUMENTS_REQUEST} from "../../../constants/commentModules";
import {Comment} from "../../../interfaces/workflows";


interface IDocumentRequestProps {
  request: {
    document_name: string;
    document_description: string;
    uuid: string;
    id: number
  };
  documents: IApplicationRequestedDocument[];
  applicationId: number | undefined;
  comments: any;
}

const DocumentRequest: FunctionComponent<IDocumentRequestProps> = ({
  request,
  documents,
  applicationId,
  comments
}) => {
  const { document_name, document_description, uuid } = request;
  const { commentsByRecord } = useAppSelector(selectKYCRecord);
  const commentsOfThisRecord = get(commentsByRecord, `${DOCUMENTS_REQUEST}.${request.id}.${request.id}`);
  const dispatch = useAppDispatch();

  const getAllRequestComments = () => {
    let comments = [] as Comment[]
    documents.forEach(document => {
      const documentComments = commentsOfThisRecord && commentsOfThisRecord[document.document.document_id]
      if (documentComments)  comments = [...comments, ...documentComments]
    })
    return comments
  }

  const onSubmit = async (values: any, formikProps: any) => {
    if(values){
        const { pendingUploads } = values[uuid];
        const documentsUploading: any = []
        pendingUploads?.forEach((file: any) => {
            const formData = new FormData();
            formData.append('file_data', file);
            formData.append('uuid', uuid);
            documentsUploading.push(dispatch(uploadApplicationDocumentsRequestResponse(formData)));
        });
        if(documentsUploading.length > 0 && applicationId){
            await Promise.allSettled(documentsUploading);   
            dispatch(fetchApplicationDocumentRequestResponse(applicationId))
            formikProps.resetForm()
        }
    }
  }

  const onDeleteFile = (id: number) => {
    dispatch(deleteApplicationDocumentRequestResponse(id)).then(() => {
        if(applicationId) dispatch(fetchApplicationDocumentRequestResponse(applicationId))
    })
  }
  const uniqueComments = uniqBy(comments, 'id');
  return (
    <>
      <h4>{document_name}</h4>
      {documents.length === 0 ? (
        <CommentContainer>
          <CommentBadge>New Request</CommentBadge>
          <div>{document_description}</div>
        </CommentContainer>
      ) : (
        <p>{document_description}</p>
      )}
      <Formik
        initialValues={{
          [uuid]: {
            pendingUploads: [],
          },
        }}
        onSubmit={onSubmit}
      >
        {(formikProps: any) => {
          return (
            <>
              <AutoSave />
              <Form>
                <Field>
                  {(_: FieldProps) => (
                    <>
                      <FileUpload
                        request={request}
                        uploadedDocuments={documents}
                        onDelete={onDeleteFile}
                      />
                    </>
                  )}
                </Field>
              </Form>
            </>
          );
        }}
      </Formik>
      {getAllRequestComments().map((comment: any) => (
        <CommentWrapper key={comment.id} comment={comment} />
      ))}
    </>
  );
};

export default DocumentRequest;
