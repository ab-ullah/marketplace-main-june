import {FunctionComponent} from "react";
import CurrencyFormat from 'react-currency-format';
import _ from "lodash";
import {NA_DEFAULT_VALUE} from "../constants/defaultValues";


interface FormattedCurrencyProps {
  value: number | null;
  symbol?: string | null;
  rate?: number;
  defaultReturn?: number | string | null;
  replaceZeroWith?: string | null;
}

const FormattedCurrency: FunctionComponent<FormattedCurrencyProps> = ({
                                                                        value,
                                                                        symbol,
                                                                        rate,
                                                                        defaultReturn,
                                                                        replaceZeroWith
                                                                      }) => {
  if (_.isNil(value)) return defaultReturn ? <>{defaultReturn}</> : <>{NA_DEFAULT_VALUE}</>
  if (replaceZeroWith && value === 0) return <>{replaceZeroWith}</>
  let currencyValue = value;
  if (rate) currencyValue *= rate;
  return <CurrencyFormat
    value={currencyValue}
    displayType={'text'}
    thousandSeparator={true}
    prefix={symbol ? symbol : '$'}
    fixedDecimalScale={!Number.isInteger(value)}
    decimalScale={2}
  />
}

export default FormattedCurrency;