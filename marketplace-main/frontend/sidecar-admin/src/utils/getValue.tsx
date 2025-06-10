import reduce from "lodash/reduce";
import get from "lodash/get";
import isNil from "lodash/isNil";
import _ from "lodash";
import TooltipWrapper from "../components/Tooltip";
import { createDecimal } from "./decimal";



export const getValueWithDefault = (obj: any, key: string, defaultValue: any) => {
  if(!defaultValue) defaultValue = '';
  const value = get(obj, key, defaultValue)
  if (isNil(value)) return defaultValue;
  return value;
}

export const getValueWithZeroDefault = (obj: any, key: string, defaultValue: any) => {
  if(!defaultValue) defaultValue = 0;
  const value = get(obj, key, defaultValue)
  if (isNil(value)) return defaultValue;
  return value;
}

export const getSumByProperty = (array: any[], attr: string) => {
  return reduce((array||[]), (acc: any, obj: any) =>  createDecimal(obj[attr] || 0).plus(acc), createDecimal(0)).toString();
};

export const limitDecimalPlaces=(input: number | string, decimalPlaces: number): string=> {
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

  const inputStr = typeof input === 'number' ? input.toString() : input;
  const [integerPart, fractionalPart = ''] = inputStr.split('.');

  if (decimals === 0) {
    return integerPart;
  }
  const truncatedFraction = fractionalPart.slice(0, decimals);
  let truncated = truncatedFraction ? `${integerPart}.${truncatedFraction}` : integerPart;

  if (addEllipsis && truncated !== inputStr) {
    return `${truncated}...`;
  }

  return truncated;
}

export const limitCarryDecimalPlaces = (input: number | string) => {
  if(!input) return '0'
  const decimalInput = createDecimal(input).toString()
 return <TooltipWrapper enable={decimalInput!=truncateDecimal(decimalInput,4,false)} text={decimalInput}>
          {truncateDecimal(decimalInput,4,true)}
        </TooltipWrapper>
}

export const isValidPositiveDecimal = (value: string): boolean => {
  // Check if the value is a potentially valid decimal (like "23.")
  const isPotentialDecimal = /^\d*\.$/.test(value);

  // Check if the value is a valid positive decimal with up to 4 decimal places
  const isActualDecimal = /^\d*(\.\d{1,4})?$/.test(value);

  return isPotentialDecimal || isActualDecimal || value === "";
};

export const isValidPositiveUncappedDecimal = (value: string): boolean => {
  // Check if the value is a potentially valid decimal (like "23.")
  const isPotentialDecimal = /^\d*\.$/.test(value);

  // Check if the value is a valid positive decimal with up to 4 decimal places
  const isActualDecimal = /^\d*(\.\d{1,16})?$/.test(value);

  return isPotentialDecimal || isActualDecimal || value === "";
};

export const isAllowedDecimal = (
  input: number | string,
  allowBeforeDecimal: number,
  allowAfterDecimal: number
) => {

  const number = typeof input === "string" ? parseFloat(input) : input;
  if (isNaN(number)) {
    return false;
  }
  const [beforeDecimal, afterDecimal] = number.toString().split(".");

  const isValid =
    (beforeDecimal?.length || 0) <= allowBeforeDecimal &&
    (afterDecimal?.length || 0) <= allowAfterDecimal;

  return isValid
};

export const countDecimalPlaces = (input: number | string)=>{
  const numberStr = typeof input === 'number' ? input.toString() : input;
  return numberStr?.split(".")?.[1]?.length || 0
}

export const getLatestDate = (data: any[], key: string) => {
  if(!data) return ''
  const filteredData = data.filter(obj => obj[key] !== undefined && obj[key] !== null)
  if(filteredData.length === 0) return ''
  return filteredData.reduce((latest, current) => 
    new Date(current[key]) > new Date(latest[key]) ? current : latest
  )[key];
}

export const limitCarryDecimalPlacesString = (input: number | string) => {
  if(!input) return '0'
  const decimalInput = createDecimal(input).toString()
 return truncateDecimal(decimalInput,4,true)
}