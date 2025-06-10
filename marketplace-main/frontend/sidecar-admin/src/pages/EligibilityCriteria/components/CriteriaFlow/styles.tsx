import styled from "styled-components";

export const FlowContainer = styled.div<any>`
  height: 100vh;

  .react-flow__node-default {
    z-index: 0 !important;
    ${props => !props.isSmartCriteria ? 'border: none': ''};
    padding: 0;
  }
  ${(props) => {
    if(!props.isSmartCriteria){
      return `
      .react-flow__handle {
        background: transparent !important;
      }
      `
    }
  }}
`