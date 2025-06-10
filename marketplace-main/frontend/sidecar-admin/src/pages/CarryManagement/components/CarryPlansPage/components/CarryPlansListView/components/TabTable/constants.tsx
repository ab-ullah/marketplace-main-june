import { get, truncate, uniq } from "lodash";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import { limitCarryDecimalPlaces } from "../../../../../../../../utils/getValue";
import { SUB_TABS } from "../../constants";
import TooltipWrapper from "../../../../../../../../components/Tooltip";
import { StatusPill } from "../../../../../styles";
import { getPillColor } from "../../../../../../constants";
import { createDecimal } from "../../../../../../../../utils/decimal";


export const getColumns=(tab:string,firmOverviewData:any, showStatus:boolean)=>{
    switch (tab) {
        case SUB_TABS.CARRY_PLANS:
            return getCarryPlansColumns(showStatus)
        case SUB_TABS.FIRM_OVERVIEW:
            return getFirmOverviewColumns(firmOverviewData)
    
        default:
            return []
    }
}

export const getCarryPlansColumns = ( showStatus:boolean) => [
    {
      title: "Source",
      fixed: "left",
      dataKey: "label",
      width: 150,
      flexGrow: 1,
    },
    {
      title: "Date",
      dataKey: "effective_date",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{standardizeDate(row.effective_date)}</span>,
    },
    {
      title: "Participants",
      dataKey: "participants",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{uniq(row.participants)?.length}</span>,
    },
    {
      title: "Allocated Points",
      dataKey: "allocated_points",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{limitCarryDecimalPlaces(createDecimal(get(row,'allocated_points')).toString())}</span>
    },
    {
      title: "Unallocated Points",
      dataKey: "unallocated_points",
      width: 200,
      flexGrow: 1.3,
      Cell: (row: any) => <span>{limitCarryDecimalPlaces(createDecimal(get(row,'unallocated_points')).toString())}</span>
    },
    // {
    //   title: "Default Vesting Schedule",
    //   dataKey: "default_vesting_schedule",
    //   width: 200,
    //   flexGrow: 1.3,
    // },
    showStatus?
    {
      title: "Status",
      dataKey: "status",
      width: 200,
      flexGrow: 1.25,
      Cell: (row: any) => <StatusPill color={getPillColor(get(row, "status", ""))}>
      {get(row, "status")}
    </StatusPill>,
    }:null,
  ].filter(elem=>elem);


 export const getFirmOverviewColumns = (firmOverviewData:any)=>{
    const staticCols= [
      {
        title: "Participant",
        dataKey: "name",
        width: 150,
        fixed: 'left'
      },
    ]
    
    const dynamicCols = (firmOverviewData?.carry_plans ||[]).map((carry_plan: any) => {
      return {
        title: (
          <TooltipWrapper enable text={carry_plan.name}>
            <span style={{ color: "white" }}>
              {truncate(carry_plan.name, { length: 20 })}
            </span>
          </TooltipWrapper>
        ),
        dataKey: carry_plan.id,
        minWidth: 120,
        flexGrow: 1,
        Cell: (row: any) => (
          <span>
            {row.carry_plans?.find(
              (rowCarryPlan: any) =>
                rowCarryPlan.carry_plan_id === carry_plan.id
            )?.bps || "-"}
          </span>
        ),
      };
    });

    return [...staticCols,...dynamicCols]
  }

  export const getRsuiteProps=(tab:string,handleSelectPlanToView:any)=>{
    switch (tab) {
      case SUB_TABS.CARRY_PLANS:
          return {rowHeight:72, height: '400px',onRowClick:(_rowData:any)=> handleSelectPlanToView(_rowData.carryPlanId)}
      case SUB_TABS.FIRM_OVERVIEW:
          return {rowHeight:30, height: '650px', headerHeight: 60}
  
      default:
          return {}
  }
  }