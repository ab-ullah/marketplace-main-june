/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent } from 'react'
import Form from 'react-bootstrap/Form'
import Select, { OptionTypeBase } from 'react-select'
import { ErrorMessage } from 'formik'

interface FormSelectorFieldProps {
	label: string
	name: string
	className?: string
	placeholder: string
	onChange: any
	onBlur?: any
	value: OptionTypeBase | readonly OptionTypeBase[] | null | undefined
	options: OptionTypeBase[]
	helpText?: string
	hideErrorMessage?: boolean
	disabled?: boolean
}

const SelectorInput: FunctionComponent<FormSelectorFieldProps> = ({
	label,
	name,
	className,
	placeholder,
	onChange,
	value,
	options,
	onBlur,
	disabled,
	helpText,
	hideErrorMessage,
}) => (
	<Form.Group controlId={name} className={`mb-2 ${className}`}>
		<Form.Label className='field-label'>{label}</Form.Label>
		<Select
			placeholder={placeholder}
			onChange={onChange}
			className='basic-single'
			classNamePrefix='select'
			isSearchable
			value={value}
			name={name}
			options={options}
			onBlur={onBlur}
			isDisabled={disabled}
		/>
		{!hideErrorMessage && (
			<ErrorMessage name={name} className='errorText' component='div' />
		)}
		{helpText && <div className='helpText'>{helpText}</div>}
	</Form.Group>
)

SelectorInput.defaultProps = {
	className: '',
	disabled: false,
}

export default SelectorInput
