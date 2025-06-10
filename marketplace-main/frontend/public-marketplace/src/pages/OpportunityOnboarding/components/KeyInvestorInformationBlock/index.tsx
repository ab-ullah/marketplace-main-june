import { useState } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import CustomInput, {
	// InputTypeKeys,
	// OptionsType,
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

const KIIOptions = [{ label: 'I agree', value: true }]

interface KeyInvestorInformationBlockProps {
	criteriaBlock: ICriteriaBlock
	criterialId: number
	criteriaName: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedAnswer: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateFundCriteriaResponse: (_res: any) => void
	handleNext: () => void
	handleBack: () => void
}

const KeyInvestorInformationBlock = ({
	handleNext,
	handleBack,
	criterialId,
	criteriaName,
	criteriaBlock,
	selectedAnswer,
	updateFundCriteriaResponse,
}: KeyInvestorInformationBlockProps) => {
	const [downloadedDocuments, setDownloadedDocuments] = useState<
		Record<string, boolean>
	>({})

	const answerValue = selectedAnswer
		? selectedAnswer.response_json.value
		: null
	const blockKey = criteriaBlock.block.block_id
	const getDocumentDownloadKey = (document: IUploadedDocument) =>
		`${blockKey}_DOWNLOADED_${document.doc_id}`

	const allDocumentsChecked = () =>
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

	const handleAgreeKiidChange = async (value: boolean) => {
		const responseJson = {
			value,
		}
		const payload = {
			block_id: criteriaBlock.id,
			response_json: responseJson,
			eligibility_criteria_id: criterialId,
		}
		const res = await updateResponseBlock(payload)
		if (res.success) {
			updateFundCriteriaResponse(res.data)
		}
	}

	return (
		<>

			<h4 className='mt-5 mb-4'>
				I have read the related Key Investment Information Document
			</h4>
			{!allDocumentsChecked() && (
				<p className='note-text'>
					* Please download the documents to enable the checkbox
				</p>
			)}
			<div style={{ width: '100%', maxWidth: '250px' }}>
				<div>
					{criteriaBlock.criteria_block_documents.map(document => (
						<div
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
							<p className={'mb-0'}>{document.document_name}</p>
						</div>
					))}
				</div>
			</div>
			<p className='text-muted'>
				By clicking below I certify that I have reviewed the KIID for{' '}
				{criteriaName}
			</p>

			<CustomInput
				title=''
				type='radio'
				options={KIIOptions}
				error=''
				size={'fit-content'}
				value={answerValue}
				fieldId={`${criteriaBlock.id}-Select`}
				handleChange={(_e: HandleChangeValueType) =>
					handleAgreeKiidChange(true)
				}
				disabled={!allDocumentsChecked()}
			/>
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
				disabled={!answerValue}
				onClick={handleNext}
			>
				<ArrowForward /> Next Step
			</Button>
			</ButtonWrapper>
		</>
	)
}

export default KeyInvestorInformationBlock
