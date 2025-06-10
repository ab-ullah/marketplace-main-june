import { Col } from "react-bootstrap";
import { FormTextFieldRow } from "../../../../../../../../../../components/Form/TextField";
import {
  AssignButton,
  CountText,
  HelperTextCont,
  SectionBorder,
  StyledRow,
} from "../../styles";
import { getSumByProperty, isValidPositiveDecimal } from "../../../../../../../../../../utils/getValue";
import RsuiteTable from "../../../../../../../../../../components/Table/RSuite";
import { useRef, useState, useMemo, useEffect } from "react";
import {
  formatAllocationsData,
  generateFooter,
  generateUnallocatedRow,
  getColumns,
} from "./constants";
import get from "lodash/get";
import filter from "lodash/filter";

const AutoDistribute = ({ state, setState }: any) => {
  const [editState, setEditState] = useState<{
    search: string;
    escrow_percentage: string | number;
  }>({
    search: "",
    escrow_percentage: "",
  });
  const selectedRows = useRef<any[]>([]);
  const [selectResetTrigger, setSelectResetTrigger] = useState(false);
  const [selectedAllocationsCount, setSelectedAllocationsCount] = useState(0);

  const allocationsList = useMemo(
    () =>
      formatAllocationsData(
        get(state, "allocations", []),
        Number(get(state, "total_points", 0)),
        Number(get(state, "amount", 0))
      ),
    [state.allocations, state.amount]
  );

  const UnallocatedRow = useMemo(
    () =>
      generateUnallocatedRow(
        Number(state.amount || 0),
        state.unallocated_points,
        state.total_points
      ),
    [state.amount, state.unallocated_points]
  );

  const footerRow = useMemo(
    () => generateFooter(allocationsList),
    [allocationsList]
  );

  const handleEditState = (key: string, value: any) => {
    setEditState((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleResetEditState = () => {
    setEditState((prev) => ({
      ...prev,
      escrow_percentage: "",
    }));
  };

  const handleResetSelected = () => {
    setSelectResetTrigger((prev) => !prev);
  };

  const handleSelectRow = (_rows: any[]) => {
    const rows = _rows.filter((row) => row);
    selectedRows.current = rows;
    setSelectedAllocationsCount(rows.length);
  };
  const handleAssign = () => {
    const { escrow_percentage } = editState;
    const updatedAllocations = state.allocations.map((allocation: any) => {
      return {
        ...allocation,
        ...(selectedRows?.current?.includes(allocation["allocation_id"])
          ? {
              escrow_percentage: Number(escrow_percentage),
            }
          : {}),
      };
    });

    setState((prev: any) => ({ ...prev, allocations: updatedAllocations }));
    handleResetEditState();
    handleResetSelected();
  };

  const searchFilter = (data: any) => {
    if (editState.search)
      return filter(data, (dat: any) =>
        dat.full_name.toLowerCase().includes(editState.search.toLowerCase())
      );
    else return data;
  };

  useEffect(() => {
    setState((prev: any) => ({
      ...prev,
      formattedAllocations: allocationsList,
      net_distribution: getSumByProperty(allocationsList, "net_distribution"),
    }));
  }, [allocationsList]);

  return (
    <SectionBorder>
      <div>
        <CountText>{selectedAllocationsCount} selected Allocations</CountText>
        <HelperTextCont>
          Edit escrow percentage for selected Allocations
        </HelperTextCont>
      </div>
      <div className="mt-2">
        <StyledRow>
          <Col lg={4}>
            <FormTextFieldRow
              label=""
              placeholder="Search participants"
              name="search"
              onChange={(e: any) => handleEditState("search", e.target.value)}
              value={editState.search}
            />
          </Col>

          <Col lg={4}>
            <FormTextFieldRow
              label=""
              placeholder="Escrow percentage - e.g. 20%"
              name="escrow_percentage"
              onChange={(e: any) => {
                const val = e.target.value;
                if (
                  (isValidPositiveDecimal(val) && Number(val) <= 100) ||
                  val === ""
                )
                  handleEditState("escrow_percentage", val);
              }}
              value={editState.escrow_percentage}
            />
          </Col>
          <Col>
            <div className="mt-2">
              <AssignButton
                onClick={() => handleAssign()}
                disabled={
                  !selectedAllocationsCount ||
                  editState.escrow_percentage === ""
                }
              >
                Assign Escrow
              </AssignButton>
            </div>
          </Col>
        </StyledRow>
        <div className="mt-3">
          <RsuiteTable
            height="400px"
            allowColMinWidth={true}
            rowSelection={true}
            dataKey="allocation_id"
            handleSelectRow={(rows) => handleSelectRow(rows)}
            selectResetTrigger={selectResetTrigger}
            columns={getColumns()}
            data={
              allocationsList.length
                ? [...searchFilter(allocationsList), UnallocatedRow, footerRow]
                : []
            }
            rowHeight={72}
          />
        </div>
      </div>
    </SectionBorder>
  );
};

export default AutoDistribute;
