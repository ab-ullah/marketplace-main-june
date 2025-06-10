import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";
import styled from "styled-components";
import Table from "react-bootstrap/Table";
import _ from "lodash";
import Button from "react-bootstrap/Button";

const Toggle = styled.a`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.02em;
  cursor: pointer;
  color: #2E86DE;
  margin-bottom: 0;
  text-decoration: none;
  padding: 0 !important;
`

const CriteriaTable = styled(Table)`

  tbody {
    border-top: none !important;
  }

  tr {
    border-top: none !important;
    border-bottom: 1px #ECEFF1 solid;
  }

  td {
    padding-top: 16px;
    padding-bottom: 16px;
    border-top: none;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #020203;
  }

  th {
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.02em;
    color: #020203;
    padding-top: 16px;
    padding-bottom: 16px;
  }
`

const ModalHeading = styled.h3`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`

const ModalFooter = styled(Modal.Footer)`
  border-top: none;
  
  button {
    border: 1px #470C75 solid;
    border-radius: 70px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    color: #470C75;
    background: #FFFFFF;
    padding: 8px 16px;
    margin-right: 14px;
  }
`

const ModalHeader = styled(Modal.Header)`
  .btn-close {
    margin-right: 14px;
  }
`

interface RequestAllocationModalProps {
  fund: IFundWithProfile;
}


const EligibilityCriteriaModal: FunctionComponent<RequestAllocationModalProps> = ({fund}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  if (!fund.fund_profile.eligibility_criteria) return <></>

  const handleClose = () => setShowModal(false)

  return <>
    <Toggle onClick={() => setShowModal(true)}>Eligibility Criteria</Toggle>
    <Modal size={'lg'} show={showModal} onHide={handleClose}>
      <ModalHeader closeButton>
        <Modal.Title><ModalHeading>Eligibility Criteria</ModalHeading></Modal.Title>
      </ModalHeader>
      <Modal.Body>
        <CriteriaTable>
          <thead>
          <tr>
            {fund.fund_profile.eligibility_criteria_headings.map((heading) => <th>{heading}</th>)}
          </tr>
          </thead>
          <tbody>
          {fund.fund_profile.eligibility_criteria.map((criteria) => <tr>
            {fund.fund_profile.eligibility_criteria_headings.map((heading) => <td>{_.get(criteria, heading)}</td>)}
          </tr>)}
          </tbody>
        </CriteriaTable>
      </Modal.Body>
      <ModalFooter>
        <Button onClick={handleClose}>Close</Button>
      </ModalFooter>
    </Modal>
  </>;
};

export default EligibilityCriteriaModal;
