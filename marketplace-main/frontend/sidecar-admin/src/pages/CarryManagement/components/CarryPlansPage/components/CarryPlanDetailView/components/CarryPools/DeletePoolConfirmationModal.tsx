import { Button, Modal } from "react-bootstrap"
import { StyledButton } from "./styles";
import { useDeleteCarryPoolMutation } from "../../../../../../../../api/rtkQuery/carryApi";

const DeletePoolConfirmationModal = ({
    poolId,
    poolName,
    isOpen,
    onClose
}: any) => {

    const [deletePool, { isLoading }] = useDeleteCarryPoolMutation();

    const onSubmit = async () => {
        await deletePool({ poolId }).unwrap();
        onClose(true);
    }

    return <Modal size="lg" show={isOpen} onHide={onClose}>
        <Modal.Header closeButton>
            Delete {poolName}?
        </Modal.Header>
        <Modal.Body>
            <p>Are you sure you want to delete {poolName}?</p>
        </Modal.Body>
        <Modal.Footer>
            <Button disabled={isLoading} variant="text" onClick={()=>onClose()}>Cancel</Button>
            <StyledButton disabled={isLoading} onClick={onSubmit}>Delete</StyledButton>
        </Modal.Footer>
    </Modal>
}

export default DeletePoolConfirmationModal;