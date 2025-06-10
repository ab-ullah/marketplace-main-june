import { map } from "lodash";
import { TRow, TCell, Heading } from "./styles";
import {standardizeDate} from "../../../../../../utils/dateFormatting";

const formatData = (data: Record<string, any>) => {
    const {
        cliff,
        cliff_percentage,
        periods,
        milestone_vesting_schedules,
        sequenced_vesting_schedules
    } = data;
    let rows = [];
    if (cliff && cliff != "No cliff") {
        rows.push({ label: "Cliff", detail: cliff, percentage: cliff_percentage, date: "" });
    }

    periods?.forEach((period: Record<string, any>) =>
        rows.push({
            label: "Periods",
            detail: period?.period,
            date: "",
            percentage: period?.percentage,
        })
    );
    milestone_vesting_schedules?.forEach((milestone: Record<string, any>) =>
        rows.push({
            // label: "Milestone",
            // detail: milestone?.milestone?.name,
            label: milestone?.milestone?.name,
            date: milestone?.milestone?.date ? standardizeDate(milestone.milestone.date ) : "-",
            percentage: milestone?.milestone?.vesting_percentage ? `${milestone?.milestone?.vesting_percentage}` : "-"
        })
    );
    if (sequenced_vesting_schedules){
        rows = []
        sequenced_vesting_schedules.forEach((sequencedVestingSchedule: Record<string, any>) =>
            rows.push({
                label: sequencedVestingSchedule?.label,
                detail: sequencedVestingSchedule?.detail,
                date: sequencedVestingSchedule?.date ? standardizeDate(sequencedVestingSchedule.date ) : "-",
                percentage: sequencedVestingSchedule?.percentage ? `${sequencedVestingSchedule?.percentage}` : "-"
            })
        )
    }
    return rows;
};

const DisplayTable = ({ data }: any) => {
  const hasDateAttr = formatData(data).find(dat=>dat.date)
  return (
    <div style={{padding:'15px'}}>
      <Heading>{data?.name}</Heading>
      <div style={{overflowX:'scroll'}}>
        {map(formatData(data), (row) => (
          <TRow>
            <TCell>{row.label}</TCell>
            <div>
             {hasDateAttr && <TCell>{row.date}</TCell>}
              <TCell>{row.detail}</TCell>
              <TCell>{row.percentage}%</TCell>
            </div>
          </TRow>
        ))}
      </div>
    </div>
  );
};

export default DisplayTable;
