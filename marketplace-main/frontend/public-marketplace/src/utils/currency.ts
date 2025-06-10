const hasDecimal = (number: string) => {
	if (number) {
		const decimal = number.split('.')[1]

		if (
			decimal &&
			!Number.isNaN(parseInt(decimal, 10)) &&
			parseInt(decimal, 10) > 0
		) {
			return true
		}
	}
	return false
}

const formatCurrency = (amount: string, currency = '') => {
	const useCurrency: Intl.NumberFormatOptions = currency
		? { style: 'currency', currency }
		: {}
	const formatter = new Intl.NumberFormat('en-US', useCurrency)
	return formatter
		.format(parseFloat(amount)) // Changed to parseFloat to handle decimal points
		.split('.')[0]
		.concat(
			hasDecimal(amount.toString())
				? '.'.concat(amount.split('.')[1])
				: '',
		)
}

const handleFormatToCurrency = (_value: string, _currency: string) => {
	const dotEnd = _value.charAt(_value.length - 1) === '.'

	if (hasDecimal(_value)) {
		return formatCurrency(_value, _currency)
	}
	return formatCurrency(_value, _currency)
		.split('.')[0]
		.concat(dotEnd ? '.' : '')
}

const handleFormatToNum = (currencyNum: string, currencySymbol: string) => {
	let inputValue = currencyNum
	const dotEnd = inputValue.charAt(inputValue.length - 1) === '.'
	let integral = ''
	let decimal = ''

	if (inputValue.charAt(0) !== currencySymbol && inputValue.length > 0) {
		inputValue = currencySymbol.concat(inputValue)
	}

	if (inputValue.charAt(0) === currencySymbol) {
		inputValue = inputValue?.split(currencySymbol)[1]
		integral = inputValue?.split('.')[0].split(',')?.join('')
		decimal = inputValue?.split('.')[1]

		if (hasDecimal(inputValue)) {
			inputValue = [integral, decimal].join('.')
		} else {
			inputValue = integral.concat(dotEnd ? '.' : '')
		}

		inputValue = inputValue.replace(/[^0-9. ]/g, '')
	}

	return inputValue
}

export { hasDecimal, formatCurrency, handleFormatToCurrency, handleFormatToNum }
