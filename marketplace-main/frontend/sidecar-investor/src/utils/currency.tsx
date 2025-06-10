import TooltipWrapper from "../components/TooltipWrapper"
import get from "lodash/get";

const CURRENCY_LOCALES = {
	'AUD': 'en-AU'
}

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

	let locale = 'en-US'
	if (currency){
		locale = get(CURRENCY_LOCALES, currency, locale)
	}
	const formatter = new Intl.NumberFormat(locale, useCurrency)
	return formatter
		.format(parseInt(amount as string, 10))
		.split('.')[0]
		.concat(
			hasDecimal(amount.toString())
				? '.'.concat(amount.split('.')[1])
				: '',
		)
}

const handleFormatToCurrency = (value: any, _currency= 'USD') => {
const _value = value?.toString() || '0'
	const dotEnd = _value.charAt(_value.length - 1) === '.'

	if (hasDecimal(_value)) {
		return formatCurrency(_value, _currency)
	}
	return formatCurrency(_value, _currency)
		.split('.')[0]
		.concat(dotEnd ? '.' : '')
}

const formatCurrencyWithTwoDecimals = (value: any, currency = 'USD') => {
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

const limitDecimalPlaces=(input: number | string, decimalPlaces: number): string=> {
	const number = typeof input === 'string' ? parseFloat(input) : input;
	if (isNaN(number)) {
		return 'NaN';
	}
	const roundedNumber = +number.toFixed(decimalPlaces);
	return roundedNumber.toString();
}

export const truncateDecimal=(
	input: number | string, 
	decimals: number, 
	addEllipsis: boolean = false
  ): number | string =>{
	// Handle invalid decimals input
	if (decimals < 0 || !Number.isInteger(decimals)) {
	  throw new Error("The decimals parameter must be a non-negative integer.");
	}
  
	// Convert the value to a number
	const num = typeof input === 'string' ? parseFloat(input) : input;
  
	// Check if the value is a valid number
	if (isNaN(num)) {
	  return "NaN";
	}
  
	// Truncate the decimal places
	const factor = Math.pow(10, decimals);
	const truncated = Math.trunc(num * factor) / factor;
  
	if (addEllipsis && truncated !== num) {
	  return `${truncated}...`;
	}
  
	return truncated;
  }

const limitCarryDecimalPlaces = (input: number | string) => {
	if(!input) return '0'
	// return limitDecimalPlaces(input, 4)
	return <TooltipWrapper enable={input!=truncateDecimal(input,4,false)} text={input}>
          {truncateDecimal(input,4,true)}
        </TooltipWrapper>
}

const limitCarryMoneyDecimalPlaces = (input: number | string): string => {
	if(!input) return '0'
	return limitDecimalPlaces(input, 2)
}

const getLatestDate = (data: any[], key: string) => {
	if(!data) return ''
	const filteredData = data.filter(obj => obj[key] !== undefined && obj[key] !== null)
	if(filteredData.length === 0) return ''
	return filteredData.reduce((latest, current) => 
	  new Date(current[key]) > new Date(latest[key]) ? current : latest
	)[key];
  }


export {handleFormatToCurrency, limitCarryDecimalPlaces, limitDecimalPlaces, limitCarryMoneyDecimalPlaces, formatCurrencyWithTwoDecimals, getLatestDate}
