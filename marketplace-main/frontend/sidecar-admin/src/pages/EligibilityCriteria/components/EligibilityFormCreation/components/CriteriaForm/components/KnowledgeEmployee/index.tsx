import React, {FunctionComponent, useState} from 'react';
import { eligibilityConfig } from "../../../../utils/EligibilityContext";
import {ICriteriaBlock} from "../../../../../../../../interfaces/EligibilityCriteria/criteria";
import APISyncTextField from "../../../../../../../../components/AutoSyncedInputs/TextInput";
import Api from "../../../../../../../../api";
import {useAppDispatch, useAppSelector} from "../../../../../../../../app/hooks";
import {selectSelectedCriteriaDetail} from "../../../../../../selectors";
import deleteIcon from "../../../../../../../../assets/images/delete-icon.svg";
import {AddButtonDiv, KnowledgeEmployeeOption} from "./styles";
import Button from "react-bootstrap/Button";
import {generateUUid} from "../../../../../../../../utils/uuidGenerator";
import {deleteCriteriaBlockOption, updateCriteriaBlockPayload} from "../../../../../../eligibilityCriteriaSlice";
import {reorderOptions} from '../../../../../../../../utils/reorderOptions';


interface KnowledgeEmployeeBlockProps {
  criteriaBlock: ICriteriaBlock
  allowEdit?: boolean;
}


const KnowledgeEmployeeBlock: FunctionComponent<KnowledgeEmployeeBlockProps> = ({criteriaBlock, allowEdit}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail)
  let options = reorderOptions(criteriaBlock.payload.options);
     
  const dispatch = useAppDispatch()

  if (!selectedCriteria) return <></>

  const addCriteriaBlockOption = async (updatedCriteriaBlock: ICriteriaBlock) => {
    const updatedPayload = {
      criteriaId: selectedCriteria.id,
      payload: updatedCriteriaBlock.payload,
      criteriaBlockId: criteriaBlock.id
    }
    dispatch(updateCriteriaBlockPayload(updatedPayload))
  }

  const deleteOption = async (optionId: string) => {
    const updatedPayload = {
      criteriaId: selectedCriteria.id,
      optionId: optionId,
      criteriaBlockId: criteriaBlock.id
    }
    dispatch(deleteCriteriaBlockOption(updatedPayload))
  }

  const onChange = async (optionId: string, value: string) => {
    const payload = {payload: {option: {id: optionId, text: value}, action: 'update'}}
    await Api.updateCriteriaBlock(criteriaBlock.id, payload)
  }

  const onDelete = async (optionId: string) => {
    const payload = {payload: {option: {id: optionId}, action: 'delete'}}
    await Api.updateCriteriaBlock(criteriaBlock.id, payload)
    await deleteOption(optionId)
  }

  const onAdd = async () => {
    setSubmitting(true)
    const payload = {payload: {option: {id: generateUUid(), text: '', logical_value: true}, action: 'add'}}
    const updatedCriteriaBlock = await Api.updateCriteriaBlock(criteriaBlock.id, payload)
    await addCriteriaBlockOption(updatedCriteriaBlock)
    setSubmitting(false)
  }

  return <div>
    <h4>{criteriaBlock.block.title}</h4>
    {options?.map((option: any, idx: number) => {
      return <KnowledgeEmployeeOption key={option.id}>
        <APISyncTextField
          name={`${criteriaBlock.block.block_id}-option-${idx}`}
          placeholder={''}
          onChange={(value: string) => onChange(option.id, value)}
          value={option.text}
          disabled={!option.logical_value || !allowEdit}
          isTextArea={true}
        />
        {option.logical_value && allowEdit && <img src={deleteIcon} onClick={() => onDelete(option.id)} className={'ms-1 mb-1'} alt="delete-icon" title="Delete" />}
      </KnowledgeEmployeeOption>
    })}
    {allowEdit && (
      <AddButtonDiv>
        <Button variant={'outline-primary'} disabled={submitting} onClick={onAdd}>+ Add</Button>
      </AddButtonDiv>
    )}
  </div>
};

KnowledgeEmployeeBlock.defaultProps = {
  allowEdit: true,
}

export default eligibilityConfig(KnowledgeEmployeeBlock);
