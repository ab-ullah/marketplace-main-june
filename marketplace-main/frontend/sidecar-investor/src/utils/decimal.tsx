import Decimal from "decimal.js";

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