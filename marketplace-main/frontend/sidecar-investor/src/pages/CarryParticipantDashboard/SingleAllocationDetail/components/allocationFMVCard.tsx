import AllocationStat from "./allocationStat";
import {
  AllocationCardStatWrapper,
  CardTopContentWrapper,
  Label,
  MultiStatWrapper,
  VerticalDivider,
} from "../styled";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import { limitCarryDecimalPlaces } from "../../../../utils/currency";
import { standardizeDate } from "../../../../utils/dateFormatting";

const common_props = {
  symbol: "$",
  defaultReturn: "0",
};

const AllocationFMVCard = ({ allocationDetail }: any) => {
  return (
    <AllocationCardStatWrapper>
      <CardTopContentWrapper>
        <AllocationStat
          label="Fair Market Value"
          value={
            <FormattedCurrency
              value={allocationDetail.participant_fmv}
              {...common_props}
            />
          }
          additionalInfo={standardizeDate(allocationDetail.fair_market_value_date)}
          isBold
        />
      </CardTopContentWrapper>
      <hr />
      <MultiStatWrapper>
        <AllocationStat
          subtext="Vested"
          value={<FormattedCurrency value={allocationDetail.participant_fmv_vested} {...common_props} />}
        />
        <VerticalDivider />
        <AllocationStat
          subtext="Unvested"
          value={<FormattedCurrency value={allocationDetail.participant_fmv_un_vested} {...common_props} />}
        />
      </MultiStatWrapper>
      <Label>Fair Market Value</Label>
    </AllocationCardStatWrapper>
  );
};

export default AllocationFMVCard;
