import { Modal } from "react-bootstrap";
import CreateDocumentForm from "./components/CreateDocumentForm";
import { isEmpty } from "lodash";

interface ICreateDocumentModalProps {
  handleCloseModal: (_refresh?: boolean) => void;
  initState?: Record<string, any>;
  handleToggleActivateDoc:any
}

const CreateDocumentModal = ({
  handleCloseModal,
  initState,
  handleToggleActivateDoc
}: ICreateDocumentModalProps) => {
  return (
    <>
      <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton style={{ background: "#F5F7F8" }}>
          <Modal.Title>
            {isEmpty(initState) ? "Add" : "Edit"} Carry Template Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateDocumentForm
            closeModal={handleCloseModal}
            initState={initState}
            handleToggleActivateDoc={handleToggleActivateDoc}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateDocumentModal;
