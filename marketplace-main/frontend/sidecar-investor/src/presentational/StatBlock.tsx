import styled from "styled-components";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import React from "react";

export const StatBlockContainer = styled(Container)`
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  height: 136px;
  position: relative;
  padding: 8px 8px;
`

const StatHeading = styled.div`
  font-family: 'Quicksand Medium';
  font-size: 15px;
  color: ${props => props.theme.palette.common.bannerTextColor};
  line-height: 28px;
`

const StatValue = styled.div`
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 24px;
  color: ${props => props.theme.palette.common.statValueColor};
  line-height: 40px;
  position: absolute;
  bottom: 10px;
`

const StatValueGreen = styled.div`
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 30px;
  color: ${props => props.theme.palette.common.greenTextColor};
  line-height: 30px;
  position: absolute;
  bottom: 10px;
`

export const DataHeading = styled(Col)`
  font-family: 'Quicksand Bold';
  font-size: 24px;
  color: ${props => props.theme.palette.common.primaryTextColor};
`

export const DataValue = styled(Col)`
  font-family: 'Quicksand Medium';
  font-size: 18px;
  color: ${props => props.theme.palette.common.secondaryTextColor};
`

interface StatBlockParams {
  heading: string;
  value: string | number | React.ReactNode;
}

export const StatBlock = ({heading, value}: StatBlockParams) => {
  return <StatBlockContainer>
    <StatHeading>
      {heading}
    </StatHeading>
    <StatValue>
      {value}
    </StatValue>
  </StatBlockContainer>
}

export const StatBlockGreen = ({heading, value}: StatBlockParams) => {
  return <StatBlockContainer>
    <StatHeading>
      {heading}
    </StatHeading>
    <StatValueGreen>
      {value}
    </StatValueGreen>
  </StatBlockContainer>
}