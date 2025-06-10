import { isNaN } from "lodash"

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
	const useCurrency = currency
		? { style: 'currency', currency }
		: {}
	const formatter = new Intl.NumberFormat('en-US', useCurrency)
	return formatter
		.format(parseInt(amount as string, 10))
		.split('.')[0]
		.concat(
			hasDecimal(amount.toString())
				? '.'.concat(amount.split('.')[1])
				: '',
		)
}

const handleFormatToCurrency = (value: any, _currency= 'USD', _default_null_value: string = "-") => {
	if (!value)
		return _default_null_value
const _value = value?.toString() || '0'
	const dotEnd = _value.charAt(_value.length - 1) === '.'

	if (hasDecimal(_value)) {
		return formatCurrency(_value, _currency)
	}
	return formatCurrency(_value, _currency)
		.split('.')[0]
		.concat(dotEnd ? '.' : '')
}

function formatCarryCurrency(
	amount: number,
	currency: string,
	decimals: number = 2
): string {
	return amount.toLocaleString('en-US', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
}

const handleCarryFormatToCurrency = (value: any, _currency= 'USD', _default_null_value: string = "-") => {
	if (!value)
		return _default_null_value
	const _value = Number(value)
	return formatCarryCurrency(_value, _currency)
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

const formatCurrencyWithTwoDecimals = (value: any, currency = 'USD',_default_null_value: string = "-") => {
	if (!value)
		return _default_null_value
	const amount = value?.toString() || '0'
	const useCurrency = currency
		? { style: 'currency', currency }
		: {};
	const roundedAmount = parseFloat(amount).toFixed(2);
	const formatter = new Intl.NumberFormat('en-US', {
		...useCurrency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	return formatter.format(parseFloat(roundedAmount));
};

const formatWithParenthesis =(value:string, currency = 'USD',_default_null_value: string = "-")=>{
	const formattedValue = formatCurrencyWithTwoDecimals(value)
	if(isNaN(formattedValue)) return formattedValue
	if(formattedValue.charAt(0)==='-' && formattedValue.length>1) return `(${formattedValue.slice(1)})`
	return formattedValue
}

// export { hasDecimal, formatCurrency, handleFormatToCurrency, handleFormatToNum }
export {handleFormatToCurrency, formatCurrencyWithTwoDecimals, handleCarryFormatToCurrency, formatWithParenthesis}
