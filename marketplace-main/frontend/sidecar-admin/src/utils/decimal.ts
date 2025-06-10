import Decimal from "decimal.js";

Decimal.set({
    precision: 50,
    toExpNeg: -50,
    toExpPos: 50,
    minE: -50,
    maxE: 50,
  });

export const createDecimal=(input:any): Decimal => {

    if (!input || isNaN(input)) {
      return new Decimal(0); // Default to 0 for invalid input
    }
    return new Decimal(input.toString());
  }
  
  // Function to sum any number of values
  export const decimalSum = (...values: any[]): Decimal => {
    return values.reduce((acc, val) => acc.plus(createDecimal(val)), createDecimal(0));
  };
  
  // Function to subtract any number of values
  export const decimalSubtract = (initial: any, ...values: any[]): Decimal => {
    return values.reduce((acc, val) => acc.minus(createDecimal(val)), createDecimal(initial));
  };
  
  // Multiply values
  export const decimalMultiply = (...values: any[]): Decimal => {
    return values.reduce((acc, val) => acc.times(createDecimal(val)), createDecimal(1));
  };
  
  // Divide values
  export const decimalDivide = (initial: any, ...values: any[]): Decimal => {
    return values.reduce((acc, val) => acc.div(createDecimal(val)), createDecimal(initial));
  };
  
  // Function to check if two values are equal
  export const decimalEqual = (a: any, b: any): boolean => {
    return createDecimal(a).equals(createDecimal(b));
  };
  
  // Function to check if the first value is less than the second
  export const decimalLessThan = (a: any, b: any): boolean => {
    return createDecimal(a).lessThan(createDecimal(b));
  };
  
  // Function to check if the first value is greater than the second
  export const decimalGreaterThan = (a: any, b: any): boolean => {
    return createDecimal(a).greaterThan(createDecimal(b));
  };
  
  // Function to check if the first value is less than or equal to the second
  export const decimalLessOrEqual = (a: any, b: any): boolean => {
    return createDecimal(a).lessThanOrEqualTo(createDecimal(b));
  };
  
  // Function to check if the first value is greater than or equal to the second
  export const decimalGreaterOrEqual = (a: any, b: any): boolean => {
    return createDecimal(a).greaterThanOrEqualTo(createDecimal(b));
  };
  