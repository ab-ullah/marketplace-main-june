import * as Yup from "yup";

export const INITIAL_VALUES = {
    name: "",
    estimated_value: null,
    fair_market_value: null,
    deal: null,
    estimated_value_date: null,
    fair_market_value_date: null
  }

  const maxDigits = (maxInt:number,maxDecimalPlaces:number,fieldName:string) => {
    return Yup.number().test(
      'max-integers',
      `Please reach out to support to create a fund with ${fieldName} that's larger than ${maxInt} digits`,
      value => !value || value.toString().split('.')?.[0].length <= maxInt
    ).test(
      'max-decimals',
      `Ensure that there are no more than ${maxDecimalPlaces} decimal places`,
      value => !value || (value.toString().split('.')?.[1]?.length || 0) <= maxDecimalPlaces
    );
  };

  export const VALIDATION_SCHEMA = Yup.object({
	name: Yup.string().required('Required'),
  deal: Yup.object().required('Required').nullable(),
  estimated_value: maxDigits(11,2,'Estimated Value').nullable(true),
  fair_market_value: maxDigits(11,2,'Fair Market Value').nullable(true),
  })