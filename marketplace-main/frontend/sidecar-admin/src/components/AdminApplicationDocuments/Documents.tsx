import {FunctionComponent, useState} from "react";
import find from "lodash/find";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import RsuiteTable from "../Table/RSuite";
import DocumentForm from "./DocumentForm";
import {getColumns} from "./config";
import {TableContainer} from "./styles";
import {useDeleteAdminApplicationDocumentMutation, useGetApplicationDocumentsQuery} from "../../api/rtkQuery/fundsApi";


interface AdminApplicationDocumentsProps {
  applicationId: number
}

const AdminApplicationDocuments: FunctionComponent<AdminApplicationDocumentsProps> = ({applicationId}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [documentDetails, setDocumentDetails] = useState<any>({});
  const {data: applicationDocuments} = useGetApplicationDocumentsQuery(applicationId);
  const [deleteApplicationDocument] = useDeleteAdminApplicationDocumentMutation();
  const {refetch} = useGetApplicationDocumentsQuery(applicationId);

  const deleteDocument = async (id: number) => {
    await deleteApplicationDocument({applicationId, id})
    refetch()
  }


  const showDocDetails = (docId: any) => {
    const data = find(applicationDocuments, (doc) => doc.id === docId);
    setDocumentDetails(data);
    setShowModal(true);
  }

  const handleHideModal = () => {
    setShowModal(false);
    setDocumentDetails({});
  }

  return (
    <>
      <Container fluid className="add-doc-container">
        <Row>
          <Col className="text-end">
            <Button onClick={() => setShowModal(true)} variant={'primary'} className={"mb-3 tex-right"}>
              Add Document
            </Button>
          </Col>
        </Row>
      </Container>
      <TableContainer>
        <RsuiteTable
          height="500px"
          allowColMinWidth={false}
          wordWrap={true}
          rowSelection={false}
          columns={getColumns(showDocDetails, (id: number) => deleteDocument(id))}
          data={applicationDocuments}
        />
      </TableContainer>
      <Modal size={'lg'} show={showModal} onHide={handleHideModal}>
        <Modal.Header closeButton>
          <Modal.Title>{documentDetails?.id ? "Create" : "Update"} Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModal &&
            <DocumentForm data={documentDetails} applicationId={applicationId} closeModal={handleHideModal}/>}
        </Modal.Body>
      </Modal>

    </>
  )
};

export default AdminApplicationDocuments;
