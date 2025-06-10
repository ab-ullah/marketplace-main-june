import { formatCurrencyWithTwoDecimals } from "../../../../../../../../../../utils/currency";
import { BlockTitle } from "../../styles";
import { Amount, Label } from "../SummaryBlock/styles";
import map from "lodash/map";
import { BenefitWrapper, BenefitsWrapper } from "./styles";

const BenefitsSummary = ({data, totalBenefits}: any) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "30px",
          width: "100%",
        }}
      >
        <BenefitsWrapper>
        <Label>Benefits</Label>
        <Amount>{formatCurrencyWithTwoDecimals(totalBenefits)}</Amount>
            <BenefitWrapper>
            {map(data, (benefit: any) => (
                <div>
                <Amount>{formatCurrencyWithTwoDecimals(benefit.amount)}</Amount>
                <Label>{benefit.label}</Label>
                </div>
            ))}
            </BenefitWrapper>
          </BenefitsWrapper>
      </div>
    </div>
  );
};

export default BenefitsSummary;
