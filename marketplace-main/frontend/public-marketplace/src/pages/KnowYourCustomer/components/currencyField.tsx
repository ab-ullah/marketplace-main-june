import React, {ChangeEvent, FunctionComponent} from 'react'
import { Form } from 'react-bootstrap'
import { ErrorMessage } from 'formik'
import { useParams } from 'react-router-dom'
import { TextTypeData } from '../../../interfaces/workflows'
import { FieldComponent } from '../interfaces'
import { InnerFieldContainer, CurrencyInput } from '../styles'
import { useField } from '../hooks'
// import { useGetFundDetailsQuery } from "../../../api/rtkQuery/fundsApi";
import { isToolTipText } from '../../../components/ToolTip/interfaces'
import ToolTip from '../../../components/ToolTip'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CurrencyFieldProps extends FieldComponent {}

const CurrencyField: FunctionComponent<CurrencyFieldProps> = ({ question, customOnBlur }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const { externalId } = useParams<{ externalId: string }>()
	//   const { data: fundDetails } = useGetFundDetailsQuery(externalId);
	//   const currencyCode = fundDetails?.currency
	//     ? fundDetails?.currency.code
	//     : "USD";
	// TODO remove this hardcoded declaration
	const currencyCode = 'USD'
	const { field, helpers, handleBlur, handleFocus } = useField(
		question.id,
		question.type,
	)
	const { placeholder } = question.data as TextTypeData

	const handleChange = (value: string) => {
		helpers.setValue(value)
	}

	const wrapOnBlur = (e: ChangeEvent<HTMLInputElement>) => {
		if(customOnBlur){
			customOnBlur(e)
		}
		return handleBlur(e)
	}

	return (
		<InnerFieldContainer>
			<Form.Label className='field-label'>
				{question.label}
				{isToolTipText(question.helpText) && (
					<ToolTip {...question.helpText} />
				)}
			</Form.Label>
			{typeof question.helpText === 'string' && (
				<span>{question.helpText}</span>
			)}
			<CurrencyInput
				name={question.id}
				label={question.label}
				placeholder={placeholder}
				thousandSeparator
				prefix={`${currencyCode} `}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onValueChange={(values: { value: any }) => {
					const { value } = values
					handleChange(value)
				}}
				onBlur={wrapOnBlur}
				onFocus={handleFocus}
				value={field.value ? field.value : 0}
			/>
			<ErrorMessage
				name={question.id}
				component='div'
				className='errorText'
			/>
		</InnerFieldContainer>
	)
}

export default CurrencyField
