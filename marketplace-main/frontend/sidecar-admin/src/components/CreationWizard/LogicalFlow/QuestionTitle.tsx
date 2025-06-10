import React, {FunctionComponent, useState} from 'react';

import {Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import styled from 'styled-components';


interface IBlockElement {
  title: string
}

const TitleWrapper = styled.div`
white-space: nowrap; 
//   width: 160px; 
  overflow: hidden;
  text-overflow: ellipsis; 
`


const QuestionTitle: FunctionComponent<IBlockElement> = ({title}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => setShowModal(false);
  return <>
    <div onClick={() => setShowModal(true)}>
    <TitleWrapper style={{textOverflow: 'ellipsis'}}>
      {title}
    </TitleWrapper>
    </div>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Block Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {title}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  </>
};

export default QuestionTitle;
