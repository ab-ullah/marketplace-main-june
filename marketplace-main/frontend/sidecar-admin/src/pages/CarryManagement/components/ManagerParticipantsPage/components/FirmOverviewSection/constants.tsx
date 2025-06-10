import { every, filter, get, includes, isEmpty, map, truncate } from "lodash";
import TooltipWrapper from "../../../../../../components/Tooltip";
import { limitCarryDecimalPlaces } from "../../../../../../utils/getValue";
import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";

export const getColumns = (firmOverviewData:any,cellDataKey:string, displayBps:boolean)=>{
  const formatValue=(value:any)=>{
    return value ? (displayBps ? limitCarryDecimalPlaces(value): formatCurrencyWithTwoDecimals(value)) :"-"
  }
    const staticCols= [
      {
        title: "Participant",
        dataKey: "name",
        width: 150,
        fixed: 'left',
        Cell: (row: any) => (
          <TooltipWrapper enable={truncate(get(row,'name')).length<get(row,'name').length} text={get(row,'name')}>
             <span>
                {truncate(get(row,'name'))}
             </span>
          </TooltipWrapper>
      ),
      },
      ...(displayBps ? [] : [{
        title: "Total",
        dataKey: "total",
        width: 100,
        fixed: 'left',
        Cell: (row: any) => (
          <span>
          { formatValue(get(row?.total,cellDataKey,''))}
          </span>
        ),
      }])
    ]
    
    const dynamicCols = firmOverviewData?.carry_plans?.map((carry_plan: any) => {
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
        Cell: (row: any) => {
          const value = row.carryPlanMap?.[carry_plan.id]?.[cellDataKey];
          return <span>{formatValue(value)}</span>;
        }
      };
    });

    return [...staticCols,...dynamicCols]
  }

  // Example transformation for participant row:
export const transformParticipantsToMap=(participants:any[])=> {

  return map(participants,(participant:any)=>{
    const carryPlanMap: Record<number, number> = {};

    participant.carry_plans.forEach((cp:any) => {
      carryPlanMap[cp.carry_plan_id] = cp.value;
    });
  
    const {carry_plans=[],...rest} = {
      ...participant,
      carryPlanMap,
    }

    return rest
  })
}

export const filterData = (
  data: Array<Record<string, any>>,
  filterState: Record<string, { label: string; value: any }[] | string>
): Array<Record<string, any>> => {

  return filter(data,(item) => {
    return every(filterState, (filters, key) => {
      if(typeof filters === 'string'){
        const query = filters?.toLowerCase();
        return (
          item?.name?.toLowerCase().includes(query)
        );
      }
      else{
      if (isEmpty(filters)) return true;
      const filterValues = map(filters,(f) => f.value);
      return includes(filterValues, item[key]);
      }
    });
  });
};