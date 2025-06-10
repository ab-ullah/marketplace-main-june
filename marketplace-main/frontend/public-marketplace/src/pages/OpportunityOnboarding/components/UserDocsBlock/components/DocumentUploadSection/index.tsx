import { IRequiredDocument } from 'interfaces/OpportunityOnboarding/documents_required'
import get from 'lodash/get'
import DocumentDropZone from 'components/FileUpload'
import Document from 'components/Document'
import { uploadDocument } from 'services/Document'
import { map } from 'lodash'

interface DocumentUploadSectionProps {
	requiredDocument: IRequiredDocument
	refreshDocsAndStatus: () => void
}

const DocumentUploadSection = ({
	requiredDocument,
	refreshDocsAndStatus,
}: DocumentUploadSectionProps) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const uploadFile = async (fileData: any) => {
		const formData = new FormData()
		formData.append('file_data', fileData)
		formData.append(
			'response_block_id',
			requiredDocument.response_block_id.toString(),
		)
		formData.append('options', JSON.stringify(requiredDocument.options))
		await uploadDocument(formData)
		refreshDocsAndStatus()
	}

	return requiredDocument.options ? (
		<div>
			<p>{get(requiredDocument.options, `0.requirement_text`)}</p>
			<DocumentDropZone onFileSelect={uploadFile} />
			{map(get(requiredDocument, 'documents'), document => (
				<Document
					key={document.document_id}
					documentInfo={document}
					refreshDocsAndStatus={refreshDocsAndStatus}
				/>
			))}
		</div>
	) : null
}

export default DocumentUploadSection
