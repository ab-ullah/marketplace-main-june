import { ComponentType } from 'react'
import { TextChangeEventType } from 'interfaces/common/input'
import { OptionTypeBase } from 'react-select'
import { Cont, HelperText, HintText, Title, ErrorText } from './styled'
import DropDown from './components/Dropdown'
import RadioButton from './components/RadioButton'
import TextInput from './components/TextInput'
import CheckBoxInput from './components/CheckBoxInput'

export type InputTypeKeys = 'text' | 'dropdown' | 'radio' | 'checkbox'

export type SizeTypes = 'sm' | 'md' | 'lg' | 'fit-content'

export interface OptionsType {
	value: string | number
	label: string | number
}

export type HandleChangeValueType = string | number | OptionTypeBase
// export type ValueType = string | number | OptionTypeBase | null | undefined
export type ValueType = HandleChangeValueType | null | undefined

export interface SubFieldType {
	title: string
	fieldId: string
	type: InputTypeKeys
	options: OptionTypeBase[]
	value: ValueType
	handleChange: (e: HandleChangeValueType) => void
}

export interface FieldType {
	title: string
	type?: InputTypeKeys
	options?: OptionTypeBase[]
	fieldId: string
	size?: SizeTypes
	prefix?: string
	helperText?: string
	hintText?: string
	format?: string
	subField?: SubFieldType
	currency?: string
	symbol?: string
}

interface CustomInputProps extends FieldType {
	handleChange: (e: HandleChangeValueType) => void
	value: ValueType
	error: string | undefined
	disabled?: boolean
}

const getWidth = (size: SizeTypes) => {
	let width = ''
	switch (size) {
		case 'sm':
			width = '33%'
			break
		case 'md':
			width = '67%'
			break
		case 'lg':
			width = '100%'
			break
		case 'fit-content':
			width = 'fit-content'
			break
		default:
			break
	}
	return width
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inputTypes: { [key in InputTypeKeys]: ComponentType<any> } = {
	text: TextInput,
	dropdown: DropDown,
	radio: RadioButton,
	checkbox: CheckBoxInput,
}

const CustomInput = (props: CustomInputProps) => {
	const {
		title,
		type = 'text',
		value,
		handleChange,
		options,
		fieldId,
		size = 'lg',
		prefix,
		helperText,
		hintText,
		format,
		subField,
		error,
		disabled,
		currency,
		symbol
	} = props

	const generateChangeObj = (
		e:
			| TextChangeEventType
			| OptionTypeBase
			| Record<string, boolean>
			| (string | number),
	) => {
		handleChange(
			(e as TextChangeEventType).target
				? (e as TextChangeEventType).target.value
				: (e as OptionTypeBase).value
				? // ? (e as OptionTypeBase).value
				  (e as OptionTypeBase)
				: e,
		)
	}

	const InputComp = inputTypes[type]
	return (
		<Cont sx={{ width: getWidth(size) }}>
			<Title>{title}</Title>
			{helperText && <HelperText>{helperText}</HelperText>}
			<InputComp
				fieldId={fieldId}
				value={value}
				onChange={generateChangeObj}
				options={options}
				subField={subField}
				prefix={prefix}
				format={format}
				disabled={disabled}
				symbol={symbol}
				currency={currency }
			/>
			{error && <ErrorText>{error}</ErrorText>}
			{hintText && <HintText>{hintText} </HintText>}
		</Cont>
	)
}

export default CustomInput

CustomInput.defaultProps = {
	type: 'text',
	options: [],
	subField: undefined,
	size: 'lg',
	prefix: undefined,
	helperText: undefined,
	hintText: undefined,
	format: undefined,
	disabled: false,
}
