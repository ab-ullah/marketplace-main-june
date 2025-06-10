import get from "lodash/get";
import { CSSProperties } from "react";
import { standardizeDate } from "../../../../../../../../../../utils/dateFormatting";
import { getSumByProperty, limitCarryDecimalPlaces } from "../../../../../../../../../../utils/getValue";
import { MODAL_MODE } from "../../../../constants";
import { createDecimal, decimalSum } from "../../../../../../../../../../utils/decimal";

const footerRowStyle = {
  borderTop: "1px solid #D5DAE1",
  position: "absolute",
  top: "0px",
  padding: "8px",
  width: "100%",
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "55px",
  background: "#F5F7F8",
  left: 0,
} as CSSProperties;

const hideTextStyle = { color: "transparent" } as CSSProperties;

const isFooter = (row: any) => get(row, "isFooter") === true;


export const getColumns=(totalPoints:number,mode:string, showSubpool:boolean)=>{
  switch (mode) {
    case MODAL_MODE.CREATE_CARRY_PLAN:
      return getCreateAllocationsColumns(totalPoints, showSubpool);
    case MODAL_MODE.EDIT_ALLOCATIONS:
      return getEditAllocationsColumns(totalPoints, showSubpool)
      case MODAL_MODE.ADD_ALLOCATIONS:
        return getIssueAllocationsColumns(totalPoints);
    default:
      break;
  }
}

 const getEditAllocationsColumns =(totalPoints:number, showSubpool:boolean)=> [
    {
      title: "Participant",
      dataKey: "name",
      width: 150,
      Cell: (row: any) => (
        <span style={isFooter(row) ? footerRowStyle : {}}>
          {get(row, "name")}
        </span>
      ),
    },
   {
     title: "Grant Date",
     dataKey: "grant_date",
     width: 150,
     Cell: (row: any) => (
       <span
         style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
       >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps")) ? "-" : standardizeDate(get(row, "grant_date"))}
      </span>
     ),
   },
   showSubpool ? {
     title: "Pool",
     dataKey: "sub_pool_name",
     width: 150,
     Cell: (row: any) => (
       <span
         style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
       >
        {isFooter(row) ? '-' : get(row, "sub_pool_name")}
      </span>
     ),
   } : {},
   {
     title: "Vehicle",
     dataKey: "vehicle.legal_name",
     width: 300,
     flexGrow: 2.5,
     Cell: (row: any) => (
       <span
         style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
       >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps") ) ? "-" : get(row, "vehicle.legal_name")}
      </span>
     ),
   },
   {
     title: "Share Class",
     dataKey: "share_class.legal_name",
     width: 300,
     flexGrow: 2.5,
     Cell: (row: any) => (
       <span
         style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
       >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps") ) ? "-" : get(row, "share_class.legal_name")}
      </span>
     ),
   },
    {
      title: "Vesting Schedule",
      dataKey: "vesting_schedule.name",
      width: 300,
      flexGrow: 2.5,
      Cell: (row: any) => (
        <span
          style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
        >
          {isFooter(row) ? "-" : get(row, "vesting_schedule.name")}
        </span>
      ),
    },
    {
      title: "Vesting Start Date",
      dataKey: "vesting_start_date",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span
          style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
        >
          {isFooter(row) ? "-" : standardizeDate(get(row,"vesting_start_date"))}
        </span>
      ),
    },
    {
        title: "Point",
        dataKey: "bps",
        width: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span style={isFooter(row) ? footerRowStyle : {}}>{limitCarryDecimalPlaces(get(row, "bps"))}</span>
        ),
      },
  ].filter(col=>Object.keys(col).length>0);

 const getIssueAllocationsColumns = (totalPoints:number) =>[
  {
    title: "Participant",
    dataKey: "name",
    width: 150,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "name")}
      </span>
    ),
  },
  {
    title: "Existing Points",
    dataKey: "existing_bps",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>{limitCarryDecimalPlaces(get(row, "existing_bps"))}</span>
    ),
  },
  {
    title: "Vesting Schedule",
    dataKey: "vesting_schedule.name",
    width: 300,
    flexGrow: 2.5,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
      >
        {isFooter(row) || !get(row, "bps") ? "-" : get(row, "vesting_schedule.name")}
      </span>
    ),
  },
  {
    title: "Vesting Start Date",
    dataKey: "vesting_start_date",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
      >
        {isFooter(row) || !get(row, "bps") ? "-" : standardizeDate(get(row,"vesting_start_date"))}
      </span>
    ),
  },
  {
      title: "New Pts",
      dataKey: "bps",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span style={isFooter(row) ? footerRowStyle : {}}>{limitCarryDecimalPlaces(get(row, "bps")||0)}</span>
      ),
    }
]

