import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  @media (max-width: 1200px) {
    flex-wrap: wrap;
  }
`;

export const Cont = styled.div`
  border: 1px solid #e9edf3;
  border-radius: 12px;
  overflow:hidden;
  &:first-child {
    width: 50%;
  }
  &:nth-child(2){
    width: 29%;
  }  
  &:last-child {
    width: 24%;
  }
  > div {
    border-bottom: 1px solid #e9edf3;
    &:last-child {
      border-bottom: none;
      height:100%;
    }
  }
`;

export const TableRow = styled.div`
  display: flex;
  min-height: 72.5px;
  width: 100%;
  > div {
    padding: 24px;
`;

export const LeftCol = styled.div<{hideBorder?:boolean; width?: string}>`
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: ${props => props.width ? props.width : '192px'};
  
  border-right:${props=> props.hideBorder? 'none':'1px solid #e9edf3'} ;
  > span>span {
    color: #607d8b;
    font-weight: 400;
  }
`;

export const RightCol = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  > span {
    font-weight: 500;
  }
`;

export const Text = styled.span<{ color?: string }>`
  font-family: Inter;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: left;
  white-space: nowrap;
  ${(props) => (props.color ? `color: ${props.color} !important;` : "")}

  >span{
    ${(props) => (props.color ? `color: ${props.color} !important;` : "")}
  }
`;
