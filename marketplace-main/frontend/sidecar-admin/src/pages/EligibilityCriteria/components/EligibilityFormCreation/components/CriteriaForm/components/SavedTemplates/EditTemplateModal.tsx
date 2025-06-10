import { FunctionComponent } from "react";
import { EligibilityModal } from "../../../../../../../../presentational/EligibilityModal";
import { Modal } from "react-bootstrap";
import TemplateForm from "./TemplateForm";

interface IEditTemplateModalProps {
  showTemplateModal: boolean;
  template?: any;
  closeModal: () => void
}


const EditTemplateModal: FunctionComponent<IEditTemplateModalProps> = ({template, showTemplateModal, closeModal}) => {
  return (
   <EligibilityModal size='xl' show={showTemplateModal} onHide={closeModal}>
     <Modal.Header closeButton>
        <Modal.Title>Update Template</Modal.Title>
     </Modal.Header>
     <Modal.Body>
        {
            template && <TemplateForm
            template={template}
            closeModal={closeModal}
             />
        }
     </Modal.Body>
   </EligibilityModal>
  );
};

export default EditTemplateModal;
