/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, useEffect, useState } from 'react'
import { DropzoneArea } from 'material-ui-dropzone'
import map from 'lodash/map'
import get from 'lodash/get'
import filter from 'lodash/filter'
import size from 'lodash/size'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { ErrorMessage } from 'formik'
import API from '../../../api/marketplaceApi'
import { FileUploadTypeData, KYCDocument } from '../../../interfaces/workflows'
import { isToolTipText } from '../../../components/ToolTip/interfaces'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import {
	fetchKYCDocuments,
	fetchKYCParticipantsDocuments,
	fetchKYCRecord,
} from '../thunks'
import { selectKYCRecord } from '../selectors'
import FilePreviewModal from './FilePreview'
import { FieldComponent } from '../interfaces'
import ToolTip from '../../../components/ToolTip'
import {
	FileAlreadyAdded,
	FileChooserButton,
	InnerFieldContainer,
	SelectButton,
} from '../styles'
import { useField } from '../hooks'
import { CommentsContext } from '../Context'
import CommentWrapper from '../components/CommentsWrapper'
import { MAX_FILE_SIZE } from '../constants'

const Icon = () => <SelectButton>Select</SelectButton>

type FileUploadProps = FieldComponent

const FileUpload: FunctionComponent<FileUploadProps> = ({ question, customOnBlur }) => {
	const dispatch = useAppDispatch()
	const [isAddmoreFile, setIsAddMoreFiles] = useState(false)
	const { recordUUID, comments } = useAppSelector(selectKYCRecord)
	const { field, helpers } = useField(question.id, question.type)

	const data = question.data as FileUploadTypeData
	const { file_types, filesLimit } = data

	useEffect(() => {
		if (isAddmoreFile && field && field.value?.pendingUploads?.length !== 0)
			setIsAddMoreFiles(false)
	}, [field, isAddmoreFile])

	const handleChange = (files: File[]) => {
		const newValue = { ...field.value, pendingUploads: files }
		if (customOnBlur) {
			customOnBlur()
		}
		helpers.setValue(newValue)
	}

	const onFileDeletion = async (doc: KYCDocument) => {
		// eslint-disable-next-line no-alert
		if (window.confirm('Are you sure you want to delete this file?')) {
			await API.deleteKYCDocument(doc.record_id, doc.document.document_id)
			// KYC answers are computed based on documents in current state
			// Therefore fetching documents first and then kyc record
			dispatch(fetchKYCParticipantsDocuments(doc.record_id))
			dispatch(fetchKYCDocuments(doc.record_id))
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			dispatch(fetchKYCRecord(recordUUID!))
		}
	}

	const documentsInRecord = get(field.value, 'documentsInRecord', [])
	const pendingUploads = get(field.value, 'pendingUploads', [])

	const totalFiles = size(documentsInRecord) + size(pendingUploads)
	return (
		<InnerFieldContainer>
			<CommentsContext.Consumer>
				{({ recordId, callbackDocumentUpload }) => (
					<Row className='mt-2'>
						<Col md={4} className='field-label'>
							{question.label}
							{isToolTipText(question.helpText) && (
								<ToolTip {...question.helpText} />
							)}
						</Col>
						{typeof question.helpText === 'string' && (
							<Col md={8} className='field-help-text'>
								<span>{question.helpText}</span>
							</Col>
						)}
						<Col md={8}>
							{map(documentsInRecord, (file: KYCDocument) => {
								const docComments = filter(
									comments,
									(comment: any) =>
										comment.document_identifier ===
										file.document.document_id,
								)
								return (
									<>
										<FileAlreadyAdded
											key={file.document.document_id}
										>
											<FilePreviewModal
												title={question.label}
												questionId={question.id}
												documentName={
													file.document.title
												}
												documentId={
													file.document.document_id
												}
											/>
											<DeleteOutlineIcon
												htmlColor='#F42222'
												onClick={() =>
													onFileDeletion(file)
												}
											/>
										</FileAlreadyAdded>
										{map(docComments, (comment: any) => (
											<CommentWrapper
												key={comment.id}
												comment={comment}
											/>
										))}
									</>
								)
							})}
							{(size(documentsInRecord) === 0 ||
								size(pendingUploads) > 0 ||
								isAddmoreFile) && (
								<DropzoneArea
									acceptedFiles={file_types}
									dropzoneText='Drag and drop your files here or click to upload'
									filesLimit={
										filesLimit
											? filesLimit - totalFiles
											: filesLimit
									}
									maxFileSize={MAX_FILE_SIZE}
									onChange={(files: File[]) => {
										handleChange(files)
										if (callbackDocumentUpload && recordId)
											callbackDocumentUpload({
												files,
												recordId,
												questionId: question.id,
											})
									}}
									showPreviewsInDropzone
									showAlerts
									clearOnUnmount
									Icon={Icon as any}
								/>
							)}
							{/* 
          // TODO: implement add another file 
        */}
							{(filesLimit === undefined ||
								totalFiles < filesLimit) &&
								size(pendingUploads) === 0 &&
								size(documentsInRecord) > 0 && (
									<FileChooserButton
										onClick={() => setIsAddMoreFiles(true)}
									>
										Choose file for upload
									</FileChooserButton>
								)}
							<ErrorMessage name={question.id} component='div' />
						</Col>
					</Row>
				)}
			</CommentsContext.Consumer>
		</InnerFieldContainer>
	)
}

export default FileUpload
