import { get } from "lodash";
import { format } from "date-fns";
import { TCell, TRow } from "../../AllocationDetail/VestingDetailModal/components/DisplayTable/styles";
import { Heading } from "../../../../presentational/Heading";

const getMilestoneBaseVestingTable = (data: any[]) => {
  return (
    <>
      {data.map((datum: any) => (
        <TRow>
          <TCell>{datum.milestone.name}</TCell>
          <div>
            <TCell>
              {datum.milestone.date
                ? format(new Date(datum.milestone.date), "MM/dd/yyyy")
                : "-"}
            </TCell>
            <TCell>{`${datum.milestone_vesting_percentage}%`}</TCell>
          </div>
        </TRow>
      ))}
    </>
  );
};

const getTimeBasedVestingTable = (
  data: any[],
  cliff: string,
  cliffPercentage: number
) => {
  return (
    <>
      <TRow>
        <TCell>Cliff</TCell>
        <div>
          <TCell>{cliff}</TCell>
          <TCell>{`${cliffPercentage}%`}</TCell>
        </div>
      </TRow>
      {data.map((datum: any) => (
        <TRow>
          <TCell>Periods</TCell>
          <div>
            <TCell>{datum.period}</TCell>
            <TCell>{`${datum.percentage}%`}</TCell>
          </div>
        </TRow>
      ))}
    </>
  );
};

const VestingSchedule = ({ allocationDetail }: any) => {
  const milestones = get(
    allocationDetail,
    "vesting_schedule_id.milestone_vesting_schedules",
    []
  );
  const timePeriods = get(allocationDetail, "vesting_schedule_id.periods", []);
  return (
    <div>
      <Heading>Vesting Schedule</Heading>
      <h5>{get(allocationDetail, "vesting_schedule_id.name", "")}</h5>
      <div>
        {timePeriods.length
          ? getTimeBasedVestingTable(
              timePeriods,
              allocationDetail?.vesting_schedule_id?.cliff,
              allocationDetail?.vesting_schedule_id?.cliff_percentage
            )
          : null}
      </div>
      <div>
        {milestones.length ? getMilestoneBaseVestingTable(milestones) : null}
      </div>
    </div>
  );
};

export default VestingSchedule;
