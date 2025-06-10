import styled from "styled-components";
import { isPropertyAssignment } from "typescript";

export const TabsContainer= styled.div`

display:flex;
border-bottom: 1px solid #D3D8DF;
background-color: #F6F7F8;

> div {
    border-right: none;
}

> div:not(:last-child) {
    
    border-right: 1px solid #D3D8DF;
  }

`

export const Tab = styled.div<{active?:boolean,disabled?:boolean}>`
  padding: 16px 36px 16px 36px;
  gap: 12px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor: ${(props)=>props.disabled ? 'not-allowed':'pointer'};
  > div {
    color: ${(props)=>props.active ? '#3A8DDF':'#AAB9C1'};
    border-color: ${(props)=>props.active ? '#3A8DDF':'#AAB9C1'};
  }

  >p {
    color: ${(props)=>props.active ? '#3A8DDF':'#AAB9C1'}
  }
`;

export const StepPill = styled.div`
  padding: 3px 12px 3px 12px;
  border: 1px solid;
  border-radius: 27px;
  gap: 4px;
  min-width: 74px;
`;

export const TabTitle = styled.p`
  margin: 0px;
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.02em;
  text-align: left;
`;
