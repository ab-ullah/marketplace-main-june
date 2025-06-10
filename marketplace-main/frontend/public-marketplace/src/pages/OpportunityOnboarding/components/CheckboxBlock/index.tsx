import { ICriteriaBlock } from 'interfaces/OpportunityOnboarding/criteria'
import { useState } from 'react'
import Button from 'components/Button/ThemeButton'
import CustomInput from 'components/Input'
import { OptionTypeBase } from 'react-select'
import { ButtonWrapper } from '../FinalStep/components/InvestmentProposalSection/styled'
import { ArrowBack, ArrowForward } from '@material-ui/icons'

interface CheckboxBlockProps {
	criteriaBlock: ICriteriaBlock
	handleNext: () => void
	handleBack: () => void
}

const CheckboxBlock = ({
	criteriaBlock,
	handleNext,
	handleBack,
}: CheckboxBlockProps) => {
	const { block } = criteriaBlock
	const { title, options, block_id } = block
	const [value, setValue] = useState<OptionTypeBase>({})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const generateOptionsObj = (_options: { individual: [any] }) => {
		const optArr = _options.individual
		const formattedOptions = optArr.map(
			(opt: { text: string; id: string }) => ({
				label: opt.text,
				value: opt.id,
			}),
		)

		return formattedOptions
	}

	const handleChange = (val: OptionTypeBase) => {
		setValue(val)
	}
	return (
		<>
			<CustomInput
				title={title}
				type='radio'
				value={value}
				handleChange={e => handleChange(e as OptionTypeBase)}
				options={generateOptionsObj(options)}
				fieldId={block_id}
				error=''
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
			<Button solo size='sm' position='right' onClick={handleNext}>
				<ArrowForward /> Next Step
			</Button>
			</ButtonWrapper>
		</>
	)
}

export default CheckboxBlock
