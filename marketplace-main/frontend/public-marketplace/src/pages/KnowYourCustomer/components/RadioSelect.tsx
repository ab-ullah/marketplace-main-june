/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { ChangeEvent, FunctionComponent } from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { ErrorMessage } from 'formik'
import { isToolTipText } from '../../../components/ToolTip/interfaces'
import { CustomSelectTypeData } from '../../../interfaces/workflows'
import CommentWrapper from '../components/CommentsWrapper'
import ToolTip from '../../../components/ToolTip'
import { FieldComponent } from '../interfaces'
import {
	InnerFieldContainer,
	RadioButton,
	RadioInner,
	RadioInput,
} from '../styles'
import { useField } from '../hooks'

type RadioSelectProps = FieldComponent

const RadioSelect: FunctionComponent<RadioSelectProps> = ({
	comments,
	question,
	customOnBlur
}) => {
	const { field, helpers, isFocused } = useField(question.id, question.type)
	const { options } = question.data as CustomSelectTypeData
	const { helpText, label } = question

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (question.disabled) return
		if (customOnBlur) {
			customOnBlur(e)
		}
		helpers.setValue(e.target.id)
	}

	const onClick = (value: string | number) => {
		helpers.setValue(value)
	}

	return (
		<InnerFieldContainer>
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
					<Row>
						{options.map(option => {
							const isChecked = option.value == field.value // eslint-disable-line eqeqeq
							return (
								<RadioButton
									key={option.value}
									checked={isChecked}
									onClick={() => onClick(option.value)}
								>
									<input
										type='radio'
										value={option.value}
										id={option.value.toString()}
										name={question.id}
										checked={isChecked}
										onChange={handleChange}
										onClick={() => onClick(option.value)}
									/>
									<RadioInput checked={isChecked}>
										<RadioInner checked={isChecked} />
									</RadioInput>
									<label>{option.label}</label>
								</RadioButton>
							)
						})}
					</Row>
					{!isFocused && (
						<ErrorMessage name={question.id} component='div' />
					)}
				</Col>
			</Row>
			{comments?.map(comment => (
				<CommentWrapper key={comment.id} comment={comment} />
			))}
		</InnerFieldContainer>
	)
}

export default RadioSelect
