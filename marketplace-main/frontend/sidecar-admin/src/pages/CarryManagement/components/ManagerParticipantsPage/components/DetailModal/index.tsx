import { Button, Col, Row } from "react-bootstrap";
import { FullPageModal } from "./styles";
import EmployeeCard from "./components/EmployeeCard";
import CarryValueCard from "./components/CarryValueCard";
import DistributionsCard from "./components/DistributionsCard";
import API from "../../../../../../api/backendApi";
import { useEffect, useState } from "react";
import NavableLoader from "../../../../../../components/NavableLoader";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";

const DetailModal = ({ onClose, participantId }: any) => {
  const [record, setRecord] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const handleFetchEmployeeRecord = async () => {
    setIsLoading(true);
    const res = await API.fetchManagerEmployeeRecord(participantId);
    if (res.success) {
      setRecord(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleFetchEmployeeRecord();
  }, [participantId]);

  const handleClose = () => {
    onClose();
  };
  return (
    <FullPageModal size={"xl"} show={true} onHide={handleClose}>
      <FullPageModal.Header closeButton>
        <FullPageModal.Title>Employee Details</FullPageModal.Title>
      </FullPageModal.Header>

      <FullPageModal.Body>
        {isLoading ? (
          <NavableLoader />
        ) : (
          <>
            <Row>
              <Col md={4} className="mb-2">
                <EmployeeCard data={record.employment_record} />
              </Col>
              <Col md={4} className="mb-2">
                <CarryValueCard data={record.allocations || []} />
              </Col>
              <Col md={4} className="mb-2">
                <DistributionsCard data={record.allocations || []} />
              </Col>
            </Row>

            <RsuiteTable
              height="400px"
              allowColMinWidth={true}
              rowSelection={false}
              defaultSortBy="grant_date"
              defaultSortType="desc"
              columns={getColumns()}
              data={record.allocations || []}
              wordWrap={true}
            />
          </>
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

export default DetailModal;
