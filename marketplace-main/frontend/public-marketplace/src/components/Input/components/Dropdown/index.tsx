import CustomInput, { SubFieldType } from 'components/Input'
import Select, { OptionTypeBase } from 'react-select'

interface DropdownProps {
	value: OptionTypeBase | null | undefined
	onChange: (e: OptionTypeBase) => void
	options: OptionTypeBase[]
	fieldId: string
	subField: SubFieldType | undefined
	disabled: boolean
}

const DropDown = (props: DropdownProps) => {
	const { value, onChange, options, fieldId, subField, disabled } = props
	return (
		<>
			<Select
				id={fieldId}
				placeholder=''
				onChange={onChange}
				className='dropDown-field'
				// value={value}
				// value={options.find(opt => opt.value === value)}
				value={options.find(
					opt => JSON.stringify(opt) === JSON.stringify(value),
				)}
				options={options}
				isDisabled={disabled}
			/>
			{subField && (
				<div>
					<CustomInput {...subField} error='' />
				</div>
			)}
		</>
	)
}

export default DropDown
