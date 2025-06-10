import { map, truncate } from "lodash";
import { TRow, TCell, Heading } from "./styles";
import { standardizeDate } from "../../../../utils/dateFormatting";
import TooltipWrapper from "../../../../components/Tooltip";

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
      percentage: milestone?.milestone?.vesting_percentage ? `${milestone?.milestone?.vesting_percentage}%` : "-"
    })
  );
  if (sequenced_vesting_schedules){
      rows = []
      sequenced_vesting_schedules.forEach((sequencedVestingSchedule: Record<string, any>) =>
          rows.push({
              label: sequencedVestingSchedule?.label,
              detail: sequencedVestingSchedule?.detail,
              date: sequencedVestingSchedule?.date ? standardizeDate(sequencedVestingSchedule.date ) : "-",
              percentage: sequencedVestingSchedule?.percentage ? `${sequencedVestingSchedule?.percentage}%` : "-"
          })
      )
  }
  return rows;
};

const VestingScheduleDisplay = ({ data, textLimit= 22 }: any) => {
  const formattedData = formatData(data)
  const hasDateAttr = formattedData.find(dat=>dat.date)
  return (
    <div style={{padding:'15px'}}>
      <Heading>{data?.name}</Heading>
      <div >
        <div style={{minWidth:'max-content'}}>
        {map(formattedData, (row) => {
          const truncateOptions ={ length:textLimit}
          const truncatedText = (str:string)=> truncate(str,truncateOptions) 
          const tooltipProps =(str:string)=>{
            return{
            enable: str?.length > truncateOptions.length,
            text: str
        }}
            return <>
                <TRow>
                    <TCell><TooltipWrapper {...tooltipProps(row.label)}>{truncatedText(row.label)}</TooltipWrapper></TCell>
                    <div>
                        {row.detail && <TCell><TooltipWrapper {...tooltipProps(row.detail)}>{truncatedText(row.detail)}</TooltipWrapper></TCell>}
                        {hasDateAttr && <TCell>{row.date}</TCell>}
                        <TCell>{row.percentage}</TCell>
                    </div>
                </TRow>
            </>
        })}
        </div>
      </div>
    </div>
  );
};

export default VestingScheduleDisplay;
