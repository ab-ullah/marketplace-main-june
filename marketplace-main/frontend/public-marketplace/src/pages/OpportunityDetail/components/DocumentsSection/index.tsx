import { useState } from 'react'
import IconDoc from 'assets/images/IconDoc.png'
import CallMadeIcon from '@mui/icons-material/CallMade'
import { ScrollRefType } from 'interfaces/common/refs'
import { downloadDocument } from 'services/Document'
import CircularProgress from '@mui/material/CircularProgress'
import {
	Cont,
	Title,
	DocTile,
	DetailSection,
	Icon,
	DocName,
	DocDetail,
} from './styled'

interface DocumentsSectionProps {
	scrollRef: ScrollRefType
	files: IDoc[]
}

interface IDoc {
	title: string
	document_id: string
}

const DocumentsSection = ({ scrollRef, files }: DocumentsSectionProps) => {
	const [downloading, setDownloading] = useState<string[]>([])

	const handleDocDownload = async (_docId: string, _name: string) => {
		setDownloading(prev => [...prev, _docId])
		await downloadDocument(_docId, _name)
		setDownloading(prev => prev.filter(file => file !== _docId))
	}

	const isDownloading = (docId: string) => downloading.includes(docId)

	if (files.length === 0) return null

	return (
		<Cont ref={scrollRef}>
			<Title>Documentation</Title>

			{files.map(file => (
				<DocTile
					key={`doc-${file.document_id}`}
					sx={
						isDownloading(file.document_id)
							? { cursor: 'progress' }
							: { cursor: 'pointer' }
					}
					onClick={() =>
						!isDownloading(file.document_id) &&
						handleDocDownload(file.document_id, file.title)
					}
				>
					<DetailSection>
						<Icon src={IconDoc} alt='doc' />
						<DocName>{file.title.split('.')[0]}</DocName>
						<DocDetail>• {file.title.split('.').pop()}</DocDetail>
					</DetailSection>
					{isDownloading(file.document_id) ? (
						<CircularProgress />
					) : (
						<CallMadeIcon
							fontSize='large'
							sx={{ color: 'primary.main' }}
						/>
					)}
				</DocTile>
			))}
		</Cont>
	)
}
export default DocumentsSection
