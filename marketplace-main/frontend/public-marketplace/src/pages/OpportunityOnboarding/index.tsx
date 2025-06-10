import { useState, useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
	IEligibilityData,
	PageTypeKeys,
} from 'interfaces/OpportunityOnboarding'
import { ICriteriaBlock } from 'interfaces/OpportunityOnboarding/criteria'
import {
	getEligibilityDocs,
	getEligibilityStatus,
	updateCriteriaPosition,
	getEligibilityData,
	fetchCriteriaBlock,
} from 'services/OpportunityOnboarding'
import { MODIFY_ELIGBILITY } from 'constants/urlHashes'
import {
	PREVIEW_GENERIC_BLOCK_CODE,
	CHECKBOX_BLOCKS,
	APPROVAL_CHECKBOXES,
	KEY_INVESTMENT_INFORMATION,
} from 'constants/eligibility_block_codes'
import { IRequiredDocument } from 'interfaces/OpportunityOnboarding/documents_required'
import { PageWrapper } from 'components/Page'
import { defaultHPadding } from 'constants/global'
import Card from './components/Card'
import { pageTypes } from './constants'
import { useGetFundDetailsQuery } from '../../api/rtkQuery/fundsApi'
import { get } from 'lodash'
import { logMixPanelEvent } from 'utils/mixpanel'

