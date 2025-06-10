import React, {FunctionComponent, useEffect, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {ModalHeading, StyledButton, StyledModal} from "./styles";
import CreateCriteriaForm from "./CreateCriteriaForm";
import {useAppDispatch} from "../../../../../../app/hooks";
import {fetchGeoSelector} from "../../../../thunks";
import {IFundBaseInfo, IFundDetail} from "../../../../../../interfaces/fundDetails";


interface CreateCriteriaButtonProps {
  fund: IFundDetail | IFundBaseInfo;
}


const CreateCriteriaButton: FunctionComponent<CreateCriteriaButtonProps> = ({fund}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(()=>{
    dispatch(fetchGeoSelector())
  }, [])

  const closeModal = () => setShowModal(false);

  return <>
    <StyledButton className={'float-end'} onClick={() => setShowModal(true)}>+ Create</StyledButton>
    <StyledModal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title><ModalHeading>Create eligibility criteria</ModalHeading></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreateCriteriaForm fund={fund} closeModal={closeModal}/>
      </Modal.Body>
    </StyledModal>
  </>;
};

export default CreateCriteriaButton;
