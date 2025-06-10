import { Button, Col, Row } from "react-bootstrap";
import API from "../../../../../../../../api/backendApi";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { FullPageModal } from "../../../CarryPlanModal/styles";
import AllocationPointsCard from "./components/allocationPointsCard";
import AllocationValueCard from "./components/allocationsValueCard";
import VestingSchedule from "./components/vestingSchedule";
import {ACTION_COLUMNS, DISTRIBUTION_COLUMNS, getDocumentsColumns} from "./constants";
import { Heading } from "../../../../../VestingScheduleDisplay/styles";
import AllocationDatesCard from "./components/allocationDatesCard";
import { useEffect, useState } from "react";
import { PLAN_ID_PARAM } from "../../../../../../constants";
import NavableLoader from "../../../../../../../../components/NavableLoader";
import { useGetCarryPlansConfigQuery } from "../../../../../../../../api/rtkQuery/companyApi";
import AllocationFMVCard from "./components/allocationFMVCard";

const AllocationDetails = ({ carryPlanId, allocation, show, onClose }: any) => {
  const [allocationDetail, setAllocationDetail] = useState<any>(null);
  const [isLoading, setIsloading] = useState(true);

  const { data: carryPlansConfig } = useGetCarryPlansConfigQuery();

  const fetchAllocation = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get(PLAN_ID_PARAM);
    const response = await API.fetchCarryAllocationDetail(
      planId ?? carryPlanId,
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

  console.log("Allocation detail", allocationDetail);
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
              <Col md={3} className="mb-2">
                <AllocationDatesCard allocationDetail={allocationDetail} />
              </Col>
              <Col md={3} className="mb-2">
                <AllocationPointsCard allocationDetail={allocationDetail} />
              </Col>
              <Col md={3} className="mb-2">
                <AllocationValueCard allocationDetail={allocationDetail} carryTooltips={carryPlansConfig?.tooltips ?? []} />
              </Col>
              <Col md={3} className="mb-2">
                <AllocationFMVCard allocationDetail={allocationDetail} carryTooltips={carryPlansConfig?.tooltips ?? []} />
              </Col>
            </Row>
            <Row className="mt-4">
              <VestingSchedule allocationDetail={allocationDetail} />
            </Row>
            <Row className="mt-3">
          <Heading className="mt-4">History</Heading>
          <RsuiteTable
            allowColMinWidth={true}
            rowSelection={false}
            columns={ACTION_COLUMNS}
            data={allocationDetail?.actions ?? []}
            wordWrap={true}
            rowHeight={50}
            height={"300px"}
            rowBordered
          />
          <Heading className="mt-2">Distributions</Heading>
          <RsuiteTable
            height={"300px"}
            allowColMinWidth={true}
            rowSelection={false}
            columns={DISTRIBUTION_COLUMNS}
            data={allocationDetail?.distributions ?? []}
            wordWrap={true}
            rowHeight={50}
            rowBordered
          />
          <Heading className="mt-2">Documents</Heading>
          <RsuiteTable
            height={"300px"}
            allowColMinWidth={true}
            rowSelection={false}
            columns={getDocumentsColumns()}
            data={allocationDetail?.documents ?? []}
            wordWrap={true}
            rowHeight={50}
            rowBordered
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