const OpportunityOnboarding = () => {
	const { externalId } = useParams<{ externalId: string }>()
	const location = useLocation()
	const refApp = useRef<HTMLDivElement>(null)
	const isModify = location.hash === MODIFY_ELIGBILITY
	const {data: fundDetails} = useGetFundDetailsQuery(externalId);

	const [isNew, setIsNew] = useState(false)
	const [currentBlock, setCurentBlock] = useState<any>(null)
	const [eligibilityData, setEligibilityData] = useState<IEligibilityData>({})
	const [isEligible, setIsEligible] = useState(false)
	const [requiredDocuments, setRequiredDocuments] = useState<
		IRequiredDocument[]
	>([])

	console.log('fund data is =======>>>>>>>>', fundDetails)

	const currency = get(fundDetails, 'currency', null)
	const offerLeverage = get(fundDetails, 'offer_leverage', true)

	const {
		criteria_preview: fundCriteriaPreview,
		user_response: fundCriteriaResponse,
	} = eligibilityData

	const is_smart_criteria = get(fundCriteriaPreview, 'is_smart_criteria')

	const chooseComp = (criteriaBlock: ICriteriaBlock | null | undefined) => {
		let comp = ''
		if (criteriaBlock) {
			if (criteriaBlock.is_user_documents_step) {
				comp = 'userDocsBlock'
				// comp = 'dummy'
			} else if (criteriaBlock.is_final_step) {
				comp = 'finalStep'
			} else if (criteriaBlock.is_country_selector) {
				comp = 'jobsInfo'
			} else if (
				[...PREVIEW_GENERIC_BLOCK_CODE].includes(
					criteriaBlock.block?.block_id,
				)
			) {
				comp = 'radioButtonBlock'
			} else if (
				CHECKBOX_BLOCKS.includes(criteriaBlock.block?.block_id)
			) {
				comp = 'checkboxBlock'
			} else if (
				[APPROVAL_CHECKBOXES].includes(criteriaBlock.block?.block_id)
			) {
				comp = 'approvalCheckboxesBlock'
			} else if (
				[KEY_INVESTMENT_INFORMATION].includes(
					criteriaBlock.block?.block_id,
				)
			) {
				comp = 'keyInvestmentInformationBlock'
			} else if (criteriaBlock?.is_custom_block) {
				comp = 'smartBlock'
			} else {
				comp = 'dummy'
			}
		} else {
			if (isNew) {
				comp = 'jobsInfo'
			} else {
				comp = 'loader'
			}
		}

		return comp
	}
	const updatePositionOnApi = (position: number) => {
		if (fundCriteriaResponse && currentBlock?.is_user_documents_step) {
			const payload = { last_position: position }
			if (fundCriteriaResponse)
				updateCriteriaPosition(fundCriteriaResponse.id, payload)
		}
	}

	const getDocsAndStatus = async (_id: string | number) => {
		const docsRes = await getEligibilityDocs(_id)
		if (docsRes.success) {
			setRequiredDocuments(docsRes.data)
		}
		const statusRes = await getEligibilityStatus(_id)
		if (statusRes.success) {
			setIsEligible(statusRes.data.is_eligible)
		}
	}

	const handleFetchNextBlock = async () => {
		await getDocsAndStatus(fundCriteriaResponse?.id as number)
		const blockId =
			fundCriteriaResponse?.user_block_responses.length === 1
				? fundCriteriaResponse?.user_block_responses[0].block_id
				: fundCriteriaResponse?.last_position
		if (blockId) {
			const nextBlock = await fetchCriteriaBlock(
				blockId,
				'next',
				externalId as string,
			)
			setCurentBlock(nextBlock.data)
		}
	}

	const getValidBlock = (block: any) => {
		const finalStep = fundCriteriaPreview?.criteria_blocks.find(
			block => block.is_final_step,
		)
		const userDocumentStep = fundCriteriaPreview?.criteria_blocks.find(
			block => block.is_user_documents_step,
		)
		if (!is_smart_criteria) {
			if (currentBlock.is_user_documents_step) {
				return finalStep
			} else if (
				block.is_final_step &&
				isEligible &&
				requiredDocuments.length > 0
			) {
				return userDocumentStep
			}
		}
		if (block) {
			if (!block.is_user_documents_step) {
				return block
			} else if (
				block.is_user_documents_step &&
				isEligible &&
				requiredDocuments.length > 0
			) {
				return block
			} else if (block.is_user_documents_step && !isEligible) {
				return finalStep
			} else {
				return finalStep
			}
		} else {
			return finalStep
		}
	}

	const handleNext = async () => {
		let nextBlock = null
		let validBlock = null
		const res = await fetchCriteriaBlock(
			currentBlock.id,
			'next',
			externalId as string,
		)
		validBlock = getValidBlock(res.data || nextBlock)

		if (validBlock) {
			setCurentBlock(validBlock)
			// setPreviousBlocks([...previousBlocks, currentBlock])
			updatePositionOnApi(currentBlock.id)
			logMixPanelEvent('Onboarding Next step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
		}
	}
	const handleBack = async () => {
		let previousBlock = await fetchCriteriaBlock(
			currentBlock.id,
			'previous',
			externalId as string,
		).then(res => res.data)

		const finalStep = fundCriteriaPreview?.criteria_blocks.find(
			block => block.is_final_step,
		)
		const userDocumentStep = fundCriteriaPreview?.criteria_blocks.find(
			block => block.is_user_documents_step,
		)
		if (is_smart_criteria) {
			if (
				(previousBlock.is_user_documents_step && !isEligible) ||
				(previousBlock.is_user_documents_step &&
					isEligible &&
					requiredDocuments.length === 0)
			) {
				previousBlock = await fetchCriteriaBlock(
					previousBlock.id,
					'previous',
					externalId as string,
				).then(res => res.data)
				setCurentBlock(previousBlock)
			} else {
				setCurentBlock(previousBlock)
			}
		} else {
			if (
				currentBlock.is_final_step &&
				isEligible &&
				requiredDocuments.length > 0
			) {
				setCurentBlock(userDocumentStep)
			} else if (currentBlock.is_user_documents_step) {
				previousBlock = await fetchCriteriaBlock(
					finalStep?.id,
					'previous',
					externalId as string,
				).then(res => res.data)
				setCurentBlock(previousBlock)
			} else if (
				(previousBlock.is_user_documents_step &&
					isEligible &&
					requiredDocuments.length === 0) ||
				(previousBlock.is_user_documents_step && !isEligible)
			) {
				previousBlock = await fetchCriteriaBlock(
					previousBlock.id,
					'previous',
					externalId as string,
				).then(res => res.data)
				setCurentBlock(previousBlock)
			} else {
				setCurentBlock(previousBlock)
			}
		}
		logMixPanelEvent('Onboarding back step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
	}

	const updateEligibilityFlow = (flow: IEligibilityData) => {
		setEligibilityData(flow)
	}

	const handleFetchEligibilityFlow = async () => {
		const res = await getEligibilityData(externalId as string)
		if (res.success) {
			updateEligibilityFlow(res.data)
		} else {
			setIsNew(true)
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleUpdateFundCriteriaResponse = async (responseUpdate: any) => {
		await getDocsAndStatus(fundCriteriaResponse?.id as number)
		const newResponse = { ...fundCriteriaResponse }
		const idx = newResponse.user_block_responses?.findIndex(
			bl => bl.block_id === responseUpdate.block_id,
		)
		newResponse.user_block_responses?.splice(
			idx as number,
			1,
			responseUpdate,
		)

		setEligibilityData(
			prev =>
				({ ...prev, user_response: newResponse } as IEligibilityData),
		)
	}

	const currentPage = pageTypes[chooseComp(currentBlock) as PageTypeKeys]

	useEffect(() => {
		if (!isModify) {
			handleFetchEligibilityFlow()
		}
	}, [])

	useEffect(() => {
		if (
			fundCriteriaResponse &&
			fundCriteriaPreview &&
			(!currentBlock || currentBlock?.is_country_selector)
		) {
			handleFetchNextBlock()
		}
	}, [fundCriteriaResponse])

	useEffect(() => {
		refApp.current?.scrollIntoView()
		// window.scrollBy(0, -130)
		window.scrollTo(0, 0)
	}, [currentBlock])
	return (
		<PageWrapper>
			<div
				ref={refApp}
				style={{ minHeight: '80vh', padding: `0px ${defaultHPadding}` }}
			>
				<Card title={currentPage?.title}>
					<currentPage.comp
						handleNext={handleNext}
						handleBack={handleBack}
						updateFundCriteriaResponse={
							handleUpdateFundCriteriaResponse
						}
						externalId={externalId}
						criterialId={fundCriteriaPreview?.id}
						responseId={fundCriteriaResponse?.id}
						criteriaName={fundCriteriaPreview?.name}
						selectedAnswer={fundCriteriaResponse?.user_block_responses.find(
							res => res.block_id === currentBlock?.id,
						)}
						updateEligibilityFlow={updateEligibilityFlow}
						criteriaBlock={currentBlock}
						requiredDocuments={requiredDocuments}
						refreshDocsAndStatus={() =>
							getDocsAndStatus(fundCriteriaResponse?.id as number)
						}
						investmentAmount={
							fundCriteriaResponse?.investment_amount
						}
						minimumInvestment={fundCriteriaResponse?.min_investment}
						isEligible={isEligible}
						fundCriteriaPreview={fundCriteriaPreview}
						fundCriteriaResponse={eligibilityData}
						currency={currency}
						offerLeverage={offerLeverage}
					/>
				</Card>
			</div>
		</PageWrapper>
	)
}

export default OpportunityOnboarding
