import React, {FunctionComponent, useEffect} from 'react';
import Form from "react-bootstrap/Form";
import {eligibilityConfig} from "../../../../utils/EligibilityContext";
import {ICriteriaBlock} from "../../../../../../../../interfaces/EligibilityCriteria/criteria";
import API from "../../../../../../../../api"
import {useAppDispatch, useAppSelector} from "../../../../../../../../app/hooks";
import {updateCriteriaBlockPayload} from "../../../../../../eligibilityCriteriaSlice";
import {selectSelectedCriteriaDetail} from "../../../../../../selectors";
import {updateAdminFilledStatus} from "../../../../utils/updateAdminFilledStatus";
import _ from "lodash";
import MissingInfo from "../MissingInfo";

interface HongKongBlockProps {
  criteriaBlock: ICriteriaBlock;
  allowEdit?: boolean;
}


const HongKongBlock: FunctionComponent<HongKongBlockProps> = ({criteriaBlock, allowEdit}) => {
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail)
  const dispatch = useAppDispatch()
  const adminOptions = criteriaBlock.block.options.admin_options;

  const hasAllOptionsSelected = (payload: any) => {
    let allSelected = true;
    adminOptions.forEach((adminOption: any) => {
      if (_.isNil(payload[adminOption.id])) allSelected = false;
    })
    return allSelected;
  }

  useEffect(() => {
    updateAdminFilledStatus(criteriaBlock, hasAllOptionsSelected(criteriaBlock.payload), dispatch)
  }, [])

  if (!selectedCriteria) return <></>

  const onChange = async (optionId: any, value: boolean) => {
    const data = {payload: {[optionId]: value}}
    await API.updateCriteriaBlock(criteriaBlock.id, data)
    const updatedPayload = {
      criteriaId: selectedCriteria.id,
      payload: {...criteriaBlock.payload, [optionId]: value},
      criteriaBlockId: criteriaBlock.id
    }
    dispatch(updateCriteriaBlockPayload(updatedPayload))
    updateAdminFilledStatus(criteriaBlock, hasAllOptionsSelected(updatedPayload.payload), dispatch)
  }
  return <div>
    {!hasAllOptionsSelected(criteriaBlock.payload) && <MissingInfo/>}
    {adminOptions.map((adminOption: any) => <div
      key={adminOption.id}
    >
      <p className={'mb-1 mt-0'}>{adminOption.text}</p>
      <div key={`inline-radio`} className="mb-4 custom-radio-buttons">
        <Form.Check
          className={'mb-2'}
          onChange={() => onChange(adminOption.id, true)}
          inline
          label={<p className={'m-0'}>Yes</p>}
          type={'radio'}
          checked={criteriaBlock.payload[adminOption.id] === true}
          id={`${criteriaBlock.id}-${adminOption.id}-yes`}
          disabled={!allowEdit}
        />
        <Form.Check
          className={'mb-2'}
          onChange={() => onChange(adminOption.id, false)}
          inline
          label={<p className={'m-0'}>No</p>}
          type={'radio'}
          checked={criteriaBlock.payload[adminOption.id] === false}
          id={`${criteriaBlock.id}-${adminOption.id}-no`}
          disabled={!allowEdit}
        />
      </div>
    </div>)}
  </div>
};

HongKongBlock.defaultProps = {
  allowEdit: true,
}

export default eligibilityConfig(HongKongBlock);
