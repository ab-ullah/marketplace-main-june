import React, { ChangeEvent, FunctionComponent } from 'react'
import { TextTypeData } from '../../../../interfaces/workflows'
import { FieldComponent } from '../../interfaces'
import TextField from '../../../../components/Form/TextField'
import { InnerFieldContainer } from '../../styles'
import { useField } from '../../hooks'
import {OptionTypeBase} from "react-select";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TextInputProps extends FieldComponent {}

const TextInput: FunctionComponent<TextInputProps> = ({ question, customOnBlur }) => {
	const { field, helpers, handleBlur, handleFocus, isFocused } = useField(
		question.id,
		question.type,
	)
	const { multiline, placeholder, maxLength } = question.data as TextTypeData

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
			<TextField
				placeholder={placeholder}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={wrapOnBlur}
				value={field.value}
				label={question.label}
				name={question.id}
				helpText={question.helpText}
				hideError={isFocused}
				disabled={question.disabled}
				multiline={multiline}
				maxLength={maxLength ?? 120}
			/>
		</InnerFieldContainer>
	)
}

export default TextInput
