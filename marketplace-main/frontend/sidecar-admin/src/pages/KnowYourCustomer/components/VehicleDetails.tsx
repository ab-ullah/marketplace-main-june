import { FunctionComponent } from 'react';
import get from "lodash/get";
import {
  QuestionContainer,
  QuestionInner,
  QuestionLabel
} from '../styles';

const QuestionRow: FunctionComponent<any> = ({ label, value }) => {
  return (
    <QuestionContainer>
      <QuestionInner>
        <QuestionLabel>{label}</QuestionLabel>
      </QuestionInner>
      <QuestionInner>
        <span>{value}</span>
      </QuestionInner>
    </QuestionContainer>
  )
}


const VehicleDetails: FunctionComponent<any> = ({ appInfo }) => {
  return (
    <>
      <QuestionRow label="Vehicle Name" value={get(appInfo, 'vehicle.name')} />
      <QuestionRow label="Share Class" value={get(appInfo, 'share_class.display_name')} />
      <QuestionRow label="Investor Account Code" value={get(appInfo, 'investor_account_code')} />
    </>
  )
}

export default VehicleDetails;