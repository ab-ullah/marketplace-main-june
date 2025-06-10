import React, {FunctionComponent, useEffect, useState} from "react";
import {SectionWrapper} from "../CarryParticipantDashboard/styles";
import NavableLoader from "../../components/NavableLoader";
import RsSuite from "../../components/Table/RSuite";
import {useGetCompensationHistoryConfigQuery} from "../../api/rtkQuery/commonApi";
import API from "../../api/backendApi";
import {get} from "lodash";
import ExportButton from "../../components/ExportButton";
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";
import {
    formatForfeitureRes,
    getCarryPlansColumns,
    getCompensationHistoryColumns,
    summaryBlockDisplay,
    totalCompensationBlockDisplay
} from "./constants";
import SummaryBlock from "./components/SummaryBlock";
import TotalCompensationBlock from "./components/TotalCompensationBlock";
import AllocationDetails from "./components/AllocationDetails";

export const Label = styled.h4`
  font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
`;

export interface CarryDocumentsViewProps {
}

const TotalCompensation: FunctionComponent<CarryDocumentsViewProps> = () => {
    const [state, setState] = useState<any>({});
    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)
    const [hasEntity, setHasEntity] = useState<boolean>(false)
    const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
    const {data: compensationHistoryConfig} = useGetCompensationHistoryConfigQuery();
    const [isLoading, setIsLoading] = useState({
        sectionData: true,
        carryPlansData: true,
        compensationHistory: true,
    });

    const handleAllocationClick = (allocation: any) => {
        setSelectedAllocation(allocation);
        setIsAllocationModalOpen(true)
    }

    const handleFetchLatestCompensation = async () => {
        setIsLoading((prev) => ({ ...prev, sectionData: true }));
        const res = await API.fetchLatestCompensation();
        setIsLoading((prev) => ({ ...prev, sectionData: false }));
        if (res.success) {
            setState((prev: any) => ({ ...prev, ...res.data }));
        }
    };

    const handleFetchCarryParticipantForfeiture = async () => {
        setIsLoading((prev) => ({ ...prev, carryPlansData: true }));
        const res = await API.fetchCompensationCarryAllocations();
        setIsLoading((prev) => ({ ...prev, carryPlansData: false }));

        if (res.success) {
            const carryPlansData = formatForfeitureRes(res.data);
            setState((prev: any) => ({ ...prev, carryPlansData }));
        }
    };

    const handleFetchCarryParticipantCompensationsHistory = async () => {
        setIsLoading((prev) => ({ ...prev, compensationHistory: true }));
        const res = await API.fetchCompensationHistory();
        if (res.success) {
            setState((prev: any) => ({
                ...prev,
                compensationHistory: res.data,
            }));
        }
        setIsLoading((prev) => ({
            ...prev,
            compensationHistory: false,
        }));
    };

    useEffect(() => {
        handleFetchLatestCompensation()
        handleFetchCarryParticipantForfeiture()
        handleFetchCarryParticipantCompensationsHistory();
    }, []);

    useEffect(() => {
        if(state.carryPlansData) {
            setHasEntity(state.carryPlansData.some((item: any) => item.entity_name && item.entity_name.trim() !== ''))
        }
    }, [state.carryPlansData])

    const isSummaryDataLoading = get(isLoading, "sectionData") || !compensationHistoryConfig || !state.compensationHistory;

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
                    <RsSuite
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
                        get(isLoading, "compensationHistory") || !compensationHistoryConfig ? null : <ExportButton
                            fileName="carry-participant-compensation-history"
                            tableColumns={getCompensationHistoryColumns(get(compensationHistoryConfig, 'tables[0].rows'))}
                            data={state.compensationHistory || []}
                        />
                    }
                </div>
                {get(isLoading, "compensationHistory") || !compensationHistoryConfig ? (
                    <NavableLoader />
                ) : (
                    <RsSuite
                        height="400px"
                        allowColMinWidth={true}
                        rowSelection={false}
                        columns={getCompensationHistoryColumns(get(compensationHistoryConfig, 'tables[0].rows'))}
                        data={state.compensationHistory || []}
                        wordWrap={true}
                    />
                )}
            </div>
        </SectionWrapper>
    );
}

export default TotalCompensation