import { formatCurrencyWithTwoDecimals } from "../../../../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../../../../utils/dateFormatting";
import { getTooltip } from "../../../../../../FundsPage/components/FundsListView/constants";
import AllocationStat from "./allocationStat";
import {
  AllocationCardStatWrapper,
  CardTopContentWrapper,
  MultiStatWrapper,
  VerticalDivider,
} from "./styles";

const AllocationValueCard = ({ allocationDetail, carryTooltips }: any) => {
  const estimatedCarryValueTooltip= getTooltip('estimated_value', carryTooltips)?.tooltip;
  const reallocatedPrehurdlecarryTooltip= getTooltip('re_allocated_pre_hurdle_carry', carryTooltips)?.tooltip;
  return (
    <AllocationCardStatWrapper>
      <CardTopContentWrapper>
        <AllocationStat
          label="Estimated Carry Value"
          value={
            formatCurrencyWithTwoDecimals(allocationDetail.participant_ecv)
          }
          additionalInfo={allocationDetail.estimated_value_date ? 
            `As of: ${standardizeDate(allocationDetail.estimated_value_date)}` : ''}
          tooltip={estimatedCarryValueTooltip}
          isBold
        />
      </CardTopContentWrapper>
      <hr />
      <MultiStatWrapper>
        <AllocationStat
          subtext="Vested"
          value={formatCurrencyWithTwoDecimals(allocationDetail.participant_ecv_vested)}
        />
        <VerticalDivider />
        <AllocationStat
          subtext="Unvested"
          value={formatCurrencyWithTwoDecimals(allocationDetail.participant_ecv_un_vested)}
        />
      </MultiStatWrapper>
      { (allocationDetail?.ecv_hurdle?.id || Boolean(Number(allocationDetail?.re_allocated_pre_hurdle_carry))) &&
      <>
      <hr/>
      <MultiStatWrapper>
        {allocationDetail?.ecv_hurdle?.id &&
        <div className="d-flex flex-column">
      <AllocationStat
          label="Hurdle"
          value={formatCurrencyWithTwoDecimals(allocationDetail?.ecv_hurdle.hurdle_rate)}
        />
        {allocationDetail?.ecv_hurdle?.re_allocated_hurdle_value &&
        <AllocationStat
        subtext="Reallocated Hurdle Value"
        value={formatCurrencyWithTwoDecimals(allocationDetail?.ecv_hurdle.re_allocated_hurdle_value)}
      />  
        }
        </div>
        }
        {Boolean(Number(allocationDetail?.re_allocated_pre_hurdle_carry)) &&
        <AllocationStat
          label="Reallocated pre-hurdle carry"
          value={formatCurrencyWithTwoDecimals(allocationDetail?.re_allocated_pre_hurdle_carry)}
          tooltip={reallocatedPrehurdlecarryTooltip}
        />}
        </MultiStatWrapper>
        </>}
     {/* <InfoWrapper>
     <Label>Estimated Carry Value</Label>
     {estimatedCarryValueTooltip && <TooltipPopover tooltip={estimatedCarryValueTooltip} />}
     </InfoWrapper> */}
    </AllocationCardStatWrapper>
  );
};

export default AllocationValueCard;
