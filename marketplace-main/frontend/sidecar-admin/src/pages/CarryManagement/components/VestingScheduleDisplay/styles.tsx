import styled from "styled-components";

export const Heading = styled.h2`
  font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
  margin-bottom: 14px;
`;

export const TRow = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #b0bec5;
  padding: 5px 0px;
  > div {
    display: flex;
    > span {
      text-align: right;
      // min-width: 250px;
      width: max-content;
    }
    >span:last-child {
      min-width: 120px;
    }
  }
`;

export const TCell = styled.span`
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 30px;
  letter-spacing: 0em;
  text-align: left;
  min-width: 120px;
`;
