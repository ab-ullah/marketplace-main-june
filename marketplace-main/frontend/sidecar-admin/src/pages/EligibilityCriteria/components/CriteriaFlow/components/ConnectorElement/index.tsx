import React, {FunctionComponent, useState} from 'react';

import {IConnector} from "../../../../../../interfaces/EligibilityCriteria/criteria";
import {BlockFlowElement} from "./styles";
import Select from "react-select";
import API from "../../../../../../api";
import {useAppDispatch, useAppSelector} from "../../../../../../app/hooks";
import {selectSelectedCriteriaDetail} from "../../../../selectors";
import {getFundCriteriaDetail} from "../../../../thunks";

interface BlockElement {
  connector: IConnector
}

export const CUSTOM_CONNECT = 'CUSTOM'

const ConnectorElement: FunctionComponent<BlockElement> = ({connector}) => {
  const selectedCriteriaDetail = useAppSelector(selectSelectedCriteriaDetail);
  const [condition, setCondition] = useState<string>(connector.condition);
  const dispatch = useAppDispatch()
  const options = [
    {label: 'AND', value: 'AND'},
    {label: 'OR', value: 'OR'},
    {label: 'CUSTOM', value: CUSTOM_CONNECT},
  ]
  
  const activeCondition = selectedCriteriaDetail?.has_custom_logic_block ? 'CUSTOM' : condition;

  const selectedValue = options.find(o => o.value === activeCondition)

  const onChange = async (value: any) => {
    setCondition(value.value);
    const payload = {condition: value.value};
    await API.updateConnector(connector.id, payload)
    if (value.value === CUSTOM_CONNECT) {
      await API.createCustomLogicBlock(selectedCriteriaDetail?.id)
      //@ts-ignore
      dispatch(getFundCriteriaDetail(selectedCriteriaDetail.id));
    }
  }

  return <BlockFlowElement operator={activeCondition}>
    <Select
      onChange={onChange}
      className="flow-select"
      classNamePrefix="select"
      isSearchable={false}
      value={selectedValue}
      options={options}
      isDisabled={selectedCriteriaDetail?.has_custom_logic_block}
    />
  </BlockFlowElement>
};

export default ConnectorElement;
