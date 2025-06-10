import CustomInput, {
	FieldType,
	HandleChangeValueType,
	ValueType,
} from 'components/Input'
import { FormikErrors } from 'formik'
// import { Dispatch, SetStateAction} from 'react'

const FieldInput = ({
	field,
	value,
	errors,
	// setValue,
	setValue,
}: {
	field: FieldType
	value: Record<string, ValueType>
	errors: FormikErrors<Record<string, string>>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setValue: (__field: string, __value: any, shouldValidate?: boolean) => void
}) => {
	const handleChange = (_value: HandleChangeValueType, fieldId: string) => {
		setValue(fieldId, _value)
	}
	const {
		title,
		type,
		options,
		fieldId,
		size,
		prefix,
		helperText,
		hintText,
		format,
		symbol,
		currency
	} = field
	const { [fieldId]: _value } = value
	const { [fieldId]: error } = errors
	return (
		<CustomInput
			title={title}
			type={type}
			options={options}
			fieldId={fieldId}
			size={size}
			prefix={prefix}
			helperText={helperText}
			hintText={hintText}
			format={format}
			handleChange={e => handleChange(e, fieldId)}
			value={_value}
			error={error}
			currency={currency}
			symbol={symbol}
		/>
	)
}

export default FieldInput
