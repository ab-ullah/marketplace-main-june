import React, {FunctionComponent} from "react";
import {IconDiv, LabelDiv, ParentDiv} from "./styles";


interface BlockProps {
  label: string;
  url: string;
  icon: string | undefined;
}

const Block: FunctionComponent<BlockProps> = ({label, url, icon}) => {

  return <ParentDiv>
    <IconDiv>{icon && <img src={icon} alt="block-icon"/>}</IconDiv>
    <LabelDiv>
      <a href={url}>{label}</a>
    </LabelDiv>

  </ParentDiv>
};

export default Block;