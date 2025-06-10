import { FunctionComponent, memo, useState } from "react";
import {useParams} from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useUpdateApplicationStatusMutation } from "../../api/rtkQuery/fundsApi";
import { WITHDRAWN } from "../../constants/applicationStatus";
import {useAppDispatch} from "../../app/hooks";

import {
    fetchInitialRecord,
} from "../KnowYourCustomer/thunks";
import { WithdrawButton } from "./styles";

interface IWithdrawConfirmation {
    applicationUuId: string;
    status: number;
}

const WithdrawConfirmation: FunctionComponent<IWithdrawConfirmation> = ({ applicationUuId, status }) => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const [updateStatus] = useUpdateApplicationStatusMutation();
    const { externalId } = useParams<{ externalId: string }>();
    const dispatch = useAppDispatch();

    const handleSubmit = () => {
        if (!externalId) return
        updateStatus({ applicationUuId, status: WITHDRAWN }).then(() => {
            dispatch(fetchInitialRecord(externalId))
        });
        setShowModal(false);
    }
    return (
        <>
            <WithdrawButton
                onClick={() => setShowModal(true)}
                disabled={status === WITHDRAWN}
            >
                Withdraw Application
            </WithdrawButton>
            <Modal size={"lg"} show={showModal} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Withdraw applicant</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>Are you sure, you want to withdraw this application?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                    >
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default memo(WithdrawConfirmation);