const getCreateAllocationsColumns = (totalPoints:number, showSubpool: boolean) =>[
  {
    title: "Participant",
    dataKey: "name",
    width: 150,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "name")}
      </span>
    ),
  },
  {
    title: "Grant Date",
    dataKey: "grant_date",
    width: 150,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
      >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps")) ? "-" : standardizeDate(get(row, "grant_date"))}
      </span>
    ),
  },
  showSubpool ? {
    title: "Pool",
    dataKey: "sub_pool_name",
    width: 150,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
      >
        {isFooter(row) ? '-' : get(row, "sub_pool_name")}
      </span>
    ),
  } : {},
  {
    title: "Vehicle",
    dataKey: "vehicle.legal_name",
    width: 300,
    flexGrow: 2.5,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
      >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps") ) ? "-" : get(row, "vehicle.legal_name")}
      </span>
    ),
  },
  {
    title: "Share Class",
    dataKey: "share_class.legal_name",
    width: 300,
    flexGrow: 2.5,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
      >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps") ) ? "-" : get(row, "share_class.legal_name")}
      </span>
    ),
  },
  {
    title: "Vesting Schedule",
    dataKey: "vesting_schedule.name",
    width: 300,
    flexGrow: 2.5,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? {...footerRowStyle, ...hideTextStyle} : {}}
      >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps") ) ? "-" : get(row, "vesting_schedule.name")}
      </span>
    ),
  },
  {
    title: "Vesting Start Date",
    dataKey: "vesting_start_date",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
      >
        {isFooter(row) || !(get(row, "existing_bps") || get(row, "bps") ) ? "-" : standardizeDate(get(row,"vesting_start_date"))}
      </span>
    ),
  },
  {
      title: "New Pts",
      dataKey: "bps",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span style={isFooter(row) ? footerRowStyle : {}}>{limitCarryDecimalPlaces(get(row, "bps")||0)}</span>
      ),
    }
]  

  export const generateAllocationsFooterData = (data: any[],mode:string) => {
    if(mode === MODAL_MODE.EDIT_ALLOCATIONS){
    return {
      isFooter: true,
      name:"Total",
      bps:data.reduce((total, obj) => decimalSum(total, (obj.bps || 0)).toString(), 0),
      position: -1,
      user_id:-1
    }}
    else return{
      isFooter: true,
      name:"Total",
      existing_bps: data.reduce((total, obj) => decimalSum(total, (obj.existing_bps || 0)).toString(), 0),
      bps:data.reduce((total, obj) => decimalSum(total , (obj.bps || 0)).toString(), 0),
      user_id:-1
    }
    ;
  };

  // export const mergeArraysByUserId = (A:any, B:any) =>
  // Object.values(
  //   [...A, ...B].reduce((acc, obj) => {
  //     const { user_id, bps } = obj;
  //     if (!acc[user_id] || bps > acc[user_id].bps) {
  //       acc[user_id] = obj;
  //     }
  //     return acc;
  //   }, {})
  // );
export const formatInfoTableData =(data:any)=>{
  const { default_vesting_schedule, bps, allocations, name, funds_and_deals } = data;
  return {
    name,
    defaultVestingScheduleName: default_vesting_schedule?.label,
    totalPoints:bps? createDecimal(bps).toString() : 0,
    participantsWithPoints: (allocations || []).filter(
      (allocation: any) => allocation.bps
    ).length,
    fundsAndDealsName: funds_and_deals.map((elem:any)=>elem.name).join(', '),
    allocatedPoints: decimalSum(getSumByProperty(allocations||[],'bps') , getSumByProperty(allocations||[],'existing_bps')).toString()
  };
}

export const formatNewAllocationsData = (data: any[], defaultVestingSchedule:any) => {

  if (data.length > 0 && data[0].isFormatted) {
    return data; 
  }
  const resultMap = new Map();

  data.forEach((item) => {
    if (resultMap.has(item.carry_participant_id)) {
      let existingEntry = resultMap.get(item.carry_participant_id);
      existingEntry.existing_bps = decimalSum(existingEntry.existing_bps, item.bps).toString();
    } else {
      resultMap.set(item.carry_participant_id, {
        ...item,
        carry_participant_id: item.carry_participant_id,
        name: item.name,
        existing_bps: item.bps ? createDecimal(item.bps).toString() : item.bps,
        bps: "",
        vesting_schedule: {name: defaultVestingSchedule.label, id: defaultVestingSchedule.value},
        vesting_start_date:"",
        isFormatted: true
      });
    }
  });

  return Array.from(resultMap.values());
};


export const getSelectorKey = (mode: string) => {
  switch (mode) {
    case MODAL_MODE.EDIT_ALLOCATIONS:
      return "allocation_id";
    case MODAL_MODE.ADD_ALLOCATIONS:
      return "carry_participant_id";

    default:
      return "carry_participant_id"
  }
};