import { useParams } from "react-router-dom";
import API from '../../../api/backendApi';
import { FullPageModal, TableContainer } from "./styled";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import NavableLoader from "../../../components/NavableLoader";
import AllocationDatesCard from "./components/allocationDatesCard";
import AllocationPointsCard from "./components/allocationPointsCard";
import AllocationValueCard from "./components/allocationsValuesCard";
import VestingSchedule from "./components/vestingSchedule";
import RsuiteTable from "../../../components/Table/RSuite";
import { ACTION_COLUMNS, DISTRIBUTION_COLUMNS } from "./constants";
import { Heading } from "../../../presentational/Heading";
import { getDocumentsColumns } from "./constants";
import AllocationFMVCard from "./components/allocationFMVCard";


const SingleAllocationDetail = ({
  allocationId,
  show,
  onClose
}: any) => {
  const { externalId } = useParams<{ externalId: string }>();
  const [allocationDetail, setAllocationDetail] = useState<any>(null);
  const [isLoading, setIsloading] = useState(true);

  const fetchAllocationDetail = async () => {
    const response = await API.fetchAllocationDetail(externalId, allocationId);
    if (response) {
      setAllocationDetail(response);
      setIsloading(false)
    }
  }

  const handleClose = () => {
    setAllocationDetail(null);
    onClose();
  };

  useEffect(() => {
    if (allocationId && show) {
      fetchAllocationDetail();
    }
  }, [allocationId, show])

  return <FullPageModal show={show} onHide={handleClose} style={{ 'font-family': 'Inter' }}>
    <FullPageModal.Header closeButton>
      <FullPageModal.Title>{allocationDetail?.carry_plan_name}</FullPageModal.Title>
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
              <AllocationValueCard allocationDetail={allocationDetail} />
            </Col>
            <Col md={3} className="mb-2">
              <AllocationFMVCard allocationDetail={allocationDetail} />
            </Col>
          </Row>
          <Row className="mt-4">
            <VestingSchedule allocationDetail={allocationDetail} />
          </Row>
          <Row className="mt-3">
            <Heading className="mt-4">History</Heading>
            <RsuiteTable
              height="300px"
              allowColMinWidth={true}
              rowSelection={false}
              columns={ACTION_COLUMNS}
              data={allocationDetail?.actions ?? []}
              wordWrap={true}
            />
          </Row>
          <TableContainer className="mt-3">
            <Heading className="mt-4">Distributions</Heading>
            <RsuiteTable
              height="300px"
              allowColMinWidth={true}
              rowSelection={false}
              columns={DISTRIBUTION_COLUMNS}
              data={allocationDetail?.distributions ?? []}
              wordWrap={true}
            />
          </TableContainer>
          <TableContainer className="mt-3">
            <Heading className="mt-4">Documents</Heading>
            <RsuiteTable
              height="300px"
              allowColMinWidth={true}
              rowSelection={false}
              columns={getDocumentsColumns()}
              data={allocationDetail?.documents ?? []}
            />
          </TableContainer>
        </>
      ) : (
        <NavableLoader />
      )}
    </FullPageModal.Body>
  </FullPageModal>
}

export default SingleAllocationDetail;