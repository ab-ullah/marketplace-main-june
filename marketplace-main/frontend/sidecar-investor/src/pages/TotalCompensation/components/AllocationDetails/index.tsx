import { Button, Col, Row } from "react-bootstrap";
import {useEffect, useState} from "react";
import {FullPageModal} from "../../../CarryParticipantDashboard/SingleAllocationDetail/styled";
import AllocationDatesCard
    from "../../../CarryParticipantDashboard/SingleAllocationDetail/components/allocationDatesCard";
import {Heading} from "../../../../components/CarryTooltip/styles";
import VestingSchedule from "../../../CarryParticipantDashboard/SingleAllocationDetail/components/vestingSchedule";
import AllocationValueCard
    from "../../../CarryParticipantDashboard/SingleAllocationDetail/components/allocationsValuesCard";
import AllocationPointsCard
    from "../../../CarryParticipantDashboard/SingleAllocationDetail/components/allocationPointsCard";
import RsSuite from "../../../../components/Table/RSuite";
import {
    ACTION_COLUMNS,
    DISTRIBUTION_COLUMNS, getDocumentsColumns
} from "../../../CarryParticipantDashboard/SingleAllocationDetail/constants";
import API from "../../../../api/backendApi";
import {useGetCarryPlansConfigQuery} from "../../../../api/rtkQuery/commonApi";
import NavableLoader from "../../../../components/NavableLoader";

const AllocationDetails = ({ carryPlanId, allocation, show, onClose }: any) => {
    const [allocationDetail, setAllocationDetail] = useState<any>(null);
    const [isLoading, setIsloading] = useState(true);

    const { data: carryPlansConfig } = useGetCarryPlansConfigQuery();

    const fetchAllocation = async () => {
        const response = await API.fetchCarryAllocationDetail(
            carryPlanId,
            allocation
        );
        if (response) {
            setAllocationDetail(response);
            setIsloading(false);
        }
    };

    const handleClose = () => {
        setAllocationDetail(null);
        onClose();
    };

    useEffect(() => {
        if (allocation && show) {
            fetchAllocation();
        }
    }, [allocation, show]);

    return (
        <FullPageModal size={"xl"} show={show} onHide={handleClose}>
            <FullPageModal.Header closeButton>
                <FullPageModal.Title>
                    {allocationDetail?.carry_plan_name}
                </FullPageModal.Title>
            </FullPageModal.Header>
            <FullPageModal.Body>
                {!isLoading && allocationDetail ? (
                    <>
                        <Row>
                            <Col md={4} className="mb-2">
                                <AllocationDatesCard allocationDetail={allocationDetail} />
                            </Col>
                            <Col md={4} className="mb-2">
                                <AllocationPointsCard allocationDetail={allocationDetail} />
                            </Col>
                            <Col md={4} className="mb-2">
                                <AllocationValueCard allocationDetail={allocationDetail} carryTooltips={carryPlansConfig?.tooltips ?? []} />
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <VestingSchedule allocationDetail={allocationDetail} />
                        </Row>
                        <Row className="mt-3">
                            <Heading className="mt-4">History</Heading>
                            <RsSuite
                                allowColMinWidth={true}
                                rowSelection={false}
                                columns={ACTION_COLUMNS}
                                data={allocationDetail?.actions ?? []}
                                wordWrap={true}
                                // rowHeight={50}
                                height={"300px"}
                                // rowBordered
                            />
                            <Heading className="mt-2">Distributions</Heading>
                            <RsSuite
                                height={"300px"}
                                allowColMinWidth={true}
                                rowSelection={false}
                                columns={DISTRIBUTION_COLUMNS}
                                data={allocationDetail?.distributions ?? []}
                                wordWrap={true}
                                //rowHeight={50}
                                //rowBordered
                            />
                            <Heading className="mt-2">Documents</Heading>
                            <RsSuite
                                height={"300px"}
                                allowColMinWidth={true}
                                rowSelection={false}
                                columns={getDocumentsColumns()}
                                data={allocationDetail?.documents ?? []}
                                wordWrap={true}
                                //rowHeight={50}
                                //rowBordered
                            />
                        </Row>
                    </>
                ) : (
                    <NavableLoader />
                )}
            </FullPageModal.Body>
            <FullPageModal.Footer>
                <Button onClick={handleClose} variant="outline-primary">
                    Close
                </Button>
            </FullPageModal.Footer>
        </FullPageModal>
    );
};

export default AllocationDetails;
