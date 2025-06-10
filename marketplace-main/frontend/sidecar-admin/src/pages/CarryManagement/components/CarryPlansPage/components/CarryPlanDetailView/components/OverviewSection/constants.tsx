import { get, isEmpty, map, truncate, uniq } from "lodash";
import { CSSProperties, useState,MouseEvent } from "react";
import MenuIcon from "@material-ui/icons/MoreVert";
import Popover from "@material-ui/core/Popover";
import { getPillColor } from "../../../../../../constants";
import { StatusPill } from "../../../../../styles";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import { getSumByProperty, limitCarryDecimalPlaces} from "../../../../../../../../utils/getValue";
import FilePreviewModal from "../../../../../../../../components/FilePreviewModal";
import { decimalSubtract, createDecimal, decimalLessOrEqual } from "../../../../../../../../utils/decimal";

const footerRowStyle = {
  borderTop: "1px solid #D5DAE1",
  position: "absolute",
  top: "0px",
  padding: "8px",
  width: "100%",
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "28px",
  background: "#F5F7F8",
  left: 0,
} as CSSProperties;

const hideTextStyle = { color: "transparent" } as CSSProperties;

const isFooter = (row: any) => get(row, "isFooter") === true;

export const getColumns = (showSubpool:boolean, handleTransferPointsModal:any) => [
  {
    title: "Grant Date",
    dataKey: "grant_date",
    width: 150,
    Cell: (row: any) => (
      <span 
        style={isFooter(row) ? footerRowStyle : {}}>
        {isFooter(row) ? get(row,"grant_date") : <> {row.grant_date ? standardizeDate(get(row,"grant_date")): '-'}</> }
      </span>
    ),
  },
  {
    title: "Participant",
    dataKey: "name",
    width: 150,
    Cell: (row: any) => (
      <span 
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}>
        {isFooter(row) ? "-" : get(row, "name")}
      </span>
    ),
  },
  showSubpool?
  {
    title: "Carry Pool",
    dataKey: "sub_pool_name",
    width: 300,
    flexGrow: 2.5,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
      >
        {isFooter(row) ? "-" : get(row, "sub_pool_name")}
      </span>
    ),
  }:{},
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
    title: "Points",
    dataKey: "bps",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => {
      return (
          <span style={isFooter(row) ? footerRowStyle : {}}>{limitCarryDecimalPlaces(get(row, "bps"))}</span>
      )
    },
  },
  handleTransferPointsModal &&
 { 
  title: "",
  dataKey: "actions",
  fixed:'right',
  Cell: (row: any) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null);

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      if (event && event.currentTarget) {
        setAnchorEl(event?.currentTarget)
        event.stopPropagation()
      };
    };

    const handleClose = () => {
      setAnchorEl(null);
    };
    if(decimalLessOrEqual(row?.bps,'0')){
      return <span style={hideTextStyle}>-</span>
    }
    if(isFooter(row)){
      return <span style={{ ...footerRowStyle, ...hideTextStyle }}>-</span>
    }
    return (
      <div>
        <div
          style={{ display: "inline-block", cursor: "pointer" }}
          onClick={handleClick}
        >
          <MenuIcon />
        </div>
        <Popover
          id={"activate"}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          onClick={(event)=>{handleClose(); event.stopPropagation();}}
        >
          <div
            className="px-3 py-2 cursor-pointer"
            onClick={() => {  handleTransferPointsModal(row)}}
          >
            <span>Transfer Points</span>
          </div>
        </Popover>
      </div>
    );
  },
}
].filter(col=>!isEmpty(col));

export const generateInfoViewData = (carryPlanDetail: any) => {
  const {name, participants, bps, created_at, allocations, carry_documents, effective_date, funds_and_deals, allocated, un_allocated} =
    carryPlanDetail;
  const VestingSchedulesList = uniq(map(allocations, "vesting_schedule.name"));
  //const allocatedPoints = getSumByProperty(allocations,"bps")
  return [
    [
      { label: "Name", value: name },
      {label: "Source", value: (
        <div>
          {map(funds_and_deals,(elem)=>(
            <div>
              {elem.name}
            </div>
          ))}
        </div>
      )},
      { label: "Participants", value: uniq(participants).length.toString() },
      
      {
        label: "Documents",
        value: (
          <div>
            {map(carry_documents, (elem: any) => (
              <FilePreviewModal
                documentId={elem?.document?.document_id}
                documentName={elem?.document?.title}
                customDisplayButton={<div style={{cursor:'pointer', textDecoration:'underline'}}>{truncate(elem?.name)}</div>}
                showPreviewIcon={false}
              />
            ))}
          </div>
        ),
      },
      {},
    ],
    [
      { label: "Plan Creation Date", value: standardizeDate(created_at) },
      {label: "Effective Date", value: standardizeDate(effective_date)},
      {
        label: "Allocated Points",
        value: limitCarryDecimalPlaces(createDecimal(allocated).toString()),
      },
      {
        label: "Unallocated Points",
        value: limitCarryDecimalPlaces(createDecimal(un_allocated).toString()),
      },
      { label: "Total Points", value: limitCarryDecimalPlaces(bps) },
    ],
    [
      ...VestingSchedulesList.slice(0, 5).map((schedule) => ({
        value: schedule,
      })),
      ...Array(Math.max(0, 5 - VestingSchedulesList.length)).fill({}),
    ],
  ];
};

export const generateAllocationsFooterData = (data: any[]) => {
  return {
    isFooter: true,
    grant_date: "Total",
    bps: getSumByProperty(data,"bps")
  };
};
