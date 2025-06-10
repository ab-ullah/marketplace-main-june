/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
import React, { FunctionComponent } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { ErrorMessage } from 'formik'
import Row from 'react-bootstrap/Row'
import ToolTip from '../../ToolTip'
import { ToolTipText, isToolTipText } from '../../ToolTip/interfaces'

interface FormNumberFieldProps {
	label: string
	name: string
	placeholder?: string
	onChange: any
	onBlur: any
	onFocus?: any
	min?: number
	max?: number
	hideError?: boolean
	value: string | number | string[] | undefined
	helpText?: string | ToolTipText
}

const FormNumberField: FunctionComponent<FormNumberFieldProps> = ({
	label,
	name,
	placeholder,
	onChange,
	onBlur,
	onFocus,
	min,
	max,
	hideError,
	value,
	helpText,
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
			<Form.Group controlId='formFilterValue'>
				<Form.Control
					type='number'
					name={name}
					placeholder={placeholder}
					onChange={onChange}
					onBlur={onBlur}
					onFocus={onFocus}
					min={min}
					max={max}
					value={value}
				/>
				{!hideError && <ErrorMessage name={name} component='div' />}
			</Form.Group>
		</Col>
	</Row>
)

export default FormNumberField
