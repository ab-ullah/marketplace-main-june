import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {ModalHeading, StyledButton, StyledModal} from "./styles";
import BlocksList from "./MarketingPageBlocks";
import {IFundBaseInfo} from "../../../../interfaces/fundDetails";


interface CreateMarketingPageButtonProps {
  fund: IFundBaseInfo;
}


const CreateMarketingPageButton: FunctionComponent<CreateMarketingPageButtonProps> = ({fund}) => {
  const [showModal, setShowModal] = useState<boolean>(false);


  const closeModal = () => setShowModal(false);

  return <>
    <StyledButton className={'float-end'} variant={'primary'} onClick={() => setShowModal(true)}>+ Create</StyledButton>
    <StyledModal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title><ModalHeading>Create eligibility criteria</ModalHeading></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <BlocksList closeModal={closeModal} fund={fund}/>
      </Modal.Body>
    </StyledModal>
  </>;
};

export default CreateMarketingPageButton;
