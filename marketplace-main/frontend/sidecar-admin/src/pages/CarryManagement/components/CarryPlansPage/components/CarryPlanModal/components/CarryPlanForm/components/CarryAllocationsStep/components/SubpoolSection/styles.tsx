import styled from "styled-components";

export const CardCont = styled.div<{isSelected:boolean}>`
  padding: 24px;
  gap: 24px;
  border-radius: 8px;
  border: 2px solid;
  border-color: ${(props)=>props.isSelected ? "#4a47a3": "#C1CEE9"};
  display: flex;
  flex-direction: column;
  height: 100%;

  > div {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export const Title = styled.span`
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
  margin: 0px;
`;

export const Text = styled.span<{ color?: string }>`
  font-family: Quicksand;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.02em;
  text-align: left;
  margin: 0px;
  ${(props) => (props.color ? `color: ${props.color}` : "")}
`;

export const PointsContainer = styled.div`
  position: relative;
  > span {
    :nth-child(even) {
      padding-left: 10px;
    }
    :nth-child(odd) {
      color: #607d8b;
      position: relative;
      padding-right: 10px;
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
`;

export const SubpoolSectionCont = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
`;
