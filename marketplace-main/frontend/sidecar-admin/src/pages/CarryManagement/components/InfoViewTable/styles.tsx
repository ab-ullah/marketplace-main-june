import styled from "styled-components";
export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;
export const Cont = styled.div`
  border: 1px solid #e9edf3;
  border-radius: 12px;
  min-width: 32%;
  width: max-content;
  min-width: 550px;
  > div {
    border-bottom: 1px solid #e9edf3;
    &:last-child {
      border-bottom: none;
    }
  }
`;
export const TableRow = styled.div`
  display: flex;
  height: 72.5px;
  min-width: 393px;
  width: 100%;
  > div {
    padding: 24px;
    width: 100%;
`;
export const LeftCol = styled.div<{hideBorder?:boolean}>`
  flex-grow: 1 !important;
  overflow: hidden;
  text-overflow: ellipsis;
  border-right:${props=> props.hideBorder? 'none':'1px solid #e9edf3'} ;
  > span>span {
    color: #607d8b;
    font-weight: 400;
  }
`;
export const RightCol = styled.div`
  flex-grow: 1 !important;
  overflow: hidden;
  text-overflow: ellipsis;
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