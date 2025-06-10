import { get, isEqual, truncate } from "lodash";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import TooltipWrapper from "../../../../../../components/Tooltip";
import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";


export const getColumns = (selectParticipantToView: any) => [
  {
    title: "Name",
    fixed: "left",
    dataKey: "full_name",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) => (
      <span
        style={{
          cursor: "pointer",
          fontWeight: 900,
          textDecoration: "underline",
        }}
        onClick={() => selectParticipantToView(row.id, row.full_name)}
      >
        {row.full_name}
      </span>
    ),
  },
  {
    title: "Entity Name",
    dataKey: "entity_name",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) =>  <TooltipWrapper enable={!isEqual(truncate(get(row,'entity_name')),get(row,'entity_name'))} text={get(row,'entity_name')}>
    <span>
      {truncate(get(row,'entity_name'))}
    </span>
  </TooltipWrapper>,
  },
  {
    title: "Title",
    dataKey: "title",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) =>  <TooltipWrapper enable text={get(row,'title')}>
    <span>
      {truncate(get(row,'title'))}
    </span>
  </TooltipWrapper>,
  },
  {
    title: "Type",
    dataKey: "entity_type",
    minWidth: 200,
    flexGrow: 1.3,
  },
  {
    title: "Hire Date",
    dataKey: "hire_date",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.hire_date)}</span>,
  },
  {
    title: "Estimated Carry Value",
    dataKey: "estimated_carry_value",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.estimated_carry_value)}</span>
  },
];

export const dummyData = [
  {
    allocation_id: "A123",
    name: "John Doe",
    title: "Software Engineer",
    salary: 50000,
    bonus: 7000,
    hire_date: "2022-01-15",
    carry_distributions: 2500,
    carry_escrow: 3000,
    net_distributions: 45000,
    status: "Active",
  },
  {
    allocation_id: "A124",
    name: "Jane Smith",
    title: "Data Analyst",
    salary: 48000,
    bonus: 6500,
    hire_date: "2021-11-05",
    carry_distributions: 3000,
    carry_escrow: 2800,
    net_distributions: 42000,
    status: "Active",
  },
  {
    allocation_id: "A125",
    name: "Michael Johnson",
    title: "Project Manager",
    salary: 52000,
    bonus: 7200,
    hire_date: "2020-09-30",
    carry_distributions: 2700,
    carry_escrow: 3200,
    net_distributions: 46000,
    status: "Active",
  },
  {
    allocation_id: "A126",
    name: "Emily Davis",
    title: "UX Designer",
    salary: 49000,
    bonus: 6700,
    hire_date: "2023-03-12",
    carry_distributions: 2800,
    carry_escrow: 3100,
    net_distributions: 43000,
    status: "Active",
  },
  {
    allocation_id: "A127",
    name: "David Brown",
    title: "Finance Manager",
    salary: 53000,
    bonus: 7500,
    hire_date: "2019-08-17",
    carry_distributions: 2600,
    carry_escrow: 2900,
    net_distributions: 47000,
    status: "Active",
  },
  {
    allocation_id: "A128",
    name: "Sara Taylor",
    title: "Marketing Specialist",
    salary: 47000,
    bonus: 6400,
    hire_date: "2022-07-22",
    carry_distributions: 2900,
    carry_escrow: 3300,
    net_distributions: 44000,
    status: "Active",
  },
  {
    allocation_id: "A129",
    name: "Alex Martin",
    title: "Sales Representative",
    salary: 51000,
    bonus: 7100,
    hire_date: "2021-04-18",
    carry_distributions: 2600,
    carry_escrow: 3100,
    net_distributions: 45000,
    status: "Active",
  },
  {
    allocation_id: "A130",
    name: "Laura Adams",
    title: "HR Specialist",
    salary: 48000,
    bonus: 6600,
    hire_date: "2020-12-09",
    carry_distributions: 2900,
    carry_escrow: 3200,
    net_distributions: 43000,
    status: "Active",
  },
  {
    allocation_id: "A131",
    name: "Kevin White",
    title: "Operations Manager",
    salary: 52000,
    bonus: 7300,
    hire_date: "2023-02-28",
    carry_distributions: 2800,
    carry_escrow: 3000,
    net_distributions: 46000,
    status: "Active",
  },
  {
    allocation_id: "A132",
    name: "Jessica Turner",
    title: "Customer Support Specialist",
    salary: 49000,
    bonus: 6800,
    hire_date: "2021-09-10",
    carry_distributions: 2700,
    carry_escrow: 3100,
    net_distributions: 44000,
    status: "Active",
  },
];
