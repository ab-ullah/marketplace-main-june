import { get } from "lodash";
import AllocationStat from "./allocationStat";
import { AllocationCardStatWrapper } from "./styles";
import { standardizeDate } from "../../../../../../../../../utils/dateFormatting";

const AllocationDatesCard = ({ allocationDetail }: any) => {
  return (
    <AllocationCardStatWrapper>
      <AllocationStat
        value={get(allocationDetail, "participant_name")}
        isBold
      />
      <hr />
      <AllocationStat
        label="Grant Date"
        value={standardizeDate(get(allocationDetail, "grant_date"))}
        isBold
      />
      <hr />
      <AllocationStat
        label="Vesting Start Date"
        value={get(allocationDetail, "vesting_start_date") ?
           standardizeDate(get(allocationDetail, "vesting_start_date")):"-"}
        isBold
      />
    </AllocationCardStatWrapper>
  );
};

export default AllocationDatesCard;
