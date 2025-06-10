import { get } from "lodash";
import {
  Heading,
  TCell,
  TRow,
} from "../../../../../../VestingScheduleDisplay/styles";
import { standardizeDate } from "../../../../../../../../../utils/dateFormatting";

const getMilestoneBaseVestingTable = (data: any[]) => {
  return (
    <>
      {data.map((datum: any) => (
        <TRow>
          <TCell>{datum.milestone.name}</TCell>
          <div>
            <TCell>
                {datum.date
                ? standardizeDate(datum.date)
                : "-"}
            </TCell>
            <TCell>{`${datum?.vesting_percentage ? datum?.vesting_percentage + "%" : "-"}`}</TCell>
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

const getCustomVestingSchedule = (
    data: any[]
) => {
    return (
        <>
            {data.map((datum: any) => {
                return <>
                    <TRow>
                        <TCell>{datum.label}</TCell>
                        <div>
                            {datum.detail && <TCell>{datum.detail}</TCell>}
                            {datum.date && <TCell>{datum.date}</TCell>}
                            <TCell>{datum.percentage}%</TCell>
                        </div>
                    </TRow>
                </>
            })}
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
  const custom = get(allocationDetail, 'vesting_schedule_id.sequenced_vesting_schedules', [])
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
      <div>
         {custom?.length ? getCustomVestingSchedule(
             custom
         ) : null}
      </div>
    </div>
  );
};

export default VestingSchedule;
