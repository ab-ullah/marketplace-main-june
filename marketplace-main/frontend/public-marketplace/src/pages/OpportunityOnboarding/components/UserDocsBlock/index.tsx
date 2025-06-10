import filter from 'lodash/filter'
import size from 'lodash/size'
import Button from 'components/Button/ThemeButton'
import { IRequiredDocument } from 'interfaces/OpportunityOnboarding/documents_required'
import { ErrorDiv } from './styled'
import DocumentUploadSection from './components/DocumentUploadSection'
import { ButtonWrapper } from '../FinalStep/components/InvestmentProposalSection/styled'
import { ArrowBack, ArrowForward } from '@material-ui/icons'

interface UserDocsBlockProps {
	handleNext: () => void
	handleBack: () => void
	requiredDocuments: IRequiredDocument[]
	refreshDocsAndStatus: () => void
}

const UserDocsBlock = ({
	requiredDocuments,
	refreshDocsAndStatus,
	handleNext,
	handleBack,
}: UserDocsBlockProps) => {
	const isValid = () =>
		size(filter(requiredDocuments, doc => size(doc.documents) === 0)) === 0

	return (
		<>

			{requiredDocuments &&
				requiredDocuments.map(requiredDocument => (
					<DocumentUploadSection
						key={`${requiredDocument.response_block_id}-${requiredDocument.options[0]?.id}`}
						requiredDocument={requiredDocument}
						refreshDocsAndStatus={refreshDocsAndStatus}
					/>
				))}

			{!isValid() && <ErrorDiv>Please upload the documents.</ErrorDiv>}
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
				disabled={!isValid()}
				position='right'
				onClick={handleNext}
			>
				<ArrowForward /> Next Step
			</Button>
			</ButtonWrapper>
		</>
	)
}

export default UserDocsBlock
