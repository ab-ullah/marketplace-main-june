import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { getSumByProperty } from "../../../../../../../../utils/getValue";
import { StatCardWrapper } from "../styles";
import { CurrencyTitle, UpperHalfLabel } from "./styles";

const DistributionsCard = ({data}:any) => {
  const distributions = getSumByProperty(data,'distributions')
  return (
    <StatCardWrapper>
      <div className="d-flex justify-content-between">
        <div>
          <CurrencyTitle>{distributions? formatCurrencyWithTwoDecimals(distributions): "-"}</CurrencyTitle>
          <UpperHalfLabel>Distributions</UpperHalfLabel>
        </div>
      </div>
    </StatCardWrapper>
  );
};

export default DistributionsCard;
