import React, { ChangeEvent, FunctionComponent, ReactNode } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import classNames from 'classnames'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { ErrorMessage } from 'formik'
import { InnerFieldContainer, CheckboxWrapper } from '../styles'
import { FieldComponent } from '../interfaces'
import { CustomSelectTypeData } from '../../../interfaces/workflows'
import { useField } from '../hooks'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CheckboxSelectProps extends FieldComponent {}

const Checkbox: FunctionComponent<CheckboxSelectProps> = ({ question, customOnBlur }) => {
	const { field, helpers, handleBlur, handleFocus, isFocused } = useField(
		question.id,
		question.type,
	)
	const { options } = question.data as CustomSelectTypeData

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (question.disabled) return

		if (field.value !== '') helpers.setValue('')
		else helpers.setValue(e.target.id)
	}

	const wrapOnBlur = (e: ChangeEvent<HTMLInputElement>) => {
		if(customOnBlur){
			customOnBlur(e)
		}
		return handleBlur(e)
	}

	return (
		<InnerFieldContainer>
			<Row className='mt-2'>
				<Col md={4} className='field-label'>
					{question.label}
				</Col>
				{question.helpText && (
					<Col md={8} className='field-help-text'>
						<span>{question.helpText as ReactNode}</span>
					</Col>
				)}
				<Col md={8}>
					<Row>
						<CheckboxWrapper>
							{options.map(option => {
								const isChecked = option.value == field.value // eslint-disable-line eqeqeq
								return (
									<Form.Check
										key={option.label}
										inline
										className={classNames({
											selectedRadio: isChecked,
										})}
										onBlur={wrapOnBlur}
										onFocus={handleFocus}
									>
										<Form.Check.Input
											id={option.value as string}
											name={question.id}
											type='checkbox'
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
						</CheckboxWrapper>
					</Row>
					{!isFocused && (
						<ErrorMessage name={question.id} component='div' />
					)}
				</Col>
			</Row>
		</InnerFieldContainer>
	)
}

export default Checkbox
