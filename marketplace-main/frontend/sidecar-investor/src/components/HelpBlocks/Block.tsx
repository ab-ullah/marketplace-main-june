import React, {FunctionComponent} from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";

const ParentDiv = styled.div`
  width: 100%;
  min-height: 232px;
  background: #EBF3FB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
`

const IconDiv = styled.div`
  margin-bottom: 30px;
`

const LabelDiv = styled.div`
  position: absolute;
  top: 140px;
  text-align: center;
  width: 100%;
  padding: 10px;


  a {
    text-decoration: none;
    font-family: Inter;
    color: #2E86DE;
    font-style: normal;
    font-weight: normal;
    font-size: 24px;
    line-height: 36px;
  }
`

interface BlockProps {
  label: string;
  url: string;
  icon: React.ReactNode;
}

const Block: FunctionComponent<BlockProps> = ({label, url, icon}) => {

  return <ParentDiv>
    <IconDiv>{icon}</IconDiv>
    <LabelDiv>
      <Link to={url}>{label}</Link>
    </LabelDiv>

  </ParentDiv>
};

export default Block;