import styled from "styled-components";

export const BlockFlowElement = styled.div`
  background: #FFFFFF;
  padding: 30px;

  .block-tag {
    color: #78909C;
    background: #EFEEED;
    padding: 10px 16px;
    border-radius: 4px;
    display: inline-block;
    vertical-align: middle;
    font-size: 16px;
    font-family: 'Quicksand Bold';

    img {
      margin-left: 15px;
      margin-top: -1px;
      margin-bottom: 3px;
    }

    span {
      color: inherit;
      margin-left: 18px;
      font-family: 'Quicksand Bold';
    }
  }
  
  .block-name {
    margin-top: 20px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 17px;
    color: ${props => props.theme.palette.eligibilityTheme.black};
  }
`