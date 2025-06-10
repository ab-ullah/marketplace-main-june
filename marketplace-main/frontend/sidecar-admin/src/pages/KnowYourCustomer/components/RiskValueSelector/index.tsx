import React, {FunctionComponent} from 'react';
import {Form} from "react-bootstrap";
import Select from "react-select";
import {RISK_VALUE_OPTIONS} from "../../../../constants/riskValues";
import API from "../../../../api"
import {setKycRiskValuation} from "../../kycSlice";
import {useAppDispatch} from "../../../../app/hooks";


interface RiskValueSelector {
  recordId: number;
  currentRiskValue: number | null;
}

const RiskValueSelector: FunctionComponent<RiskValueSelector> = (
  {
    recordId,
    currentRiskValue
  }
) => {
  const dispatch = useAppDispatch()

  const selectedValue = RISK_VALUE_OPTIONS.find(option => option.value === currentRiskValue)

  const onChange = async (value: any) => {
    const payload = {'risk_value': value.value}
    dispatch(setKycRiskValuation({recordId, riskEvaluation: value.value}))
    await API.setKycRiskEvaluation(recordId, payload)
  }


  return <Form.Group className="mb-2">
    <Form.Label>Risk Value Rating</Form.Label>
    <Select
      placeholder={'Select Risk Rating'}
      onChange={onChange}
      className="basic-single"
      classNamePrefix="select"
      isMulti={false}
      value={selectedValue}
      name={'reviewers'}
      options={RISK_VALUE_OPTIONS}
    />
  </Form.Group>
}

export default RiskValueSelector;