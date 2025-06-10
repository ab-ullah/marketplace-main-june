import { FunctionComponent, useState, memo } from "react";
import map from "lodash/map";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { SideCarModal } from "../../../../presentational/SideCarModal";
import { LEVERAGE_OPTIONS_LABELS } from "./constants";
import { CustomLink } from "./styles";

const details = [
  {
    leverage: LEVERAGE_OPTIONS_LABELS.None,
    eligibility: `Available to everyone`,
  },
  {
    leverage: LEVERAGE_OPTIONS_LABELS["2:1"],
    eligibility: `Available to everyone`,
  },
  {
    leverage: LEVERAGE_OPTIONS_LABELS["3:1"],
    eligibility: `Available to people working directly with the investment team`,
  },
  {
    leverage: LEVERAGE_OPTIONS_LABELS["4:1"],
    eligibility: `Available to key members of the investment team`,
  },
];

const LeverageDetailsModal: FunctionComponent = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <CustomLink onClick={() => setShowModal(true)}>click here</CustomLink>
      <SideCarModal
        size="lg"
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Eligibility</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Leverage</th>
                <th>Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {map(details, ({ leverage, eligibility }) => (
                <tr key={leverage}>
                  <td>{leverage}</td>
                  <td>{eligibility}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </SideCarModal>
    </>
  );
};

export default memo(LeverageDetailsModal);
