import styled from "styled-components";
import { SecondaryButton } from "../../../../../styles";
import { Col, Row } from "react-bootstrap";
import { Menu, MenuItem, Popover } from "@material-ui/core";

export const PoolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  h4 {
    font-size: 18px;
    font-weight: 700;
  }

`;

export const PoolContainer = styled(Row)`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;


export const CardWrapper = styled(Col)`
  padding: 24px;
  gap: 24px;
  border-radius: 8px;
  border: 2px solid;
  border-color: #C1CEE9;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 270px;

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

export const MenuIconWrapper = styled.div`
  display: inline-block;
  cursor: pointer;
  width: 24px;
`

export const TitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
`

export const OptionItem = styled(MenuItem)`
  width: 230px;
  color: #607D8B;
  font-size: 14px !important;
  font-weight: 500 !important;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  padding: 8px 20px;
  &.disabled {
    color: #aaa !important;
    cursor: not-allowed;
  }
  :hover {
  background: #2e7a7a0d;
  }
  p {
  margin: 0;
  padding: 0;
  }
`;

export const StyledButton = styled(SecondaryButton)`
  width: auto;
  margin-left: 0px !important;
  height: 47px !important;
  padding: 12px 26px 12px 26px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PointsFieldWrapper = styled.div`
  width: 50%;
  margin-bottom: 20px;
`;

export const PointsReallocationsStatsWrapper = styled.div`
    border-top: 1px solid #C1CEE9;
    padding-top: 20px;

    p {
        font-size: 18px;
        font-weight: 500;
        color: #393940;
    }
`

export const StyledPopover = styled(Popover)`
    .MuiPopover-paper {
    width: 230px;
    }
`
export const StyledTitle = styled.p`
  padding-bottom: 12px;
  margin-bottom: 12px;
  width: 100%;
  border-bottom: 1px solid #d4cbcb;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
`;