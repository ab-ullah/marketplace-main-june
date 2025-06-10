/* eslint-disable import/prefer-default-export */
import React from 'react'
import { ICommentsContext } from './interfaces'

export const CommentsContext = React.createContext<ICommentsContext>({
	comments: {},
	recordId: null,
	recordUUID: null,
	callbackDocumentUpload: null,
	fetchKYCRecord: null,
})
