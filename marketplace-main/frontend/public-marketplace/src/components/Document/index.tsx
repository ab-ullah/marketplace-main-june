/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-comment-textnodes */
import { FunctionComponent } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import { IDocument } from 'interfaces/OpportunityOnboarding/criteria'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import { downloadDocument, deleteDocument } from 'services/Document'
import { ImageIconDiv } from './styled'

interface DocumentProps {
	documentInfo: IDocument
	refreshDocsAndStatus: () => void
}

const Document: FunctionComponent<DocumentProps> = ({
	documentInfo,
	refreshDocsAndStatus,
}) => {
	const handleDownloadDocument = async () => {
		await downloadDocument(
			documentInfo.document_id,
			documentInfo.document_name,
		)
	}

	const handleDeleteDocument = async () => {
		await deleteDocument(documentInfo.doc_id)
		refreshDocsAndStatus()
	}

	return (
		<ImageIconDiv>
			<div style={{ display: 'flex' }}>
				<FilePresentIcon />
				<p>{documentInfo.document_name}</p>
			</div>
			<DownloadIcon
				className='pointer'
				onClick={handleDownloadDocument}
			/>
			<DeleteOutlineIcon
				className='pointer'
				onClick={handleDeleteDocument}
			/>
		</ImageIconDiv>
	)
}

export default Document
