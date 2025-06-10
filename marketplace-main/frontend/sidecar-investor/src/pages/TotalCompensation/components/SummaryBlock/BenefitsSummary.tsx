import { Amount, Label } from "./styles";
import map from "lodash/map";
import { BenefitWrapper, BenefitsWrapper } from "./styles";
import {formatCurrencyWithTwoDecimals} from "../../../../utils/currency";
import {get} from "lodash";

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
                                <Amount>{formatCurrencyWithTwoDecimals(get( benefit, 'amount', 0))}</Amount>
                                <Label>{get(benefit, "label", "")}</Label>
                            </div>
                        ))}
                    </BenefitWrapper>
                </BenefitsWrapper>
            </div>
        </div>
    );
};

export default BenefitsSummary;
