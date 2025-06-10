import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {SideCarModal} from "../../../../presentational/SideCarModal";
import {IFundDetail} from "../../../../interfaces/fundDetails";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {ButtonCol, SideCarButton} from "../../../../presentational/buttons";
import API from "../../../../api";
import {useHistory} from "react-router-dom"
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import { useCompanyPrefix } from '../../../../utils/hooks';

interface RequestAllocationModalProps {
  fund: IFundDetail;
  investment: number;
  leverageAmount: number;
  investorId: number;
  requestAllocationId: number | undefined | null;
  leverageRole: number | undefined | null;
  currencySymbol: string | undefined | null;
}


const RequestAllocationModal: FunctionComponent<RequestAllocationModalProps> = (
  {fund, investment, leverageAmount, requestAllocationId, leverageRole, currencySymbol, investorId}
) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const {companyPrefix} =useCompanyPrefix()
  const history = useHistory();
  const submit = async () => {
    const payload = {
      fund: fund.id,
      requested_allocation: investment + leverageAmount,
      requested_leverage: leverageAmount,
      used_role_leverage: leverageRole,
      investor: investorId,
    }
    if (requestAllocationId){
      await API.updateOrder(requestAllocationId, payload)
    }
    else {
      await API.createOrder(payload)
    }
    history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/ownership`);
  }

  return <>
    <SideCarButton onClick={() => setShowModal(true)} variant={'outline-primary'}>Request Allocation</SideCarButton>
    <SideCarModal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{fund.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col md={12}>
              You are requesting all allocation of <FormattedCurrency value={investment + leverageAmount} symbol={currencySymbol}/> in
              {fund.name}.
            </Col>
          </Row>
          <br/>
          <Row>
            <Col md={12}>
              You can make changes to this allocation until {fund.application_period_end_date} via your Sidecar
              Dashboard.
            </Col>
          </Row>
          <Row>
            <ButtonCol md={12} className={'mt-5'}>
              <SideCarButton onClick={submit}>Confirm</SideCarButton>
            </ButtonCol>
          </Row>
        </Container>
      </Modal.Body>
    </SideCarModal>
  </>;
};

export default RequestAllocationModal;
