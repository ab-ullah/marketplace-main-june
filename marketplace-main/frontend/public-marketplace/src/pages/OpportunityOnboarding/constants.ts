/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
import { ComponentType } from 'react'
import { PageTypeKeys } from 'interfaces/OpportunityOnboarding'
import Loader from 'components/Loader'
import JobInfoSection from './components/JobInfoSection'
// import InvestmentProposalSection from './components/FinalStep/components/InvestmentProposalSection'
import WillReviewSection from './components/FinalStep/components/WillReviewSection'
import RadioButtonBlock from './components/RadioButtonBlock'
import DummyPage from './components/DummyPage'
import CheckboxBlock from './components/CheckboxBlock'
import UserDocsBlock from './components/UserDocsBlock'
import ApprovalCheckboxes from './components/ApprovalCheckboxes'
import KeyInvestorInformationBlock from './components/KeyInvestorInformationBlock'
import CustomSmartBlock from './components/CustomSmartBlock'
import FinalStepBlock from './components/FinalStep'

const pageTypes: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key in PageTypeKeys]: { comp: ComponentType<any>; title: string }
} = {
	jobsInfo: { title: 'Investor Information', comp: JobInfoSection },
	finalStep: {
		title: '',
		comp: FinalStepBlock,
	},
	willReview: { title: '', comp: WillReviewSection },
	radioButtonBlock: { title: '', comp: RadioButtonBlock },
	checkboxBlock: { title: '', comp: CheckboxBlock },
	userDocsBlock: { title: 'Upload Documents', comp: UserDocsBlock },
	keyInvestmentInformationBlock: {
		title: '',
		comp: KeyInvestorInformationBlock,
	},
	approvalCheckboxesBlock: { title: '', comp: ApprovalCheckboxes },
	dummy: { title: 'This is not ready yet', comp: DummyPage },
	loader: { title: '', comp: Loader },
	// @ts-ignore
	smartBlock: { title: '', comp: CustomSmartBlock },
}

const getCriteriaBlockAnswer = (
	criteriaBlock: any,
	fundCriteriaResponse: any,
) =>
	fundCriteriaResponse?.user_response?.user_block_responses?.find(
		(block: { block_id: any }) => block.block_id === criteriaBlock.id,
	)

export { pageTypes, getCriteriaBlockAnswer }
