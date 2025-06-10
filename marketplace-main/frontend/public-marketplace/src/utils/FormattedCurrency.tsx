import {FunctionComponent} from "react";
import CurrencyFormat from 'react-currency-format';
import _, {round} from "lodash";
import {DASH_DEFAULT_VALUE, NA_DEFAULT_VALUE} from "../constants/defaultValues";


interface FormattedCurrencyProps {
  value: number | null;
  symbol?: string | null;
  rate?: number;
  defaultReturn?: number | string | null;
  replaceZeroWith?: string | null;
  showCents?: boolean
}

const FormattedCurrency: FunctionComponent<FormattedCurrencyProps> = ({
                                                                        value,
                                                                        symbol,
                                                                        rate,
                                                                        defaultReturn,
                                                                        replaceZeroWith,
                                                                        showCents
                                                                      }) => {
  if (_.isNil(value)) return defaultReturn ? <>{defaultReturn}</> : <>{NA_DEFAULT_VALUE}</>
  if (rate === 0) return <>{DASH_DEFAULT_VALUE}</>
  if (replaceZeroWith && value === 0) return <>{replaceZeroWith}</>
  let currencyValue = value;
  if (rate) currencyValue *= rate;
  if (!showCents)
    currencyValue = round(currencyValue, 0)
  return <CurrencyFormat
    value={currencyValue}
    displayType={'text'}
    thousandSeparator={true}
    prefix={symbol || ''}
    fixedDecimalScale={!Number.isInteger(value)}
    decimalScale={showCents ? 2 : 0}
  />
}

FormattedCurrency.defaultProps = {
  symbol: "$"
}

export default FormattedCurrency;