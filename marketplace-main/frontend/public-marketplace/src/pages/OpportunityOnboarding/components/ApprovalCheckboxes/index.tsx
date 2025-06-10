import { useState } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import CustomInput, {
	// InputTypeKeys,
	OptionsType,
	// ValueType,
	HandleChangeValueType,
} from 'components/Input'
import { ICriteriaBlock } from 'interfaces/OpportunityOnboarding/criteria'
import { IUploadedDocument } from 'interfaces/OpportunityOnboarding/documents_required'
import Button from 'components/Button/ThemeButton'
import { downloadDocument } from 'services/Document'
import { updateResponseBlock } from 'services/OpportunityOnboarding'
import { ButtonWrapper } from '../FinalStep/components/InvestmentProposalSection/styled'
import { ArrowBack, ArrowForward } from '@material-ui/icons'

interface ApprovalCheckboxesProps {
	criteriaBlock: ICriteriaBlock
	criterialId: number
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedAnswer: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateFundCriteriaResponse: (_res: any) => void
	handleNext: () => void
	handleBack: () => void
}

const dropdownOptions = [
	{ label: 'I Object', value: false },
	{ label: 'I Agree', value: true },
]

const ApprovalCheckboxes = ({
	handleNext,
	handleBack,
	criterialId,
	criteriaBlock,
	selectedAnswer,
	updateFundCriteriaResponse,
}: ApprovalCheckboxesProps) => {
	const [downloadedDocuments, setDownloadedDocuments] = useState<
		Record<string, boolean>
	>({})
	const blockKey = criteriaBlock.block.block_id
	const answerPayload = selectedAnswer ? selectedAnswer.response_json : {}

	const getDocumentKey = (document: IUploadedDocument) =>
		`${blockKey}_${document.doc_id}`

	const getDocumentDownloadKey = (document: IUploadedDocument) =>
		`${blockKey}_DOWNLOADED_${document.doc_id}`

	const allDocumentsChecked = () =>
		criteriaBlock.criteria_block_documents
			.map(document => Boolean(answerPayload[getDocumentKey(document)]))
			.every(Boolean)

	const allDocumentsDownloaded = () =>
		criteriaBlock.criteria_block_documents
			.map(document =>
				Boolean(downloadedDocuments[getDocumentDownloadKey(document)]),
			)
			.every(Boolean)

	const handleDownload = async (document: IUploadedDocument) => {
		const { document_id, document_name } = document
		await downloadDocument(document_id, document_name)
		const documentDownloadedKey = getDocumentDownloadKey(document)
		setDownloadedDocuments(prev => ({
			...prev,
			[documentDownloadedKey]: true,
		}))
	}

	const handleApprovalChange = async (
		approval: OptionsType,
		document: IUploadedDocument,
	) => {
		const documentKey = getDocumentKey(document)
		const payload = {
			block_id: criteriaBlock.id,
			response_json: { ...answerPayload, [documentKey]: approval.value },
			eligibility_criteria_id: criterialId,
		}
		const res = await updateResponseBlock(payload)
		if (res.success) {
			updateFundCriteriaResponse(res.data)
		}
	}

	return (
		<>
			<h4 className='mt-5 mb-4 ms-3'>
				I have reviewed and agree with the following documents:
			</h4>
			<div>
				{!allDocumentsDownloaded() && (
					<p className='note-text ms-3'>
						* Please download the documents to enable the checkboxes
					</p>
				)}
			</div>

			<div style={{ width: '100%', maxWidth: '250px' }}>
				{criteriaBlock.criteria_block_documents.map(document => (
					<div
						className='mt-2'
						key={`${criteriaBlock.id}-${document.doc_id}`}
						style={{
							display: 'flex',
							gap: '10px',
							alignItems: 'center',
						}}
					>
						<DownloadIcon
							onClick={() => handleDownload(document)}
							sx={{ cursor: 'pointer' }}
						/>
						<p>{document.document_name}</p>
						<CustomInput
							title=''
							type='dropdown'
							options={dropdownOptions}
							fieldId={`${criteriaBlock.id}-${document.doc_id}-select`}
							error=''
							handleChange={(e: HandleChangeValueType) =>
								handleApprovalChange(e as OptionsType, document)
							}
							value={dropdownOptions.find(
								opt =>
									opt.value ===
									answerPayload[getDocumentKey(document)],
							)}
							disabled={
								!downloadedDocuments[
									getDocumentDownloadKey(document)
								]
							}
						/>
					</div>
				))}
			</div>
			<ButtonWrapper>
			<Button
				onClick={handleBack}
				solo
				position='left'
				variant='outlined'
				size='sm'
			>
				Previous Step <ArrowBack />
			</Button>
			<Button
				solo
				size='sm'
				position='right'
				disabled={!allDocumentsChecked()}
				onClick={handleNext}
			>
				<ArrowForward /> Next Step
			</Button>
			</ButtonWrapper>
		</>
	)
}

export default ApprovalCheckboxes
