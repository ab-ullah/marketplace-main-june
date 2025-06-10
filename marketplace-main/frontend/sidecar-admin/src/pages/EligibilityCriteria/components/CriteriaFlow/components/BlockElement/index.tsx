import React, {FunctionComponent, useState} from 'react';

import {ICriteriaBlock} from "../../../../../../interfaces/EligibilityCriteria/criteria";
import {BlockFlowElement} from "./styles";
import {getBlockName} from "../../../EligibilityFormCreation/utils/blockName";
import classNames from "classnames";
import {needBlueBackground} from "../../../../../../utils/getCriteriaColor";
import {getCriteriaIcon} from "../../../../../../utils/getCriteriaIcon";
import {Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import PreviewBlock from "../../../../../EligibilityCriteriaPreview/components/PreviewBlock";
import {ActiveBlockContainer} from "../../../../../EligibilityCriteriaPreview/styles";


interface IBlockElement {
  criteriaBlock: ICriteriaBlock
}


const BlockElement: FunctionComponent<IBlockElement> = ({criteriaBlock}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => setShowModal(false);
  return <>
    <BlockFlowElement onClick={() => setShowModal(true)}>
    <span className={classNames("block-tag", {'blue-background': needBlueBackground(criteriaBlock)})}>
      {criteriaBlock.position}
      <img src={getCriteriaIcon(criteriaBlock)} alt="World icon" width={20} height={20}/>
    </span>
      <div className={'block-name'}>{getBlockName(criteriaBlock)}</div>
    </BlockFlowElement>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Block Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ActiveBlockContainer reviewMode={true} flowMode={true}>
          <PreviewBlock criteriaBlock={criteriaBlock} nextFunction={() => {
          }} isEligible={true}/>
        </ActiveBlockContainer>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  </>
};

export default BlockElement;
