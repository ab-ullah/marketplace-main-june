import styled from "styled-components";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";

export const FundDetailContainer = styled(Container)`
  margin-top: 85px; 

  .topCol {
    padding: 20px 0 20px 40px;
  }

  h4 {
    font-family: Inter;
    font-style: normal;
    font-weight: bold;
    font-size: 40px;
    line-height: 60px;
    margin-right: 30px;
    margin-bottom: 0;
  }

  .header-row {
    display: flex;
    flex-direction: row;
  }

  .view-selector {
    min-width: 150px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: center;

    svg {
      fill: #B0BEC5;
    }

    .select__control {
      padding: 2px;
      border-radius: 10px;
    }

    .select__indicator-separator {
      display: none;
    }
  }
`

export const StatusBadge = styled(Badge)<any>`
  ${({color}) => `background-color: ${color};`}
  position: relative;
  z-index: 10;
  border-radius: 20px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  width: fit-content;
  margin-left: 10px;
  color: #FFFFFF;
  text-transform: capitalize;
`

export const StatusDiv = styled.div`
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: flex-end;
  align-items: center;
`

export const HeaderContainer = styled.div`
  padding: 0px 68px;
  @media (max-width: 991px) {
    padding: 0px 10px;
  }
`;
