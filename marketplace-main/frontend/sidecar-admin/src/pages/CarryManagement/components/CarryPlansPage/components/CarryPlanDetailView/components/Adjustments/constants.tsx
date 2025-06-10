import { get } from "lodash";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import MenuIcon from "@material-ui/icons/MoreVert";
import * as yup from 'yup';
import { MouseEvent, useState } from "react";
import { Popover } from "@material-ui/core";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import { formatWithParenthesis } from "../../../../../../../../utils/currency";
import {limitCarryDecimalPlaces} from "../../../../../../../../utils/getValue";
import { ADJUSTMENT_TYPES } from "./components/AdjustmentModal/constants";
import { DeleteIconWrapper } from "./styles";

export const VALIDATION_SCHEMA = yup.object({
  value_type: yup.object({
    label: yup.string().required('Label is required'),
    value: yup.number().required('Value is required'),
  }).required('value_type is required'),

  effective_date: yup.string()
    .required('Effective date is required'),

  adjustment: yup.string()
  .test('is-valid-number', 'Adjustment must be a valid number.', value => {
    if (!value || value.trim() === '' || value === '-') return false;
    const num = Number(value);
    return !isNaN(num) && num !== 0;
  })
    .required('Adjustment is required'),
});

export const getColumns = (toggleModal: any, handleAllocationClick:any,handleDeleteAdjustment:any) => [
  {
    title: "",
    dataKey: "tree",
    width: 30,
    fixed: 'left',
    Cell: () => {
      return <></>;
    },
  },
  {
    title: "Grant Date",
    dataKey: "grant_date",
    width: 170,
    flexGrow: 1.2,
    Cell: (row: any) => {
      return <span >
        {!row.isSubRow && row.grant_date ? standardizeDate(get(row, "grant_date")) : '-'}
      </span>
    },
  },
  {
    title: "Participant",
    dataKey: "name",
    width: 200,
    flexGrow: 1.5,
    Cell: (row: any) => {
      if (row.isSubRow) {
        return <span >
          -
        </span>
      }
      return <span
      style={{
        cursor: "pointer",
        fontWeight: 900,
        textDecoration: "underline",
      }}
      onClick={() => handleAllocationClick(row)}
    >
      {row.name ?? get(row, "name")}
    </span>
    },
  },
  {
    title: "Effective Date",
    dataKey: "effective_date",
    width: 180,
    flexGrow: 1.3,
    Cell: (row: any) => <span >
          {row.isSubRow && row.effective_date ? standardizeDate(get(row, "effective_date")) : '-'}
        </span>
  },
  {
    title: "Estimated Value",
    dataKey: "estimated_value",
    width: 170,
    flexGrow: 1.2,
    Cell: (row: any) => {
      if (row.isSubRow) {
        return <span >
          -
        </span>
      }
      return <span >
        {row.estimated_value ? formatWithParenthesis(row.estimated_value) : '-'}
      </span>
    },
  },
  {
    title: "Adjusted Estimated Value",
    dataKey: "adjusted_estimated_value", // this column value will be computed based on row.adjustments
    width: 200,
    flexGrow: 1.5,
    Cell: (row: any) => {
      if (row.isSubRow) {
        return <span >
          {row.value_type === ADJUSTMENT_TYPES.ESTIMATED_VALUE ? formatWithParenthesis(row.adjustment) : "-"}
        </span>
      }
      return <span >
        {row.adjusted_estimated_value ? formatWithParenthesis(row.adjusted_estimated_value) : '-'}
      </span>
    },
  },
  {
    title: "Fair Market Value",
    dataKey: "fair_market_value",
    width: 170,
    flexGrow: 1.2,
    Cell: (row: any) => {
      if (row.isSubRow) {
        return <span >
          -
        </span>
      }
      return <span >
        {row.fair_market_value ? formatWithParenthesis(row.fair_market_value) : '-'}
      </span>
    },
  },
  {
    title: "Adjusted Fair Market Value",
    dataKey: "adjusted_fair_market_value", // this column value will be computed based on row.adjustments
    width: 200,
    flexGrow: 1.5,
    Cell: (row: any) => {
      if (row.isSubRow) {
        return <span >
          {row.value_type === ADJUSTMENT_TYPES.FAIR_MARKET_VALUE ? formatWithParenthesis(row.adjustment) : "-"}
        </span>
      }
      return <span >
        {row.adjusted_fair_market_value ? formatWithParenthesis(row.adjusted_fair_market_value) : '-'}
      </span>
    },
  },
  {
    title: "Points",
    dataKey: "bps",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => {
      if (row.isSubRow) {
        return <span >
          -
        </span>
      }
      return <span >
        {row.bps ? limitCarryDecimalPlaces(get(row, "bps")) : '-'}
      </span>
    },
  },
  {
    title: "Description",
    dataKey: "note",
    width: 200,
    flexGrow: 1.5,
    Cell: (row: any) => {
      if (row.isSubRow) {
        return <span >
          {row.note}
        </span>
      }
      return <span >
        -
      </span>
    },
  },
  {
    title:"",
    dateKey:'delete',
    width: 50,
    Cell:(row:any)=>{
      
      return row.isSubRow? <DeleteIconWrapper>
      <TrashIcon onClick={() => handleDeleteAdjustment(row.id)} />
    </DeleteIconWrapper>:""
    }
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
                toggleModal(row);
              }}
            >
              <span>Create Adjustment</span>
            </div>
          </Popover>
        </div>
      );
    },
  },
];