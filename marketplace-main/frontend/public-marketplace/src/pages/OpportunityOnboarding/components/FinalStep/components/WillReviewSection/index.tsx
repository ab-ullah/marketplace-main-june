/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate, useParams } from 'react-router-dom'
import Tick from 'assets/images/Icontick.png'
import Button from 'components/Button/ThemeButton'
import Loader from 'components/Loader'
import { getApplicationStatus } from 'services/OpportunityOnboarding'
import { BtnsSection, Cont, Description, Icon, NotEligibleSection, Title } from './styled'
import { ButtonWrapper } from '../InvestmentProposalSection/styled'
import { ArrowBack, ArrowForward } from '@material-ui/icons'

const NEXT_STEP_MESSAGE =
	'Thank you. Please continue to the next step to fill AML/KYC details'

const WillReviewSection = ({
	EligibilityResText,
	isEligible,
	externalId,
 	handleBack
}: any) => {
	const { user } = useAuth0()
	const navigate = useNavigate()
	const {company} =useParams()
	const [appStatus, setAppStatus] = useState<any>({})

	const handleGetApplicationStatus = async () => {
		const res = await getApplicationStatus(externalId)
		if (res.success) {
			setAppStatus(res.data)
			// setAppStatus({ is_approved: true })
		}
	}

	useEffect(() => {
		handleGetApplicationStatus()
	}, [])

	if (Object.keys(appStatus).length === 0)
		return (
			<Cont>
				<Loader />
			</Cont>
		)

	return (
		<>
			{isEligible ? (
				<Cont>
					<Icon src={Tick} alt='tick' />
					{appStatus?.can_go_past_eligibility ? (
						<Title>{NEXT_STEP_MESSAGE}</Title>
					) : (
						<>
							<Title>{EligibilityResText.need_review_text}</Title>
							<Description>
								Expect an email to {user?.email} in the
								following week with your eligibility result and
								next steps.
							</Description>
						</>
					)}
					<ButtonWrapper className='mt-3'>
					<Button
						onClick={handleBack}
						position='left'
						variant='outlined'
						size='sm'
					>
						Previous Step <ArrowBack /> 
					</Button>
					<BtnsSection>
						<Button
							size='sm'
							onClick={() =>
								navigate(
									appStatus?.can_go_past_eligibility
										? `/${company}/funds/${externalId}/amlkyc`
										: `/${company}`,
								)
							}
						>
							{appStatus?.is_approved ? <><ArrowForward /> Next Step</> : 'Next Step'}
						</Button>
					</BtnsSection>
					</ButtonWrapper>
				</Cont>
			) : (
				<NotEligibleSection>
					<Title>Not Eligible</Title>
					<Description>{EligibilityResText.failure_text}</Description>
					<ButtonWrapper>
						<Button
							onClick={handleBack}
							position='left'
							variant='outlined'
							size='sm'
						>
							Previous Step <ArrowBack /> 
						</Button>
						<Button size='sm' onClick={() => navigate(`/${company}`)}>
							Close
						</Button>
					</ButtonWrapper>
				</NotEligibleSection>
			)}
	</>
	)
}

export default WillReviewSection
