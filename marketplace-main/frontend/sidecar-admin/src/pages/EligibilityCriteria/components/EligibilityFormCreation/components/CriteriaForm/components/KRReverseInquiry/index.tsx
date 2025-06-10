import React, {FunctionComponent, useEffect} from 'react';
import Form from "react-bootstrap/Form";
import { eligibilityConfig } from "../../../../utils/EligibilityContext";
import {ICriteriaBlock} from "../../../../../../../../interfaces/EligibilityCriteria/criteria";
import API from "../../../../../../../../api"
import MissingInfo from "../MissingInfo";
import {useAppDispatch, useAppSelector} from "../../../../../../../../app/hooks";
import {updateCriteriaBlockPayload} from "../../../../../../eligibilityCriteriaSlice";
import {selectSelectedCriteriaDetail} from "../../../../../../selectors";
import {updateAdminFilledStatus} from "../../../../utils/updateAdminFilledStatus";


interface KRReverseInquiryProps {
  criteriaBlock: ICriteriaBlock;
  allowEdit?: boolean;
}


const KRReverseInquiry: FunctionComponent<KRReverseInquiryProps> = ({criteriaBlock, allowEdit}) => {
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail)
  const dispatch = useAppDispatch()


  useEffect(()=>{
    updateAdminFilledStatus(criteriaBlock, criteriaBlock.payload.allowed, dispatch)
  }, [])

  if (!selectedCriteria) return <></>

  const onChange = async () => {
    const newValue = !criteriaBlock.payload.allowed;
    const data = {payload: {allowed: newValue}}
    await API.updateCriteriaBlock(criteriaBlock.id, data)
    const updatedPayload = {
      criteriaId: selectedCriteria.id,
      payload: {allowed: newValue},
      criteriaBlockId: criteriaBlock.id
    }
    dispatch(updateCriteriaBlockPayload(updatedPayload))
    updateAdminFilledStatus(criteriaBlock, newValue, dispatch)
  }
  return <div>
    {!criteriaBlock.payload.allowed && <MissingInfo/>}
    <h4>{criteriaBlock.block.title}</h4>
    <div
      className={'mt-2'}
      key={`rules-kr-reverse`}
    >
      <Form.Check
        inline
        label={<p className={'m-0'}>Yes</p>}
        name={`kr-reverse-inqury`}
        type={'checkbox'}
        checked={criteriaBlock.payload.allowed}
        onChange={onChange}
        disabled={!allowEdit}
      />
    </div>
  </div>
};

KRReverseInquiry.defaultProps = {
  allowEdit: true,
}

export default eligibilityConfig(KRReverseInquiry);
