/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, useMemo } from 'react'
import find from 'lodash/find'
import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import omit from 'lodash/omit'
import isUndefined from 'lodash/isUndefined'
import Form from 'react-bootstrap/Form'
import Button from 'components/Button/ThemeButton'
import {InputBlock} from './styles'
import { updateResponseBlock } from '../../../../services/OpportunityOnboarding'
import { useAppDispatch, useAppSelector } from '../../../../app/hooks'
import { getCriteriaBlockAnswer } from '../../constants'
import { ArrowBack, ArrowForward } from '@material-ui/icons'
import { ButtonWrapper } from '../FinalStep/components/InvestmentProposalSection/styled'

interface ICustomSmartBlockProps {
	criteriaBlock: any
	fundCriteriaResponse: null | any
	handleNext: () => void
	updateFundCriteriaResponse: any
	fundCriteriaPreview: any
	handleBack: () => void
}

const CustomSmartBlock: FunctionComponent<ICustomSmartBlockProps> = ({
	criteriaBlock,
	fundCriteriaResponse,
	handleNext,
	handleBack,
	updateFundCriteriaResponse,
	fundCriteriaPreview,
}) => {
	const dispatch = useAppDispatch()
	const isLoading = false

	const selectedAnswer = getCriteriaBlockAnswer(
		criteriaBlock,
		fundCriteriaResponse,
	)
	const answerPayload = selectedAnswer ? selectedAnswer.response_json : {}

	const getDetails = (key: string) =>
		get(criteriaBlock, `custom_block.${key}`)

	const blockKey = getDetails('id')

	const isChecked = (fieldId: number) =>
		get(answerPayload, `${fieldId}`, false)

	const updateAnswer = async (value: boolean, optionIdx: number) => {
		if (!fundCriteriaPreview) return
		const selectedOption = get(getDetails('custom_fields'), `${optionIdx}`)
		const jsonPayload = omit(answerPayload, 'value')
		const responseJson = {
			...jsonPayload,
			[selectedOption.id]: value,
			[`${selectedOption.id}_option`]: selectedOption,
		}
		const payload = {
			block_id: criteriaBlock.id,
			response_json: responseJson,
			eligibility_criteria_id: fundCriteriaPreview.id,
		}
		const res = await updateResponseBlock(payload)
		if (res.success) {
			updateFundCriteriaResponse(res.data)
		}
	}

	const canMoveForward = useMemo(() => {
		const selectedField = find(
			getDetails('custom_fields'),
			(option: any) => answerPayload[option.id],
		)
		return !isUndefined(selectedField) && !isLoading
	}, [answerPayload, isLoading])

	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (!fundCriteriaPreview) return <></>

	return (
		<>
			<h4 className='mt-5 mb-4'>{getDetails('title')}</h4>
			{getDetails('description') && (
				<p className='mt-0'>{getDetails('description')}</p>
			)}
			{(getDetails('is_multiple_selection_enabled') === true && size(getDetails('custom_fields')) > 1) && (
				<p className='mt-0'>Please select all that apply.</p>
			)}
			<InputBlock key='inline-radio' className='mb-4 custom-radio-buttons'>
				{map(
					getDetails('custom_fields'),
					(option: any, idx: number) => (
						<div key={`custom-block-option-${idx}`}>
							<Form.Check
								className='mb-2'
								onClick={(e: any) =>
									updateAnswer(!isChecked(option.id), idx)
								}
								inline
								label={`${option.title}`}
								name={blockKey}
								value={option.title}
								checked={isChecked(option.id)}
								id={`accredited-${idx}`}
							/>
						</div>
					),
				)}
			</InputBlock>
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
				onClick={handleNext}
				disabled={!canMoveForward}
			>
				<ArrowForward /> Next Step
			</Button>
			</ButtonWrapper>
		</>
	)
}

export default CustomSmartBlock
