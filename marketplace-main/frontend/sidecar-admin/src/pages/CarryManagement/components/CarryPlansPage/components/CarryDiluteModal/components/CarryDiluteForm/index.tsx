import { useEffect, useMemo, useRef, useState } from "react";
import InfoTable from "./components/InfoTable";
import {
  diluteModeOptions,
  formatInfoTableData,
  getColumns,
} from "./constants";
import {
  AssignButton,
  CountText,
  HelperTextCont,
  SectionBorder,
  SpaceBetween,
  StyledRow,
} from "./styles";
import filter from "lodash/filter";
import { Col } from "react-bootstrap";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { generateDateTimeWithZeroTime } from "../../../../../../../../utils/dateFormatting";
import API from "../../../../../../../../api/backendApi";
import {isValidPositiveDecimal, isValidPositiveUncappedDecimal} from "../../../../../../../../utils/getValue";
import { isEmpty } from "lodash";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import { createDecimal } from "../../../../../../../../utils/decimal";
import ReactDatePickerComp from "../../../../../../../../components/ReactDatePickerComp";

interface ICarryDiluteFormProps {
  carryPlanDetail: any;
  setDilutePayload: any;
  setHasError: any;
}

const CarryDiluteForm = ({ carryPlanDetail, setDilutePayload, setHasError }: ICarryDiluteFormProps) => {
  const [selectedParticipantsCount, setSelectedParticipantsCount] = useState(0);
  const [editState, setEditState] = useState<{
    search: string;
    dilute_points: string | number;
    dilute_date: string;
    mode: Record<string,any> | null
    errors: string[];
  }>({
    search: "",
    dilute_points: "",
    dilute_date: "",
    mode: null,
    errors:[]
  });
  const [selectResetTrigger, setSelectResetTrigger] = useState(false);
  const [disbaleCalculate, setDisableCalculate] = useState(false);

  const selectedRows = useRef<any[]>([]);
  const [allocationsMap, setAllocationsMap] = useState(new Map());

  const allocationsTableData = useMemo(
    () => Array.from(allocationsMap.values()),
    [allocationsMap]
  );

  const hasErrors = !isEmpty(editState.errors)

  const {
    allocations,
    bps,
    carryPlanId,
  } = carryPlanDetail;
  const handleEditState = (key: string, value: any) => {
    setEditState((prev: any) => ({ ...prev, [key]: value }));
  };

  const searchFilter = (data: any) => {
    if (editState.search)
      return filter(data, (dat: any) =>
        dat.name.toLowerCase().includes(editState.search.toLowerCase())
      );
    else return data;
  };

  const handleSelectRow = (_rows: any[]) => {
    const rows = _rows.filter((row) => row);
    selectedRows.current = rows;
    setSelectedParticipantsCount(rows.length);
  };

  const handleResetEditState = () => {
    setEditState((prev) => ({
      ...prev,
      dilute_points: "",
      dilute_date: "",
      mode:null,
      errors:[]
    }));
    setHasError(false)
  };

  const handleResetSelected = () => {
    setSelectResetTrigger((prev) => !prev);
  };

  const handleCalculate = async () => {
    if (disbaleCalculate) {
      setAllocationsMap(
        new Map(allocations.map((dat: any) => [dat.allocation_id, dat]))
      );
      setDilutePayload(null)
      handleResetSelected();
      handleResetEditState();
      setDisableCalculate(false);
    } else {
      const selectedAllocations: any[] = [];
      selectedRows.current.forEach((row) => {
        selectedAllocations.push(allocationsMap.get(row));
      });
      const payload = {
        dilute_date: generateDateTimeWithZeroTime(editState.dilute_date),
        dilute_points: Number(editState.dilute_points),
        allocations: selectedAllocations,
        mode: editState.mode?.value
      };
      setDilutePayload(payload)
      const res = await API.fetchAllocationsDilutionCalculation(
        carryPlanId,
        payload
      );
      if (res.success) {
        const tempAllocationsMap = allocationsMap;
        res.data?.allocations?.forEach((dat: any) => {
          tempAllocationsMap.set(dat.allocation_id, dat);
        });
        handleEditState("errors",res.data.errors)
        setHasError(!isEmpty(res.data.errors))
        setAllocationsMap(new Map(tempAllocationsMap));
        setDisableCalculate(true);
      }
    }
  };

  useEffect(() => {
    setAllocationsMap(
      new Map(allocations.map((dat: any) => [dat.allocation_id, dat]))
    );
  }, [allocations]);

  return (
    <div style={{ padding: "20px" }}>
      <InfoTable info={formatInfoTableData(carryPlanDetail,createDecimal(editState.dilute_points).toString())} />
      <SectionBorder>
        <SpaceBetween>
          <div>
            <CountText>
              {selectedParticipantsCount} selected participants
            </CountText>
            <HelperTextCont>
              Select one or more allocations to dilute
            </HelperTextCont>
            {hasErrors && <p className="text-danger">{editState.errors[0]}</p>}
          </div>
        </SpaceBetween>
        <div className="mt-2">
          <StyledRow>
            <Col lg={3}>
              <FormTextFieldRow
                label=""
                placeholder="Search participants"
                name="search"
                onChange={(e: any) => handleEditState("search", e.target.value)}
                value={editState.search}
                disabled={disbaleCalculate}
              />
            </Col>

            <Col lg={3}>
              <div className="mt-2">
              <ReactDatePickerComp
                selected={ editState.dilute_date ? new Date(editState.dilute_date) : null}
                onChange={(value: any) =>
                  handleEditState("dilute_date", value)
                }
                placeholderText= "Dilution Date"
                disabled={disbaleCalculate}
              />
              </div>
            </Col>
            <Col lg={2}>
              <FormTextFieldRow
                label=""
                placeholder="e.g. 100"
                name="dilute_points"
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (isValidPositiveUncappedDecimal(val) || val === "")
                    handleEditState("dilute_points", val);
                }}
                value={editState.dilute_points}
                disabled={disbaleCalculate}
              />
            </Col>
            <Col lg={2}>
              <FormSelectorFieldRow
                label=""
                name="mode"
                placeholder="Type"
                onChange={(value: any) =>
                  handleEditState("mode", value)
                }
                value={editState.mode}
                options={diluteModeOptions}
                isDisabled={disbaleCalculate}
              />
            </Col>
            <Col lg={2}>
              <div className="mt-2">
                <AssignButton
                  onClick={() => handleCalculate()}
                  disabled={
                    disbaleCalculate
                      ? false
                      : !selectedParticipantsCount ||
                        !editState.dilute_points ||
                        !editState.dilute_date ||
                        isEmpty(editState.mode)
                  }
                >
                  {disbaleCalculate ? "Reset" : "Calculate"}
                </AssignButton>
              </div>
            </Col>
          </StyledRow>
          <div className="mt-3">
            <RsuiteTable
              height="400px"
              allowColMinWidth={true}
              rowSelection={true}
              disableRowSelection={disbaleCalculate}
              dataKey="allocation_id"
              handleSelectRow={(rows) => handleSelectRow(rows)}
              selectResetTrigger={selectResetTrigger}
              columns={getColumns(Boolean(allocationsTableData?.[0]?.sub_pool_id))}
              data={searchFilter(allocationsTableData)}
              rowHeight={72}
            />
          </div>
        </div>
      </SectionBorder>
    </div>
  );
};

export default CarryDiluteForm;
