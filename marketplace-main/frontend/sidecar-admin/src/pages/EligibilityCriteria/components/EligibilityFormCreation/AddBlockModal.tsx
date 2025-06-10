import {FunctionComponent, useEffect, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {useParams} from "react-router-dom";
import { fetchSmartBlockTemplates, getFundCriteriaDetail } from "../../thunks";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {ModalHeading} from "./styles";
import BlocksList from "./components/Blocks";
import Button from "react-bootstrap/Button";
import {EligibilityModal} from "../../../../presentational/EligibilityModal";
import SmartBlockModal from "./SmartBlockModal";
import CustomSmartBlock from "./components/CriteriaForm/components/CustomSmartBlock/Modal";
import SavedTemplates from './components/CriteriaForm/components/SavedTemplates';
import { selectSelectedTemplate, selectSmartBlockTemplates } from '../../selectors';
import EditTemplateModal from './components/CriteriaForm/components/SavedTemplates/EditTemplateModal';

interface CreateCriteriaButtonProps {}

const AddBlockButton: FunctionComponent<CreateCriteriaButtonProps> = () => {
  const {criteriaId} = useParams<{ criteriaId: string | undefined }>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [smartBlockId, setSmartBlockModalId] = useState<null | number>(null);
  const [showCreateBlockModal, setCreateBlockModal] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const templates = useAppSelector(selectSmartBlockTemplates)
  const selectedTemplate = useAppSelector(selectSelectedTemplate);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchSmartBlockTemplates());
  }, [dispatch]);

  const callbackSelectModal = (data: any) => {
    setSmartBlockModalId(data.id);
  };

  const handleCreateBlockModal = (show: boolean) => {
    setCreateBlockModal(show);
    if(show) setShowModal(false);
    else {
      if(criteriaId)
        dispatch(getFundCriteriaDetail(parseInt(criteriaId)));
    }
   } 
  
   const openTemplateModal = () => {
    setShowModal(false)
    setShowTemplateModal(true)
   }

  return <>
    <Button variant={'outline-primary'} className={'float-end'} onClick={() => setShowModal(true)}>+ Add</Button>
    <EligibilityModal size={'xl'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title><ModalHeading>Select block type</ModalHeading></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Eligibility is determined by the jurisdiction of the fund and the location of 
          the investor. Please add the blocks as needed to meet all these criteria.
        </p>
        <SavedTemplates 
        templates={templates} 
        onCreateCustomSmartBlock={() => handleCreateBlockModal(true)}
        callbackEditTemplate={openTemplateModal}
        />
        <BlocksList callbackSelectModal={callbackSelectModal}/>

      </Modal.Body>
    </EligibilityModal>
      <SmartBlockModal
        blockId={smartBlockId}
        handleClose={() => setSmartBlockModalId(null)}
        callbackOpenSmartModal={() => setShowModal(false)}
      />
      <CustomSmartBlock 
        showModal={showCreateBlockModal}
        hideModal={() => handleCreateBlockModal(false)} 
      />
      <EditTemplateModal
      showTemplateModal={showTemplateModal}
      template={selectedTemplate} 
      closeModal={() => {
        setShowTemplateModal(false)
        }} />
  </>;
};

export default AddBlockButton;
