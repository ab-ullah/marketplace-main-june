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

const AllocationFMVCard = ({ allocationDetail, carryTooltips }: any) => {
  const FMVTooltip= getTooltip('fair_market_value', carryTooltips)?.tooltip;
  const reallocatedPrehurdlecarryTooltip= getTooltip('re_allocated_pre_hurdle_fmv', carryTooltips)?.tooltip;
  return (
    <AllocationCardStatWrapper>
      <CardTopContentWrapper>
        <AllocationStat
          label="Fair Market Value"
          value={
            formatCurrencyWithTwoDecimals(allocationDetail.participant_fmv)
          }
          additionalInfo={allocationDetail.fair_market_value_date ? 
            `As of: ${standardizeDate(allocationDetail.fair_market_value_date)}` : ''}
          tooltip={FMVTooltip}
          isBold
        />
      </CardTopContentWrapper>
      <hr />
      <MultiStatWrapper>
        <AllocationStat
          subtext="Vested"
          value={formatCurrencyWithTwoDecimals(allocationDetail.participant_fmv_vested)}
        />
        <VerticalDivider />
        <AllocationStat
          subtext="Unvested"
          value={formatCurrencyWithTwoDecimals(allocationDetail.participant_fmv_un_vested)}
        />
      </MultiStatWrapper>
      { (allocationDetail?.fmv_hurdle?.id || Boolean(Number(allocationDetail?.re_allocated_pre_hurdle_fmv))) &&
      <>
      <hr/>
      {/* TODO: Hurdle values for FMV need to be updated */}
      <MultiStatWrapper>
        {allocationDetail?.fmv_hurdle?.id &&
        <div className="d-flex flex-column">
      <AllocationStat
          label="Hurdle"
          value={formatCurrencyWithTwoDecimals(allocationDetail?.fmv_hurdle.hurdle_rate)}
        />
        {allocationDetail?.fmv_hurdle?.re_allocated_hurdle_value &&
        <AllocationStat
        subtext="Reallocated Hurdle Value"
        value={formatCurrencyWithTwoDecimals(allocationDetail?.fmv_hurdle.re_allocated_hurdle_value)}
      />  
        }
        </div>}
        {Boolean(Number(allocationDetail?.re_allocated_pre_hurdle_fmv)) &&
        <AllocationStat
          label="Reallocated pre-hurdle FMV"
          value={formatCurrencyWithTwoDecimals(allocationDetail?.re_allocated_pre_hurdle_fmv)}
          tooltip={reallocatedPrehurdlecarryTooltip}
        />}
        </MultiStatWrapper>
        </>}
    </AllocationCardStatWrapper>
  );
};

export default AllocationFMVCard;
