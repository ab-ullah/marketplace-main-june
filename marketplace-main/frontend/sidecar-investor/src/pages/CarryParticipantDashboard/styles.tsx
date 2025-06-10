import styled from "styled-components";

export const SectionWrapper = styled.div`
  padding-left: 40px;
  padding-right: 40px;
  padding-bottom: 40px;
`

export const StatusPill = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color};
  border-radius: 27px;
  background-color: ${(props) => `${props.color}26`};
  box-sizing: border-box;
  padding: 3px 14px;
  width: fit-content;
`;

export const TopHeading = styled.h1`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 32px;
  margin-bottom: ${(props) => `${props.theme.baseLine * 1}px`};
  color: ${(props) => `${props.theme.palette.common.secondaryTextColor}`};
`;

export const SectionHeading = styled.h2`
font-size: 32px;
    margin-bottom: 20px;
    font-family: 'Inter';
    font-weight: 400;
`