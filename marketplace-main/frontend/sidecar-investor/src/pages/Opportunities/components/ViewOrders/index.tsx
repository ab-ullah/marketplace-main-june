import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {IOrder} from "../../interfaces";
import {ViewOfferButton} from "./styles";
import OrderTable from "./OrderTable";


interface MakeOfferProps {
  orders: IOrder[]
}


const ViewOrders: FunctionComponent<MakeOfferProps> = ({orders}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  return <>
    <ViewOfferButton onClick={() => setShowModal(true)} variant={'outline-primary'}>View Order</ViewOfferButton>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>View Order</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <OrderTable orders={orders}/>
      </Modal.Body>
    </Modal>
  </>;
};

export default ViewOrders;
