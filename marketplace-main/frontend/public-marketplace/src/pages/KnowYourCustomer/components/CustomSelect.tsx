import React, { FunctionComponent, useEffect } from 'react'
import { OptionTypeBase } from 'react-select'
import { DEFAULT_NON_SELECTABLE_OPTION } from '../constants'
import { CustomSelectTypeData } from '../../../interfaces/workflows'
import { FieldComponent } from '../interfaces'
import SelectorField from '../../../components/SelectorField'
import { InnerFieldContainer } from '../styles'
import { useField } from '../hooks'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CustomSelectProps extends FieldComponent {}
const CustomSelect: FunctionComponent<CustomSelectProps> = ({ question, customOnBlur }) => {
	const { field, meta, helpers, handleBlur, handleFocus, isFocused } =
		useField(question.id, question.type)
	const data = question.data as CustomSelectTypeData
	const unparsedOptions = [DEFAULT_NON_SELECTABLE_OPTION].concat(data.options)

	const options = unparsedOptions.map(option => ({
		value: option.value,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		label: option.label ?? (option as any).name,
	}))

	const handleChange = (e: OptionTypeBase) => {
		helpers.setValue(e.value)
	}

	const wrapOnBlur = (e: OptionTypeBase) => {
		if (customOnBlur) {
			customOnBlur(e)
		}
		handleBlur(e)
	}

	useEffect(() => {
		if (
			field.value &&
			// eslint-disable-next-line eqeqeq
			!data.options.find(option => option.value == field.value)
		) {
			helpers.setValue(DEFAULT_NON_SELECTABLE_OPTION.value)
		}
	}, [field.value, data.options])

	const lookupOption =
		typeof field.value === 'string' || typeof field.value === 'number'

	return (
		<InnerFieldContainer>
			<SelectorField
				name={question.id}
				label={question.label}
				options={options}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={wrapOnBlur}
				value={
					lookupOption
						? // eslint-disable-next-line eqeqeq
						  options.find(option => option.value == field.value)
						: field.value
				}
				placeholder={DEFAULT_NON_SELECTABLE_OPTION.value as string}
				helpText={question.helpText}
			/>
			{!isFocused && meta.touched && meta.error && (
				<div>{meta.error}</div>
			)}
		</InnerFieldContainer>
	)
}

export default CustomSelect
