import React, { FunctionComponent } from 'react';
import { isToolTipText } from "../../../components/ToolTip/interfaces";
import { SectionHeaderData } from '../../../interfaces/workflows';
import ToolTip from '../../../components/ToolTip';
import { FieldComponent } from '../interfaces';
import { SectionNote } from '../styles';
interface Props extends FieldComponent {
}

const SectionHeader: FunctionComponent<Props> = ({ question }) => {
  const { helpText, label } = question;
  const { size } = question.data as SectionHeaderData;

  return <SectionNote size={size} >
    {label}
    {isToolTipText(helpText) && (
      <sub><ToolTip {...helpText} /></sub>
    )}
    {typeof helpText === "string" && (
      <sub><ToolTip heading='' description={helpText} /></sub>
    )}
  </SectionNote>
};

export default SectionHeader;