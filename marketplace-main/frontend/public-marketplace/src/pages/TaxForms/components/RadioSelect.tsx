import React, { ChangeEvent, FunctionComponent } from 'react'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { ErrorMessage } from 'formik'
import { InnerFieldContainer } from '../styles'
import { FieldComponent } from '../interfaces'
import { CustomSelectTypeData } from '../../../interfaces/workflows'
import { useField } from '../hooks'

type RadioSelectProps = FieldComponent

const RadioSelect: FunctionComponent<RadioSelectProps> = ({ question }) => {
	const { field, helpers, handleBlur, handleFocus, isFocused } = useField(
		question.id,
		question.type,
	)
	const { options } = question.data as CustomSelectTypeData

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		helpers.setValue(e.target.id)
	}

	return (
		<InnerFieldContainer>
			<Row className='mt-2'>
				<Col md={4} className='field-label'>
					{question.label}
				</Col>
				{question.helpText && (
					<Col md={8} className='field-help-text'>
						<span>{question.helpText as string}</span>
					</Col>
				)}
				<Col md={8}>
					<Row>
						{options.map(option => {
							const isChecked = option.value == field.value // eslint-disable-line eqeqeq
							return (
								<Form.Check
									key={option.label}
									inline
									className={isChecked ? 'selectedRadio' : ''}
									onBlur={handleBlur}
									onFocus={handleFocus}
								>
									<Form.Check.Input
										id={option.value as string}
										name={question.id}
										type='radio'
										checked={isChecked}
										onChange={handleChange}
									/>
									<Form.Check.Label
										htmlFor={option.value as string}
									>
										{option.label}
									</Form.Check.Label>
								</Form.Check>
							)
						})}
					</Row>
					{!isFocused && (
						<ErrorMessage name={question.id} component='div' />
					)}
				</Col>
			</Row>
		</InnerFieldContainer>
	)
}

export default RadioSelect
