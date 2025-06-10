import { FunctionComponent, useState, useEffect, useCallback } from "react";
import find from "lodash/find";
import includes from "lodash/includes";
import Modal from "react-bootstrap/Modal";
import { useAppSelector, useAppDispatch } from "../../../../app/hooks";
import { ModalHeading } from "./styles";
import { EligibilityModal } from "../../../../presentational/EligibilityModal";
import { selectSelectedCriteriaDetail } from "../../selectors";
import FormBlock from "./components/CriteriaForm/components/FormBlock";
import { ADMIN_CONFIG_BLOCKS } from "../../../../constants/eligibility_block_codes";
import { getFundCriteriaDetail } from "../../thunks";

const SmartBlockModal: FunctionComponent<any> = ({
  blockId,
  callbackOpenSmartModal,
  handleClose,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail);
  const selectedCriteriaBlocks = selectedCriteria?.criteria_blocks;
  const dispatch = useAppDispatch()

  const resetBlock = useCallback(
    () => setSelectedBlock(null),
    [setSelectedBlock]
  );

  const onHide = () => {
    resetBlock();
    if(selectedCriteria && selectedCriteria.id){
      dispatch(getFundCriteriaDetail(selectedCriteria.id));
    }
    handleClose();
  }
  

  useEffect(() => {
    if (blockId) {
      const selectedBlock = find(
        selectedCriteriaBlocks,
        (block) => block.id === blockId
      );
      if (
        includes(
          ADMIN_CONFIG_BLOCKS,
          selectedBlock?.block?.block_id
        )
      ) {
        setSelectedBlock(selectedBlock);
        callbackOpenSmartModal();
      }
    } else {
      resetBlock();
    }
  }, [blockId, selectedCriteriaBlocks, resetBlock, callbackOpenSmartModal]);

  return (
    <>
      <EligibilityModal
        size={"xl"}
        show={selectedBlock !== null}
        onHide={onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <ModalHeading>{selectedBlock?.block?.heading}</ModalHeading>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBlock && (
            <FormBlock
              key={`modal-form-${selectedBlock.id}`}
              criteriaBlock={selectedBlock}
              showTitle={false}
              showActionsMenu={false}
            />
          )}
        </Modal.Body>
      </EligibilityModal>
    </>
  );
};

export default SmartBlockModal;
