/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
import React, { FunctionComponent } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Select, { OptionTypeBase } from 'react-select'
import ToolTip from '../ToolTip'
import { ToolTipText, isToolTipText } from '../ToolTip/interfaces'

interface FormSelectorFieldProps {
	label: string
	name: string
	placeholder: string
	onChange: any
	onBlur?: any
	onFocus?: any
	value: OptionTypeBase | readonly OptionTypeBase[] | null | undefined
	options: OptionTypeBase[]
	disabled?: boolean
	helpText?: string | ToolTipText
}

const FormSelectorField: FunctionComponent<FormSelectorFieldProps> = ({
	label,
	name,
	placeholder,
	onChange,
	value,
	options,
	disabled,
	helpText,
	onFocus,
	onBlur,
}) => (
	<Row className='mt-2'>
		<Col md={4} className='field-label'>
			{label}
			{isToolTipText(helpText) && <ToolTip {...helpText} />}
		</Col>
		{typeof helpText === 'string' && (
			<Col md={8} className='field-help-text'>
				<span>{helpText}</span>
			</Col>
		)}
		<Col md={8}>
			<Form.Group controlId='rows'>
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
					onFocus={onFocus}
					isDisabled={disabled}
				/>
				{/* <ErrorMessage name={name} component="div"/> */}
			</Form.Group>
		</Col>
	</Row>
)

FormSelectorField.defaultProps = {
	disabled: false,
}

export default FormSelectorField
