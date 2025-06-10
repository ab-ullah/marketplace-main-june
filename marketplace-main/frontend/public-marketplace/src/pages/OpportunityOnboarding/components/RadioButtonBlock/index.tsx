import { useEffect, useMemo, useState } from 'react'
import { ICriteriaBlock } from 'interfaces/OpportunityOnboarding/criteria'
import Button from 'components/Button/ThemeButton'
import CustomInput, {
	InputTypeKeys,
	OptionsType,
	ValueType,
	HandleChangeValueType,
} from 'components/Input'
import { updateResponseBlock } from 'services/OpportunityOnboarding'
import { US_ACCREDITED_INVESTOR } from 'constants/eligibility_block_codes'
import { debounce } from 'lodash'
import { ArrowBack, ArrowForward } from '@material-ui/icons'
import { ButtonWrapper } from '../FinalStep/components/InvestmentProposalSection/styled'

interface RadioButtonBlockProps {
	criteriaBlock: ICriteriaBlock
	criterialId: number
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedAnswer: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateFundCriteriaResponse: (_res: any) => void
	handleNext: () => void
	handleBack: () => void
}

const RadioButtonBlock = ({
	criteriaBlock,
	criterialId,
	selectedAnswer,
	updateFundCriteriaResponse,
	handleNext,
	handleBack,
}: RadioButtonBlockProps) => {
	const { block, payload } = criteriaBlock
	const { title, block_id } = block
	let { options } = payload
	if (!options) options = block.options?.individual
	const answerValue = selectedAnswer?.response_json.value
	// const selectedAnswerOption=selectedAnswer?.response_json[`${answerValue}_option`]
	const acknowledgedValue =
		selectedAnswer?.response_json.acknowledged_value || false
	const certificateName = selectedAnswer?.response_json.certificate_name || ''

	const licenseType = selectedAnswer?.response_json.license_type || {}
	// const [hasAcknowledged,setHasAcknowledged]=useState(false)
	const [mainAnswer, setMainAnswer] = useState('')
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [subAnswer, setSubAnswer] = useState<any>({
		acknowledged_value: false,
		license_type: {},
		certificate_name: '',
	})

	useEffect(() => {
			setMainAnswer(answerValue || '')
	}, [answerValue])

	useEffect(() => {
		if (acknowledgedValue || Object.keys(licenseType).length > 0) {
			setSubAnswer({
				acknowledged_value: acknowledgedValue,
				license_type: licenseType,
				certificate_name: certificateName,
			})
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [acknowledgedValue, selectedAnswer?.response_json.license_type, certificateName])

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const generateOptionsObj = (_options: { text: string; id: string }[]) => {
		const formattedOptions = _options.map(
			(opt: { text: string; id: string }) => ({
				...opt,
				label: opt.text,
				value: opt.id,
			}),
		)

		return formattedOptions
	}

	const getSelectedOption = (optId: string) =>
		options.find((opt: { id: string }) => opt.id === optId)

	const updateAnswer = async (optId: string, _subAnswer = {}) => {
		const selectedOption = getSelectedOption(optId)
		const responseJson = {
			value: optId,
			[`${selectedOption.id}_option`]: selectedOption,
			...(US_ACCREDITED_INVESTOR === block_id ? _subAnswer : {}),
		}
		const answerPayload = {
			block_id: criteriaBlock.id,
			response_json: responseJson,
			eligibility_criteria_id: criterialId,
		}
		const res = await updateResponseBlock(answerPayload)
		if (res.success) {
			updateFundCriteriaResponse(res.data)
		}
	}

	const handleChangeMain = (val: string) => {
		setMainAnswer(val)
		updateAnswer(val, subAnswer)
	}

	const debouncedOnChange = useMemo(
		() => debounce(updateAnswer, 2000),
		[answerValue],
	)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleChangeSub = (e: any, attr?: string) => {
		const newSubAnswer = attr
			? { ...subAnswer, ...{ [attr]: e } }
			: { ...subAnswer, ...e }
		setSubAnswer(newSubAnswer)

		if (attr === 'certificate_name') {
			debouncedOnChange(mainAnswer, newSubAnswer)
		} else {
			updateAnswer(mainAnswer, newSubAnswer)
		}
		// setSubAnswer(prev => ({ ...prev, ...e }))
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const generateSubfield = (_selectedAnswer: any) => {
		const acknowledgementField = {
			title: '',
			fieldId: _selectedAnswer?.id,
			type: 'checkbox' as InputTypeKeys,
			options: [
				{
					value: 'acknowledged_value',
					label: _selectedAnswer?.acknowledgement_text,
				},
			] as OptionsType[],
			value: {
				acknowledged_value: subAnswer.acknowledged_value,
			} as ValueType,
			handleChange: (e: HandleChangeValueType) => handleChangeSub(e),
		}

		const textSubfield = {
			title: 'Name the certificate',
			fieldId: `${_selectedAnswer?.id}-text`,
			type: 'text',
			value: subAnswer.certificate_name,
			handleChange: (e: HandleChangeValueType) =>
				handleChangeSub(e, 'certificate_name'),
		}

		const selectorSubfield = {
			title: 'Please Select License Type',
			fieldId: _selectedAnswer?.id,
			type: 'dropdown' as InputTypeKeys,
			options: _selectedAnswer?.options as OptionsType[],
			value: subAnswer?.license_type,
			handleChange: (e: HandleChangeValueType) =>
				handleChangeSub(e, 'license_type'),
			subField: subAnswer?.license_type.require_text_details
				? textSubfield
				: undefined,
		}
		if (_selectedAnswer?.has_selector_options) return selectorSubfield
		if (_selectedAnswer?.require_acknowledgement)
			return acknowledgementField
		return undefined
	}

	const isValid = () => {
		if (mainAnswer) {
			const subField = generateSubfield(getSelectedOption(mainAnswer))
			if (subField) {
				if (subField.type === 'checkbox') {
					return subAnswer.acknowledged_value
				}
				if (subField.type === 'dropdown') {
					if (Object.keys(subAnswer?.license_type).length === 0) {
						return false
					}
					if (subAnswer?.license_type.require_text_details) {
						return !!subAnswer.certificate_name
					}
					return true
				}
			} else return true
		}

		return false
	}

	return (
		<>
			<CustomInput
				title={title}
				type='radio'
				value={mainAnswer}
				handleChange={e => handleChangeMain(e as string)}
				options={generateOptionsObj(options)}
				fieldId={block_id}
				error=''
				subField={generateSubfield(getSelectedOption(mainAnswer))}
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
				disabled={!isValid()}
				onClick={handleNext}
			>
				<ArrowForward /> Next Step
			</Button>
			</ButtonWrapper>
		</>
	)
}

export default RadioButtonBlock
