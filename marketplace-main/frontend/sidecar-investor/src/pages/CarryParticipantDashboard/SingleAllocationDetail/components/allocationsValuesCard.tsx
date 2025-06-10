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

const AllocationValueCard = ({ allocationDetail }: any) => {
  return (
    <AllocationCardStatWrapper>
      <CardTopContentWrapper>
        <AllocationStat
          label="Estimated Carry Value"
          value={
            <FormattedCurrency
              value={allocationDetail.participant_ecv}
              {...common_props}
            />
          }
          additionalInfo={standardizeDate(allocationDetail.estimated_value_date)}
          isBold
        />
      </CardTopContentWrapper>
      <hr />
      <MultiStatWrapper>
        <AllocationStat
          subtext="Vested"
          value={<FormattedCurrency value={allocationDetail.participant_ecv_vested} {...common_props} />}
        />
        <VerticalDivider />
        <AllocationStat
          subtext="Unvested"
          value={<FormattedCurrency value={allocationDetail.participant_ecv_un_vested} {...common_props} />}
        />
      </MultiStatWrapper>
      <Label>Estimated Carry Value</Label>
    </AllocationCardStatWrapper>
  );
};

export default AllocationValueCard;
