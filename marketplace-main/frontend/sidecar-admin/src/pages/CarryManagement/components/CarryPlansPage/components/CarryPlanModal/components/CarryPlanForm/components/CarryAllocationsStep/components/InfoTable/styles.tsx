import styled from "styled-components";

export const Cont = styled.div`
  border: 1px solid #e9edf3;
  border-radius: 12px;

  > div {
    border-bottom: 1px solid #e9edf3;
    &:last-child {
      border-bottom: none;
    }
  }
`;

export const Row = styled.div`
  display: flex;

  > div {
    padding: 24px;
    width: 100%;
`;

export const LeftCol = styled.div`
  max-width: 273px;
  border-right: 1px solid #e9edf3;
  > span {
    color: #607d8b;
    font-weight: 400;
  }
`;

export const RightCol = styled.div`

display: flex;
justify-content: space-between;


> span {
    font-weight: 500;
  }

`;

export const PointsContainer = styled.div`
display: flex;
flex-wrap: wrap;
justify-content: flex-end;
>div {
    display: flex;
    > span {
    padding: 0 24px;
    :nth-child(odd) {
      color: #607d8b;
      position: relative;
      &:after {
        content: "";
        height: 100%; 
        width: 1.5px;
  
        position: absolute;
        right: 0;
        top: 0; 
        background-color: #dfe5ed; 
      }
    }
  }
}
}
`

export const Text = styled.span<{ color?: string }>`
  font-family: Inter;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: left;
  ${(props) => (props.color ? `color: ${props.color}` : "")}
`;