import EditPool from "./components/CarryPoolModal";
import DeleteIcon from "@material-ui/icons/DeleteOutlined";
import RestoreIcon from "@material-ui/icons/RestoreFromTrash";
import { Clickable, DisableDiv } from "./styles";
import { calculateAllocatedBps, calculateUnAllocatedBps } from "./utils";
import TooltipWrapper from "../../../../components/Tooltip";
import VestingScheduleModal from "./components/VestingScheduleModal";

export const getPoolsTableColumns = (
  setRowForAction: any,
  refetchData: any,
  handleOpenPool: any,
  hierarchy: any[],
  selectedPoolObject: any
) => [
  {
    title: "Carry Allocation Name",
    dataKey: "name",
    flexGrow: 1,
    minWidth: 200,
    fixed: "left",
    Cell: (row: any) => (
      <Clickable onClick={() => handleOpenPool(row.external_id)}>
        {" "}
        {row.name}{" "}
      </Clickable>
    ),
  },
  {
    title: "Basis Points Allocated",
    dataKey: "allocated_points",
    flexGrow: 1,
    minWidth: 200,
    Cell: (row: any) => (
      <span> {Number(calculateAllocatedBps(row) || 0)} </span>
    ),
  },
  {
    title: "Basis Points Unallocated",
    flexGrow: 1,
    minWidth: 220,
    Cell: (row: any) => (
      <span> {row.bps - (calculateAllocatedBps(row) || 0)} </span>
    ),
  },
  {
    title: "Total Basis Points",
    flexGrow: 1,
    minWidth: 200,
    Cell: (row: any) => <span> {Number(row.bps)} </span>,
  },
  {
    title: "",
    dataKey: "actions",
    flexGrow: 0.5,
    minWidth: 80,
    fixed: "right",
    Cell: (row: any) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {" "}
        <EditPool
          pool={row}
          refetchData={refetchData}
          hierarchy={hierarchy}
          //  Calculating unAllocatedBps of the pool whose children
          //  contains this row because the children get bps from the parents quota
          unAllocatedBps={calculateUnAllocatedBps(selectedPoolObject)}
        />
        {/* {hierarchy.length > 1 && (row.deleted ? (
          <RestoreIcon />
        ) : (
          <TooltipWrapper text="Forfeit" enable>
            <DisableDiv>
            <DeleteIcon onClick={() => setRowForAction({row,action:'Forfeit'})} />
            </DisableDiv>
          </TooltipWrapper>
        ))} */}
      </div>
    ),
  },
];

export const getAllocationsTableColumns = (setRowForAction: any,vestingSchedules:any[], hierarchy: any[]) => [
  {
    title: "Name",
    dataKey: "user.display_name",
    flexGrow: 1,
    minWidth: 200,
    fixed: "left",
  },
  {
    title: "Email",
    flexGrow: 1,
    minWidth: 220,
    dataKey: "user.email",
  },
  {
    title: "Basis Points Allocated",
    dataKey: "bps",
    flexGrow: 1,
    minWidth: 200,
  },
  {
    title: "",
    dataKey: "actions",
    flexGrow: 0.5,
    minWidth: 80,
    fixed: "right",
    Cell: (row: any) => {
      const disablForfeit = !row.bps;
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <TooltipWrapper text="Forfeit" enable>
            <DisableDiv disabled={disablForfeit}>
              <DeleteIcon
                onClick={() =>
                  disablForfeit
                    ? null
                    : setRowForAction({ row, action: "Forfeit" })
                }
              />
            </DisableDiv>
          </TooltipWrapper>
          <TooltipWrapper text="Calculate vested points" enable>
            <DisableDiv disabled={!row.bps || vestingSchedules.length === 0}>
            <VestingScheduleModal
              vestingSchedules={vestingSchedules}
              hierarchy={hierarchy}
              allocation={row}
              disabled={!row.bps || vestingSchedules.length === 0}
            />
            </DisableDiv>
          </TooltipWrapper>
        </div>
      );
    },
  },
];

export const TABS={
  POOLS:'pools',
  ALLOCATIONS:'allocations'
}

export const CARRY_ALLOCATE_TYPE = {
  'FORFEITE': 3,
  'DILUTE': 4
}

export const dummyList = 
{
  external_id:null,
  name:'#',
  bps:1000,
  pools:[
  {
    external_id: 10001,
    name: "My First Carry Allocation",
    bps: 125,
    pools: [
      {
        external_id: 10002,
        name: "Executive",
        bps: 35,
        pools: [
          {
            external_id: 10003,
            name: "My Executive Carry Allocation",
            bps: 20,
            participants: [
              {
                id: 1104,
                email: "omair@hellosidecar.com",
                bps: 10,
              },
              {
                id: 1105,
                email: "zohaib@hellosidecar.com",
                bps: 10,
              },
            ],
            pools:[]
          },
        ],
        participants: [
          {
            id: 1101,
            email: "daniel@hellosidecar.com",
            bps: 5,
          },
          {
            id: 1102,
            email: "anna@hellosidecar.com",
            bps: 5,
          },
          {
            id: 1103,
            email: "marco@hellosidecar.com",
            bps: 5,
          },
        ],
      },
      {
        name: "Deal Team",
        bps: 60,
        external_id: 20001,
        pools: [],
        participants: [],
      },
      {
        name: "Bonus",
        bps: 5,
        external_id: 30001,
        pools: [],
        participants: [],
      },
      {
        name: "Reserve",
        bps: 20,
        external_id: 40001,
        pools: [],
        participants: [],
      },
    ],
    participants: [],
  },
  {
    external_id: 55,
    name: "My Second Allocation",
    bps: 500,
    pools: [],
    participants: [],
  },
]
}