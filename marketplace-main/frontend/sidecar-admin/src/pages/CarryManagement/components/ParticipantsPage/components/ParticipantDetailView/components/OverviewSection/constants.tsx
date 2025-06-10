import get from "lodash/get";
import { StatusPill } from "../../../../../styles";
import { getPillColor } from "../../../../../../constants";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { find } from "lodash";
import { getLatestDate, getSumByProperty, limitCarryDecimalPlaces, limitCarryDecimalPlacesString } from "../../../../../../../../utils/getValue";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import { decimalDivide, decimalMultiply, decimalSubtract } from "../../../../../../../../utils/decimal";

export const infoDisplay =(data:any)=> [
    [
      {
        label: "Name",
        value: get(data, "full_name"),
      },
      {
        label: "Employee Tier / Level",
        value: get(data, "tier"),
      },
      {
        label: "Title",
        value: get(data, "title"),
      },
    ],
    [
      {
        label: "Status",
        value: (
          <StatusPill color={getPillColor(get(data, "status", ""))}>
            {get(data, "status")}
          </StatusPill>
        ),
      },
      {
        label: "Hire Date",
        value: get(data, "hire_date"),
      },
      {
        label: "Office location",
        value: get(data, "office_location"),
      },
    ],
    [
      {
        label: "Email",
        value: get(data, "email"),
      },
      {
        label: "Wire Account",
        value: get(data, "wire_account"),
      },
      {
        label: "Bank Account",
        value: get(data, "bank_account"),
      },
    ],
  ];

  const getLatestYearRecord = (compensationHistory: any) => {
    const latestYear = Math.max(...compensationHistory.map((record: any) => record.year), 0);
    return find(compensationHistory, (record: any) => record.year === latestYear);
  }

  export const getTiles = (data: any, tiles: any) => {
    if(!data.participantCompensationHistory) return [];
    const latestYearRecord = getLatestYearRecord(data.participantCompensationHistory);
    return tiles.map((tile: any) => ({
      label: tile.heading,
      amount: get(latestYearRecord, tile.field_name, 0)
    }));
  }

  export const summaryBlockDisplay = (data:any, config: any)=> {
    const { benefits_breakdown, cash_tiles} = config || {};
    const estimatedValueLatestDate = data.carryPlansData ? `As of: ${standardizeDate(getLatestDate(data.carryPlansData, 'estimated_value_date'))}` : ''
    const vestedForcastedValue = getSumByProperty(data.carryPlansData,'participant_estimated_carry_vested')
    const unvestedForcastedValue = getSumByProperty(data.carryPlansData,'participant_estimated_carry_un_vested')
    return {
      salaryAndBonus: getTiles(data, cash_tiles),
      estimated_values_latest_date: estimatedValueLatestDate,
      benefits: getTiles(data, benefits_breakdown),
      vestedUnvested: [
        {
          label: "Forecasted Carry Value",
          splitAmount: [
            {
              label: "Vested",
              amount: vestedForcastedValue,
            },
            {
              label: "Unvested",
              amount: unvestedForcastedValue,
            },
          ],
        },
      ]
    }
};

  export const totalCompensationBlockDisplay = (data: any) => 
  [
    { key: "total_benefits", label: "Benefits", value: get(data, "total_benefits") },
    { key: "salary", label: "Salary", value: get(data, "salary") },
    { key: "bonus", label: "Bonus", value: get(data, "bonus") },
    // {
    //   key: "forcasted_carry_value",
    //   label: "Forecasted Carry Value",
    //   value:
    //     get(data, "vested_forecasted_value", 0) +
    //     get(data, "unvested_forecasted_value", 0),
    // },
  ];


  export const getCarryPlansColumns = (handleAllocationClick: any, hasEntity: boolean) => {
    let columns = [
      {
        title: "Source",
        fixed: "left",
        dataKey: "carry_plan_name",
        minWidth: 200,
        flexGrow: 1.3,
        Cell: (row: any) => (
            <span style={{cursor: 'pointer'}} onClick={() => handleAllocationClick(row)}>
            {get(row, 'carry_plan_name')}
          </span>
        ),
      },
      {
        title: "Points",
        dataKey: "bps",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
            <span>
          <span>{limitCarryDecimalPlaces(get(row, "bps",))}</span>
        </span>
        ),
      },
      {
        title: "Forfeited Points",
        dataKey: "forfeited_bps",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
            <span>
          <span>{limitCarryDecimalPlaces(get(row, "forfeited_bps",))}</span>
        </span>
        ),
      },
      {
        title: "Vested",
        dataKey: "vested_bps",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
            <span>
          <span>{limitCarryDecimalPlaces(get(row, "vested_bps",))}</span>
        </span>
        ),
      },
      {
        title: "Schedule",
        dataKey: "vesting_schedule_id.name",
        minWidth: 200,
        flexGrow: 1.3,
        Cell: (row: any) => (
          <span>
          {get(row, 'vesting_schedule_id.name')}
        </span>
      ),
      },
      {
        title: "$ Vested",
        dataKey: "participant_estimated_carry_vested",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(Number(get(row, 'participant_estimated_carry_vested')))}</span>
      },
      {
        title: "$ Unvested",
        dataKey: "participant_estimated_carry_un_vested",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(Number(get(row, 'participant_estimated_carry_un_vested')))}</span>
      },
      {
        title: "Distributions",
        dataKey: 'distributions',
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(Number(get(row, 'distributions')))}</span>
      }
    ]
    if(hasEntity){
      columns.splice(2, 0,      {
        title: "Entity",
        dataKey: "entity_name",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{get(row, 'entity_name', get(row, 'full_name', ''))}</span>
      },)
    }
    return columns;
  }
  
  export const getCompensationHistoryColumns = (columns: any) => {
    return columns.map((column: any) => ({
      title: column.heading,
      dataKey: column.field_name,
      minWidth: 200,
      flexGrow: 1.3,
      Cell: (row:any)=> {
        if(column.field_type === 'currency') {
          return <span>{formatCurrencyWithTwoDecimals(get(row, column.field_name))}</span>
        }
        else return <>{get(row, column.field_name, '-')}</>
      }
    }))
  }
  
  export const formatForfeitureRes = (data: any[]) =>
    data.map((dat: any) => {
      const percent_pool = 
        decimalDivide(get(dat, "bps"), get(dat, "carry_pool_points"));
      const estimated_value =
        decimalMultiply(get(dat, "carry_plan_estimated_value", 0), percent_pool);
      const vested_value = 
        decimalMultiply(decimalDivide(get(dat, "vested_bps"), (get(dat, "bps") || 1)), estimated_value).toString();
      const unvested_value = decimalSubtract( estimated_value, vested_value).toString();
      return {
        ...dat,
        percent_pool,
        estimated_value,
        vested_value,
        unvested_value,
      };
    });
  
  export const getOverviewExportData = (data: any[]) => {
    return data.map((row) => ({
      ...row,
      bps: limitCarryDecimalPlacesString(get(row, "bps",)),
      forfeited_bps: limitCarryDecimalPlacesString(get(row, "forfeited_bps")),
      vested_bps: limitCarryDecimalPlacesString(get(row, "vested_bps",)),
      participant_estimated_carry_vested: formatCurrencyWithTwoDecimals(Number(get(row, 'participant_estimated_carry_vested'))),
      participant_estimated_carry_un_vested: formatCurrencyWithTwoDecimals(Number(get(row, 'participant_estimated_carry_un_vested'))),
      distributions: limitCarryDecimalPlacesString(Number(get(row, 'distributions')))
    }))
  }
