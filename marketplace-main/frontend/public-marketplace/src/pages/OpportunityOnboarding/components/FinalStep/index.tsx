import { ICriteriaBlock } from 'interfaces/OpportunityOnboarding/criteria'
import { useState } from 'react'
import { createInvestmentAmount } from 'services/OpportunityOnboarding'
import InvestmentProposalSection from './components/InvestmentProposalSection'
import WillReviewSection from './components/WillReviewSection'
import { useGetFundDetailsQuery } from 'api/rtkQuery/fundsApi'
import { logMixPanelEvent } from 'utils/mixpanel'
import { get } from 'lodash'

interface FinalStepBlockProps {
	responseId: number
	handleBack: () => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	investmentAmount: any
	minimumInvestment: number
	isEligible: boolean
	externalId: string
	criteriaBlock: ICriteriaBlock
	currency: any;
	offerLeverage: boolean
}

const FinalStepBlock = ({
	isEligible,
	responseId,
	handleBack,
	investmentAmount,
	minimumInvestment,
	externalId,
	criteriaBlock,
	currency,
	offerLeverage
}: FinalStepBlockProps) => {
	const [hasSubmittedIndicateInterest, setSubmittedIndicateInterest] =
		useState(false)
		const {data: fundDetails} = useGetFundDetailsQuery(externalId)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const submitInvestmentAmount = async (payload: any) => {
		await createInvestmentAmount(responseId, payload)
		setSubmittedIndicateInterest(true)
		logMixPanelEvent('Submitted investment amount', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
	}

	return !!isEligible && !hasSubmittedIndicateInterest ? (
		<InvestmentProposalSection
			handleSubmitInvestment={submitInvestmentAmount}
			handleBack={handleBack}
			investmentAmount={investmentAmount}
			minimumInvestment={minimumInvestment}
			currency={currency}
			offerLeverage={offerLeverage}
		/>
	) : (
		<WillReviewSection
			EligibilityResText={criteriaBlock.payload}
			externalId={externalId}
			handleBack={handleBack}
			isEligible={isEligible}
		/>
	)
}

export default FinalStepBlock
