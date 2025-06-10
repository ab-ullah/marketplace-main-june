/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
import React, { FunctionComponent } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { ErrorMessage } from 'formik'
import Row from 'react-bootstrap/Row'
import isNil from 'lodash/isNil'
import ToolTip from '../../ToolTip'
import { ToolTipText, isToolTipText } from '../../ToolTip/interfaces'

interface FormTextFieldProps {
	label: string
	name: string
	placeholder?: string
	onChange: any
	onBlur: any
	onFocus: any
	hideError?: boolean
	value: string | number | string[] | undefined
	helpText?: string | ToolTipText
	disabled?: boolean
	multiline?: boolean
	maxLength?: number
	inlineLabel?: boolean
}

const FormTextField: FunctionComponent<FormTextFieldProps> = ({
	label,
	name,
	placeholder,
	onChange,
	onBlur,
	onFocus,
	helpText,
	hideError,
	value,
	disabled,
	multiline,
	maxLength,
	inlineLabel,
}) => (
	<Row className='mt-2'>
		<Col md={inlineLabel ? 4 : 12} className='field-label'>
			{label}
			{isToolTipText(helpText) && <ToolTip {...helpText} />}
		</Col>
		{typeof helpText === 'string' && (
			<Col md={8} className='field-help-text'>
				<span>{helpText}</span>
			</Col>
		)}
		<Col md={inlineLabel ? 8 : 12}>
			<Form.Group controlId='formFilterValue'>
				<Form.Control
					type={multiline ? undefined : 'text'}
					name={name}
					placeholder={placeholder}
					onChange={onChange}
					onBlur={onBlur}
					onFocus={onFocus}
					value={value}
					disabled={disabled}
					as={multiline ? 'textarea' : undefined}
					rows={
						multiline
							? !isNil(value)
								? Math.max(
										(value as unknown as string).length /
											50,
										3,
								  )
								: 3
							: undefined
					}
					maxLength={maxLength}
				/>
				{!hideError && (
					<ErrorMessage
						name={name}
						className='text-danger'
						component='div'
					/>
				)}
			</Form.Group>
		</Col>
	</Row>
)

FormTextField.defaultProps = {
	inlineLabel: true,
}

export default FormTextField
