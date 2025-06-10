import get from "lodash/get";
import { limitCarryDecimalPlaces } from "../../../../../../utils/getValue";
import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";

export const getColumns = () => {
  return [
    {
      title: "Source",
      dataKey: "carry_plan_name",
      minWidth: 180,
      flexGrow: 1,
    },
    {
      title: "Points",
      dataKey: "bps",
      minWidth: 100,
      flexGrow: 0.6,
      Cell: (row: any) => (
        <span>{limitCarryDecimalPlaces(get(row, "bps"))}</span>
      ),
    },
    {
      title: "Entity",
      dataKey: "entity_name",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{get(row, "entity_name")}</span>,
    },
    {
      title: "Forfeited Points",
      dataKey: "forfeited_bps",
      minWidth: 100,
      flexGrow: 0.6,
      Cell: (row: any) => (
        <span>{limitCarryDecimalPlaces(get(row, "forfeited_bps"))}</span>
      ),
    },
    {
      title: "Vested",
      dataKey: "vested_bps",
      minWidth: 100,
      flexGrow: 0.6,
      Cell: (row: any) => (
        <span>{limitCarryDecimalPlaces(get(row, "vested_bps"))}</span>
      ),
    },
    {
      title: "Vested Percentage",
      dataKey: "percentage_vested",
      width: 200,
      flexGrow: 1.5,
      Cell: (row: any) => (
        <span>{limitCarryDecimalPlaces(get(row, "percentage_vested"))} %</span>
      ),
    },
    {
      title: "$ Vested",
      dataKey: "participant_estimated_carry_vested",
      minWidth: 120,
      flexGrow: 0.8,
      Cell: (row: any) => (
        <span>{formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry_vested"))}</span>
      ),
    },

    {
      title: "$ Unvested",
      dataKey: "participant_estimated_carry_un_vested",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span>{formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry_un_vested"))}</span>
      ),
    },
    {
      title: "Distributions",
      dataKey: "distributions",
      minWidth: 110,
      flexGrow: 0.6,
      Cell: (row: any) => (
        <span>{formatCurrencyWithTwoDecimals(get(row, "distributions"))}</span>
      ),
    },
  ];
};
