import React, { ChangeEvent, FunctionComponent } from 'react'
import { ErrorMessage } from 'formik'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import moment from 'moment'
import { isToolTipText } from '../../../components/ToolTip/interfaces'
import { DateTypeData } from '../../../interfaces/workflows'
import { FieldComponent } from '../interfaces'
import ToolTip from '../../../components/ToolTip'
import { useField } from '../hooks'
import { InnerFieldContainer } from '../styles'
import {OptionTypeBase} from "react-select";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DateInputProps extends FieldComponent {}
const DateInput: FunctionComponent<DateInputProps> = ({ question, customOnBlur }) => {
	const { field, helpers, handleBlur, handleFocus, isFocused } = useField(
		question.id,
		question.type,
	)
	const { min, max, afterToday } = question.data as DateTypeData
	const minDate =
		min ?? afterToday
			? moment().add(1, 'days').format('YYYY-MM-DD')
			: undefined

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		helpers.setValue(e.target.value)
	}

	const wrapOnBlur = (e: OptionTypeBase) => {
		if (customOnBlur) {
			customOnBlur(e)
		}
		handleBlur(e)
	}

	return (
		<InnerFieldContainer>
			<Row className='mt-2'>
				<Col md={4} className='field-label'>
					{question.label}
					{isToolTipText(question.helpText) && (
						<ToolTip {...question.helpText} />
					)}
				</Col>
				{typeof question.helpText === 'string' && (
					<Col md={8} className='field-help-text'>
						<span>{question.helpText}</span>
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
						onBlur={wrapOnBlur}
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
