import { Dropdown } from "react-bootstrap";
import styled from "styled-components";

export const Cont = styled.div`
  border: 1px solid #e2e6eb;
  border-radius: 7px;
  overflow: hidden;
`;

export const StyledDropdown = styled(Dropdown)<{ breakPoint: string }>`
  @media (min-width: ${(props) => props.breakPoint}) {
    display: none;
  }
  padding-left: 30px;
  .dropdown-toggle {
    background-color: transparent !important;
    color: #79838f !important;
    border: none;
    font-size: 24px;
    :focus {
      box-shadow: none !important;
    }
  }
  .dropdown-item {
    :active {
      background-color: darkgrey !important;
    }
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #f8f9fa;
  padding: 0 36px;
  align-items: center;
  border-radius: 7px 7px 0px 0px;
  border-bottom: 1px solid #e2e6eb;
  min-height: 60px;
  height: 100%;
`;

export const HeaderTitle = styled.p`
  color: #3a8ddf;
  margin: 0px;
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: left;
`;

export const Body = styled.div`
  background-color: white;
  padding: 36px;
  border-radius: 0px 0px 7px 7px;
`;

export const BtnsWrapper = styled.div<{ breakPoint: string }>`
  display: none;
  @media only screen and (min-width: ${(props) => props.breakPoint}) {
    display: flex;
    align-items: center;
  }
`;

export const PillButtonCont = styled.div<{ last?: boolean }>`
  padding-left: 30px;
  padding-right: ${(props) => (props.last ? "0px" : "30px")};
  display: flex;
  height: 100%;
  align-items: center;
  border-left: 1px solid #e2e6eb;
  margin-left: -1px;
`;

export const DetailsTabsContainer = styled.div`
  height: 100%;
  padding-right: 36px;
  .nav-tabs {
    @media (max-width: 1125px) {
      max-width: 300px;
    }

    padding: 0px !important;
    height: 100% !important;
    width: max-content !important;
    background: transparent !important;
    box-shadow: none !important;

    .nav-item {
      padding-left: 10px;
      padding-right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      button {
        // padding: 0px !important;
        padding-top: 16px;
        padding-bottom: 18px;
        font-weight: 400 !important;
        font-size: 14px !important;
        background: transparent;
      }
    }
  }
  .tab-content {
    display: none;
  }
`;
