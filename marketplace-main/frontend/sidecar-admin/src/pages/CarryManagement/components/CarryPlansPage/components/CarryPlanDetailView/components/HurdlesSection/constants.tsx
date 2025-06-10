import get from "lodash/get";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import { limitCarryDecimalPlaces } from "../../../../../../../../utils/getValue";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { useState, MouseEvent } from "react";
import MenuIcon from "@material-ui/icons/MoreVert";
import Popover from "@material-ui/core/Popover";
import find from "lodash/find";
import { appliesToOptions } from "../../../CarryHurdleModal/constants";

const getAppliesToLabelByValue =(_value:any)=>{
  return find(appliesToOptions,(opt:any)=>opt.value==_value)?.label
}

export const getColumns = (
  showSubpool: boolean,
  handleDeleteHurdle: any,
  handleAllocationClick: any
) =>
  [
    {
      title: "",
      dataKey: "tree",
      width: 30,
      fixed:'left',
      Cell: () => {
        return <></>;
      },
    },
    {
      title: "Participant",
      dataKey: "name",
      width: 150,
      fixed:'left',
      Cell: (row: any) => (
        <span
          style={{
            cursor: "pointer",
            fontWeight: 900,
            textDecoration: "underline",
          }}
          onClick={() => handleAllocationClick(row)}
        >
          {get(row, "name")}
        </span>
      ),
    },
    {
      title: "Grant Date",
      dataKey: "grant_date",
      width: 150,
      Cell: (row: any) => (
        <span>{standardizeDate(get(row, "grant_date"))}</span>
      ),
    },
    showSubpool
      ? {
          title: "Pool",
          dataKey: "sub_pool_name",
          width: 150,
          Cell: (row: any) => <span>{get(row, "sub_pool_name")}</span>,
        }
      : {},
    {
      title: "Vehicle",
      dataKey: "vehicle.legal_name",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{get(row, "vehicle.legal_name")}</span>,
    },
    {
      title: "Share Class",
      dataKey: "share_class.legal_name",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{get(row, "share_class.legal_name")}</span>,
    },
    {
      title: "Vesting Schedule",
      dataKey: "vesting_schedule.name",
      width: 400,
      flexGrow: 3,
      Cell: (row: any) => <span>{get(row, "vesting_schedule.name")}</span>,
    },
    {
      title: "Vesting Start Date",
      dataKey: "vesting_start_date",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span>{standardizeDate(get(row, "vesting_start_date"))}</span>
      ),
    },
    {
      title: "Points",
      dataKey: "bps",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span>{limitCarryDecimalPlaces(get(row, "bps"))}</span>
      ),
    },
    {
      title: "Hurdle Rate",
      dataKey: "hurdle_rate",
      width: 150,
      Cell: (row: any) =>
        row?.isSubRow ? (
          <span>-</span>
        ) : (
          <span>{formatCurrencyWithTwoDecimals(get(row, "hurdle_rate"))}</span>
        ),
    },
    {
      title: "Applies To",
      dataKey: "applies_to",
      width: 150,
      Cell: (row: any) =>
        row?.isSubRow ? (
          <span>-</span>
        ) : (
          <span>{getAppliesToLabelByValue(get(row, "applies_to",1))}</span>
        ),
    },
    {
      title: "Post-hurdle preference",
      dataKey: "is_supercharged",
      width: 150,
      Cell: (row: any) =>
        row?.isSubRow ? (
          <span>-</span>
        ) : (
          <span>{get(row, "is_supercharged") ? "Yes" : "No"}</span>
        ),
    },
    {
      title: "Preference end value",
      dataKey: "supercharge_end_value",
      width: 150,
      Cell: (row: any) =>
        row?.isSubRow ? (
          <span>-</span>
        ) : (
          <span>
            {get(row, "supercharge_end_value")
              ? formatCurrencyWithTwoDecimals(get(row, "supercharge_end_value"))
              : "-"}
          </span>
        ),
    },
    {
      title: "",
      dataKey: "actions",
      fixed: "right",
      width: 30,
      Cell: (row: any) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null);

        const handleClick = (event: MouseEvent<HTMLDivElement>) => {
          if (event && event.currentTarget) {
            setAnchorEl(event?.currentTarget);
            event.stopPropagation();
          }
        };

        const handleClose = () => {
          setAnchorEl(null);
        };
        if (row?.isSubRow) {
          return <span></span>;
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
              onClick={(event) => {
                handleClose();
                event.stopPropagation();
              }}
            >
              <div
                className="px-3 py-2 cursor-pointer"
                onClick={() => {
                  handleDeleteHurdle(row);
                }}
              >
                <span>Delete</span>
              </div>
            </Popover>
          </div>
        );
      },
    },
  ].filter((col) => Object.keys(col).length > 0);
