import { ChangeEvent } from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { OptionTypeBase } from 'react-select'
import CustomInput, { SubFieldType } from 'components/Input'
import { CustomOption } from './styled'

interface RadioButtonProps {
	value: string | null | undefined
	onChange: (e: string) => void
	options: OptionTypeBase[]
	fieldId: string
	subField?: SubFieldType
	disabled: boolean
}

const RadioButton = (props: RadioButtonProps) => {
	const { value, onChange, options, fieldId, subField, disabled } = props

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange((event.target as HTMLInputElement).value)
	}
	return (
		<RadioGroup
			sx={{ gap: '8px' }}
			aria-labelledby={fieldId}
			id={fieldId}
			name='controlled-radio-buttons-group'
			value={value}
			onChange={handleChange}
		>
			{options.map(opt => (
				<>
					<CustomOption
						disabled={disabled}
						key={opt.value}
						sx={
							opt.value === value
								? {
										background: 'rgba(226, 225, 236, 0.3)',
										border: '1px solid rgba(74, 71, 163, 0.5)',
								  }
								: {}
						}
						value={opt.value}
						control={
							<Radio
								sx={{
									height: '27px',
									width: '27px',
									marginRight: '18px',
								}}
							/>
						}
						label={opt.label}
					/>
					{subField && opt.value === subField.fieldId && (
						<div style={{ padding: '10px 16px 10px 43px' }}>
							<CustomInput {...subField} error='' />
						</div>
					)}
				</>
			))}
		</RadioGroup>
	)
}

export default RadioButton

RadioButton.defaultProps = {
	subField: undefined,
}
