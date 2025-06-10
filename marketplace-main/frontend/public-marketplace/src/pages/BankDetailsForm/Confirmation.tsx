/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/require-default-props */
import { FunctionComponent } from 'react'
import { useParams, Link ,useNavigate} from 'react-router-dom'
import {
	Container,
	NextButton,
	FormContainer,
} from '../../pages/TaxForms/styles'
import CustomButton from 'components/Button/ThemeButton'

const REVIEW_TEXT = 'Thank you! We will review your application shortly.'

interface IConfirmation {
	showNext: boolean
	handleClickNext: () => void
	customText?: string | null
}

const Confirmation: FunctionComponent<IConfirmation> = ({
	showNext,
	handleClickNext,
	customText,
}) => {
	// @ts-ignore
	const { externalId, company } = useParams<{ externalId: string, company: string }>()
	const navigate=useNavigate()
	return (
		<Container>
			<FormContainer>
				<h6 className='mt-5 mb-4'>{customText || REVIEW_TEXT}</h6>
				{showNext && (
					<NextButton
						variant='primary'
						className='mr-2'
						onClick={handleClickNext}
					>
						Next
					</NextButton>
				)}
				{externalId && (
					// <Link
					// 	to={`/funds/${externalId}/application`}
					// 	className='mb-2 btn btn-outline-primary btn-purple'
					// >
					// 	Go to My Application
					// </Link>
					<CustomButton solo position='left' variant='outlined' onClick={()=>navigate(`/${company}/funds/${externalId}/application`)}>
					Go to My Application
					</CustomButton>
				)}
			</FormContainer>
		</Container>
	)
}

export default Confirmation
