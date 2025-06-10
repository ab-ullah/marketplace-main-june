import { Button } from "react-bootstrap";
import styled from "styled-components";

export const PageContainer = styled.div`
  padding: 30px 0px 120px 0px;
  .breadcrumb-item > a {
    color: #607d8b;
  }
`;

export const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h1`
  font-family: Inter;
  font-size: 48px;
  font-weight: 700;
  line-height: 50px;
  letter-spacing: 0em;
  text-align: left;
`;

export const SubTitle = styled.h1`
font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
`

const SimpleButton = styled(Button)`
padding: 16px 26px 16px 26px !important;
  border-radius: 12px !important;
  border: 1px !important;
  gap: 8px !important;
  height: 56px !important;
  color:black !important;
  background: transparent !important;

  &:disabled{
    cursor: not-allowed;
  }
`

export const TopButton = styled(SimpleButton)`
  background: #413c69 !important;
  color: white !important;
`;

export const SecondaryButton = styled(SimpleButton)`
  background: #e4eaf6 !important;
  color: #413c69 !important;
`;

export const DangerButton = styled(SimpleButton)`
  background: #9C1D1D !important;
  color: white !important;
`;

export const OutlinedButton = styled(SimpleButton)`
border:1px solid #E3E7EE !important;
`

export const PillButton = styled.button<{color?:string,background?:string, borderColor?:string, borderWidth?:string, font?:Record<string,any>}>`
  width: max-content;
  padding: 8px 16px 8px 16px;
  border-radius: 27px;
  gap: 4px;
  color: ${props => props.color ?? 'black'};
  background-color:  ${props => props.background ?? '#eceff1'} ;
  border-color:  ${props => props.borderColor ?? 'transparent'};
  border-width:  ${props => props.borderWidth ?? '2px'};
  border-style: solid;
  font-family: Quicksand;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 0.02em;
  text-align: left;
  display:flex;
  align-items:center;
  gap:8px;
  ${props=> (props.font ? props.font: {})}

  &:disabled{
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ButtonsCont = styled.div`
display: flex;
gap: 10px;

`

export const StatusPill = styled.div`
  color: ${(props) => props.color};
  border-radius: 27px;
  background-color: ${(props) => `${props.color}26`};
  box-sizing: border-box;
  padding: 3px 14px;
  width: fit-content;
`;

export const CarryDatePickerWrapper = styled.div`
  min-width: 200px;
  .row {
    margin-top: 0 !important
  }
`;