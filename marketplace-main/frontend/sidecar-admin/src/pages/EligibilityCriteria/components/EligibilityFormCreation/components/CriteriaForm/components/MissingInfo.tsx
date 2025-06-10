import React, { FunctionComponent } from "react";
import { MissingInfoText } from "./styles";

interface MissingInfoProps {
  text?: string;
}

const MissingInfo: FunctionComponent<MissingInfoProps> = ({ text }) => {
  return <MissingInfoText>{text}</MissingInfoText>;
};

MissingInfo.defaultProps = {
  text: "** Please Add the Required Information",
};

export default MissingInfo;
