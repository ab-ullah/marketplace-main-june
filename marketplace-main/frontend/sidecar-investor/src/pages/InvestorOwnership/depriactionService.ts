import {IOwnershipFundInvestor} from "../../interfaces/investorOwnership";

const DEPRECATED_FIELDS = [
  {
    deprecatedField: 'total_distributions',
    newField: 'income_distributions_since_inception',
    deprecatedLabel: 'Total Distributions',
    newLabel: 'Income Distributions'
  }
]

/**
 *
 * This is an initial version of deprecation service, its not
 * super mature currently. We can evolve it with time
 */

export const getDeprecatedFieldLabel = (oldFieldName: string, investedFunds: IOwnershipFundInvestor[]) => {
  const deprecationInfo = DEPRECATED_FIELDS.find(
    (deprecatedField) => deprecatedField.deprecatedField === oldFieldName
  )

  if (!deprecationInfo) return {
    label: '',
    field: ''
  };
  const hasNewData = investedFunds.some(
    // @ts-ignore
    (investmentInfo) => Boolean(investmentInfo[deprecationInfo.newField])
  )
  const hasDeprecatedData = investedFunds.some(
    // @ts-ignore
    (investmentInfo) => Boolean(investmentInfo[deprecationInfo.deprecatedField])
  )

  // If there is new data or no old data, use the new fields
  if (hasNewData || !hasDeprecatedData) return {
    label: deprecationInfo.newLabel,
    field: deprecationInfo.newField
  }

  return {
    label: deprecationInfo.deprecatedLabel,
    field: deprecationInfo.deprecatedField
  }


}