import React from "react";


export interface IUploadDocDetails {
  files: File[],
  recordId: number,
  questionId: string
}

interface ICommentsContext {
  comments: any,
  recordId: null | number;
  recordUUID: null | string;
  callbackDocumentUpload: null | ((data: IUploadDocDetails) => void),
  fetchKYCRecord: null | (() => void),

}

export const CommentsContext = React.createContext<ICommentsContext>({
  comments: {},
  recordId: null,
  recordUUID: null,
  callbackDocumentUpload: null,
  fetchKYCRecord: null
});
