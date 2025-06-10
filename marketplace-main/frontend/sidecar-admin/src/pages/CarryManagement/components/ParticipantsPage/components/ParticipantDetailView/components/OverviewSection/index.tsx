import { Col, Row } from "react-bootstrap";
import SummaryBlock from "./components/SummaryBlock";
import TotalCompensationBlock from "./components/TotalCompensationBlock";
import { SectionWrapper } from "./styles";
import { useEffect, useState } from "react";
import API from "../../../../../../../../api/backendApi";
import { formatForfeitureRes, getCarryPlansColumns, getCompensationHistoryColumns, getOverviewExportData, infoDisplay, summaryBlockDisplay, totalCompensationBlockDisplay } from "./constants";
import NavableLoader from "../../../../../../../../components/NavableLoader";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { Label } from "../../../../styled";
import { get } from "lodash";
import { useGetCompensationHistoryConfigQuery } from "../../../../../../../../api/rtkQuery/commonApi";
import ExportButton from "../../../../../../../../components/ExportButton";
import AllocationDetails from "../../../../../CarryPlansPage/components/CarryPlanDetailView/components/AllocationDetails";

const OverviewSection = ({
  participantId,
  goBack,
  handleParticipantName,
  setOverviewExportData
}: {
  participantId: string;
  goBack: () => void;
  handleParticipantName: any;
  setOverviewExportData: (data: any) => void
}) => {
  const [state, setState] = useState<any>({});
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)
  const [hasEntity, setHasEntity] = useState<boolean>(false)
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const {data: compensationHistoryConfig} = useGetCompensationHistoryConfigQuery();
  const [isLoading, setIsLoading] = useState({
    sectionData: true,
    carryPlansData: true,
    participantCompensationHistory: true,
  });

  const handleFetchParticipantDetail = async () => {
    setIsLoading((prev) => ({ ...prev, sectionData: true }));
    const res = await API.fetchCarryParticipantById(participantId);
    setIsLoading((prev) => ({ ...prev, sectionData: false }));
    if (res.success) {
      setState((prev: any) => ({ ...prev, ...res.data }));
      handleParticipantName(res.data?.full_name);
    } else {
      goBack();
    }
  };

  const handleFetchCarryParticipantForfeiture = async () => {
    setIsLoading((prev) => ({ ...prev, carryPlansData: true }));
    const res = await API.fetchUserAllocationsById(participantId);
    setIsLoading((prev) => ({ ...prev, carryPlansData: false }));

    if (res.success) {
      const carryPlansData = formatForfeitureRes(res.data);
      setState((prev: any) => ({ ...prev, carryPlansData }));
    }
  };

  const handleFetchCarryParticipantCompensationsHistory = async () => {
    setIsLoading((prev) => ({ ...prev, participantCompensationHistory: true }));
    const res = await API.fetchCarryParticipantCompensationHistory(
      participantId
    );
    setIsLoading((prev) => ({
      ...prev,
      participantCompensationHistory: false,
    }));
    if (res.success) {
      setState((prev: any) => ({
        ...prev,
        participantCompensationHistory: res.data,
      }));
    }
  };

  const handleAllocationClick = (allocation: any) => {
    setSelectedAllocation(allocation);
    setIsAllocationModalOpen(true)
  }

  useEffect(() => {
    if (participantId) {
      handleFetchParticipantDetail();
      handleFetchCarryParticipantForfeiture();
      handleFetchCarryParticipantCompensationsHistory();
    }
  }, [participantId]);

  useEffect(() => {
    if(state.carryPlansData) {
      setHasEntity(state.carryPlansData.some((item: any) => item.entity_name && item.entity_name.trim() !== ''))
      setOverviewExportData({
        tableColumns: getCarryPlansColumns(() => {}, hasEntity),
        data: getOverviewExportData(state.carryPlansData)
      })
    }
  }, [state.carryPlansData])

  const isSummaryDataLoading = get(isLoading, "sectionData") || !compensationHistoryConfig || !state.participantCompensationHistory;

  return (
    <SectionWrapper>
      {isSummaryDataLoading ? (
        <NavableLoader />
      ) : (
        <Row>
          <Col sm={6}>
            <SummaryBlock info={summaryBlockDisplay(state, compensationHistoryConfig)} totalBenefits={state.total_benefits} />
          </Col>
          <Col sm={6}>
            <TotalCompensationBlock
              info={totalCompensationBlockDisplay(state)}
            />
          </Col>
        </Row>
      )}

      <div>
        <Label>Carry Allocations</Label>
        {get(isLoading, "carryPlansData") ? (
          <NavableLoader />
        ) : (
          <RsuiteTable
            height="400px"
            allowColMinWidth={true}
            rowSelection={false}
            columns={getCarryPlansColumns(handleAllocationClick, hasEntity)}
            data={state.carryPlansData || []}
            wordWrap={true}
          />
        )}
         <AllocationDetails
        carryPlanId={selectedAllocation?.carry_plan_id}
        allocation={selectedAllocation?.allocation_id}
        show={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        />
      </div>
      <div className="mt-5">
        <div className="d-flex justify-content-between">
        <Label>Compensation History</Label>
        {
          get(isLoading, "participantCompensationHistory") || !compensationHistoryConfig ? null : <ExportButton 
          fileName="carry-participant-compensation-history"
          tableColumns={getCompensationHistoryColumns(get(compensationHistoryConfig, 'tables[0].rows'))}
          data={state.participantCompensationHistory || []}
          />
        }
        </div>
        {get(isLoading, "participantCompensationHistory") || !compensationHistoryConfig ? (
          <NavableLoader />
        ) : (
          <RsuiteTable
            height="400px"
            allowColMinWidth={true}
            rowSelection={false}
            columns={getCompensationHistoryColumns(get(compensationHistoryConfig, 'tables[0].rows'))}
            data={state.participantCompensationHistory || []}
            wordWrap={true}
          />
        )}
      </div>
    </SectionWrapper>
  );
};

export default OverviewSection;
