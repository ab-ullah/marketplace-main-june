/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, FunctionComponent } from 'react'
import { ErrorMessage } from 'formik'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import { FieldComponent } from '../interfaces'
import { useField } from '../hooks'
import { DateTypeData } from '../../../interfaces/workflows'
import { InnerFieldContainer } from '../styles'

type DateInputProps = FieldComponent

const DateInput: FunctionComponent<DateInputProps> = ({ question }) => {
	const { field, helpers, handleBlur, handleFocus, isFocused } = useField(
		question.id,
		question.type,
	)
	const { min, max, afterToday } = question.data as DateTypeData
	const minDate =
		min ?? afterToday ? new Date().toISOString().split('T')[0] : undefined

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		helpers.setValue(e.target.value)
	}

	return (
		<InnerFieldContainer>
			<Row className='mt-2'>
				<Col md={4} className='field-label'>
					{question.label}
				</Col>
				{question.helpText && (
					<Col md={8} className='field-help-text'>
						<span>{question.helpText as any}</span>
					</Col>
				)}
				<Col md={8}>
					<Form.Control
						type='date'
						name={question.id}
						min={minDate}
						max={max}
						onChange={handleChange}
						onFocus={handleFocus}
						onBlur={handleBlur}
						value={field.value}
					/>
					{!isFocused && (
						<ErrorMessage name={question.id} component='div' />
					)}
				</Col>
			</Row>
		</InnerFieldContainer>
	)
}

export default DateInput
