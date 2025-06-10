import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { decimalDivide, decimalMultiply } from "../../../../../../../../utils/decimal";
import { getSumByProperty, limitCarryDecimalPlaces } from "../../../../../../../../utils/getValue";
import { HorizontalDivider, StatCardWrapper, VerticalDivider } from "../styles";
import { CurrencyTitle, CurrencyValue, LowerHalfLabel, PercentageValue, UpperHalfLabel } from "./styles";

const CarryValueCard = ({data}:any) => {
  const estimatedCarryValue = getSumByProperty(data,'participant_estimated_carry')
  const vestedValue = getSumByProperty(data,'participant_estimated_carry_vested')
  const unvestedValue = getSumByProperty(data,'participant_estimated_carry_un_vested')
  const vestedPercentage =limitCarryDecimalPlaces(decimalMultiply(decimalDivide(vestedValue,(estimatedCarryValue || 1)),100).toString())
  return (
    <StatCardWrapper>
      <div className="d-flex justify-content-between">
        <div>
          <CurrencyTitle>{estimatedCarryValue? formatCurrencyWithTwoDecimals(estimatedCarryValue): "-"}</CurrencyTitle>
          <UpperHalfLabel>Estimated Carry Value</UpperHalfLabel>
        </div>
        <div className="d-flex flex-column justify-content-between">
          <PercentageValue>{vestedPercentage}%</PercentageValue>
          <UpperHalfLabel>% Vested</UpperHalfLabel>
        </div>
      </div>
      <HorizontalDivider/>
      <div className="d-flex gap-4">
        <div>
            <CurrencyValue>{vestedValue? formatCurrencyWithTwoDecimals(vestedValue): "-"}</CurrencyValue>
            <LowerHalfLabel>Vested</LowerHalfLabel>
        </div>
        <VerticalDivider/>
        <div>
            <CurrencyValue>{unvestedValue? formatCurrencyWithTwoDecimals(unvestedValue): "-"}</CurrencyValue>
            <LowerHalfLabel>Unvested</LowerHalfLabel>
        </div>
      </div>
    </StatCardWrapper>
  );
};

export default CarryValueCard;
