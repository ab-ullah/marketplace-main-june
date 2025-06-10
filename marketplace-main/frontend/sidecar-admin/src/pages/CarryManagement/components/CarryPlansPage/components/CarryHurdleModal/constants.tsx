import * as Yup from "yup";
import { decimalGreaterThan } from "../../../../../../utils/decimal";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import get from "lodash/get";
import { limitCarryDecimalPlaces } from "../../../../../../utils/getValue";

export const HURDLE_MODE = {
  EVENLY: 1,
  PRO_RATA: 2,
};

export const hurdleModeOptions = [
  { label: "Pro-rata", value: HURDLE_MODE.PRO_RATA },
  // { label: "Evenly", value: HURDLE_MODE.EVENLY },
];

export const APPLIES_TO_TYPES = {
  ESTIMATED_VALUE: 1,
  FAIR_MARKET_VALUE: 2,
};

export const appliesToOptions = [
  { label: "Estimated Carry Value", value: APPLIES_TO_TYPES.ESTIMATED_VALUE },
  { label: "Fair Market Value", value: APPLIES_TO_TYPES.FAIR_MARKET_VALUE },
];

export const INITIAL_VALUES = {
  supercharge_end_value: "",
  hurdle_rate: "",
  impact_type: hurdleModeOptions[0],
  applies_to: appliesToOptions[0],
  is_supercharged: false,
  source_allocations: [],
  impacted_allocations: [],
};

const maxDigits = (
  maxInt: number,
  maxDecimalPlaces: number,
  fieldName: string
) => {
  return Yup.number()
    .test(
      "max-integers",
      `Please reach out to support to create a hurdle with ${fieldName} that's larger than ${maxInt} digits`,
      (value) => !value || value.toString().split(".")?.[0].length <= maxInt
    )
    .test(
      "max-decimals",
      `Ensure that there are no more than ${maxDecimalPlaces} decimal places`,
      (value) =>
        !value ||
        (value.toString().split(".")?.[1]?.length || 0) <= maxDecimalPlaces
    );
};

export const VALIDATION_SCHEMA = Yup.object({
  supercharge_end_value: Yup.string().when("is_supercharged", {
    is: true,
    then: (schema) =>
      schema
        .test("is-positive", "Must be a positive number", (value) =>
          decimalGreaterThan(value, 0)
        )
        .test(
          "max-integers",
          `Please reach out to support to create a hurdle with Supercharge End Value that's larger than 11 digits`,
          (value) => !value || value.toString().split(".")?.[0].length <= 11
        )
        .test(
          "max-decimals",
          `Ensure that there are no more than 2 decimal places`,
          (value) =>
            !value || (value.toString().split(".")?.[1]?.length || 0) <= 2
        ),
  }),
  hurdle_rate: maxDigits(11, 2, "Hurdle Rate")
    .test("is-positive", "Must be a positive number", (value) =>
      decimalGreaterThan(value, 0)
    )
    .nullable(true),
  source_allocations: Yup.array()
    .min(1, "At least one source allocation is required")
    .required("Source allocations are required"),
  impact_type: Yup.object({
    label: Yup.string().required("Mode label is required"),
    value: Yup.string().required("Mode value is required"),
  })
    .required("Mode is required")
    .typeError("Mode must be selected"),
    applies_to: Yup.object({
      label: Yup.string().required("Label is required"),
      value: Yup.string().required("Value is required"),
    })
      .required("Choose what does this hurdle appliess to")
      .typeError("Choose what does this hurdle appliess to"),
});

const COL_TOOLTIPS={
  ecv_hurdle:{
    key:'ecv_hurdle',
    tooltip:{
      heading:'Hurdle Exists for ECV',
      description:'It indicates if this allocation has an existing hurdle that applies to its Estimated Carry Value'
    }
  },
  fmv_hurdle:{
    key:'fmv_hurdle',
    tooltip:{
      heading:'Hurdle Exists for FMV',
      description:'It indicates if this allocation has an existing hurdle that applies to its Fair Market Value'
    }
  }
}

export const getColumns = (showSubpool: boolean) =>
  [
    {
      title: "Participant",
      dataKey: "name",
      width: 150,
    },
    {
      title: "Hurdle For ECV",
      dataKey: "ecv_hurdle",
      width: 150,
      flexGrow: 1,
      tooltip:COL_TOOLTIPS.ecv_hurdle,
      Cell: (row: any) => <span>{get(row, "ecv_hurdle") ? "Yes" : "No"}</span>,
    },
    {
      title: "Hurdle For FMV",
      dataKey: "fmv_hurdle",
      width: 150,
      flexGrow: 1,
      tooltip:COL_TOOLTIPS.fmv_hurdle,
      Cell: (row: any) => <span>{get(row, "fmv_hurdle") ? "Yes" : "No"}</span>,
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
      title: "Point",
      dataKey: "bps",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span>{limitCarryDecimalPlaces(get(row, "bps"))}</span>
      ),
    },
  ].filter((col) => Object.keys(col).length > 0);
