/* eslint-disable prefer-destructuring */
import { useState, useEffect } from 'react'
import { TextChangeEventType } from 'interfaces/common/input'
import { isNumStr } from 'utils/helpers'
import { handleFormatToCurrency, handleFormatToNum } from 'utils/currency'
import { Cont, PrefixText, StyledInput } from './styled'

interface TextInputProps {
	value: string | number | undefined
	onChange: (e: string | number) => void
	fieldId: string
	prefix?: string
	format?: string
	disabled: boolean
	currency: string,
	symbol: string
}



const TextInput = (props: TextInputProps) => {
	const { value, onChange, fieldId, prefix, format, disabled, currency, symbol } = props
	const [displayState, setDisplayState] = useState(value)

	useEffect(() => {
		if (value) {
			if (format === 'currency') {
				if (typeof value === 'string') {
					if (isNumStr(value as string)) {
						setDisplayState(
							handleFormatToCurrency(value as string, currency),
						)
					}
				} else {
					onChange(value.toString())
				}
			} else {
				setDisplayState(value)
			}
		} else {
			setDisplayState('')
		}
	}, [value])

	const handleChange = (e: TextChangeEventType) => {
		let inputValue = e?.target?.value

		if (format === 'currency' && inputValue) {
			inputValue = handleFormatToNum(inputValue, symbol)
		}
		onChange(inputValue || '')
	}
	return (
		<Cont>
			{prefix ? <PrefixText>{prefix}</PrefixText> : null}
			<StyledInput
				sx={prefix ? { padding: '13px 70px' } : {}}
				value={displayState}
				id={fieldId}
				onChange={handleChange}
				disabled={disabled}
			/>
		</Cont>
	)
}

export default TextInput

TextInput.defaultProps = {
	prefix: undefined,
	format: undefined,
}
