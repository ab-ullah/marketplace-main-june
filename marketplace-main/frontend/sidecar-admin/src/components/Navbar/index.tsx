import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import AuthenticationButton from "../auth/AuthenticationButton";
import {CustomLink, CustomNavItem, NavContainer, NavWrapper} from "./styles";
import {useHistory, useLocation} from 'react-router-dom'
import {FUNDS_PATH, COMPANY_PATH, PARTICIPANTS_PATH, CARRY_MANAGEMENT_PATH} from "./constants";
import NotificationBell from "./NotificationBell";
import MyTasksCount from "./MyTasks";
import Logo from '../../assets/images/navable-logo.png'
import { useGetUserInfoQuery } from '../../api/rtkQuery/commonApi';
import { get } from 'lodash';
import {useState} from "react";

interface INavBarProps{
  isCarryEnabled:boolean;
  isCoinvestEnabled: boolean;
  isParticipantIndexViewEnabled: boolean;
}

const NavBar = ({isCarryEnabled, isCoinvestEnabled, isParticipantIndexViewEnabled}:INavBarProps) => {
  const location = useLocation();
  const history = useHistory();
  const { data } = useGetUserInfoQuery()
  const fullAccess = get(data, 'has_full_access', false);
  const path = location.pathname
  const handleClick = (path: string) => {
    history.push(path);
  }
  
  return <Navbar bg="light" expand="lg" fixed="top" id='main-nav'>
    <NavContainer fluid>
      <Navbar.Brand><img src={Logo} alt=""/></Navbar.Brand>
      <NavWrapper>
        <CustomNavItem onClick={() => handleClick(COMPANY_PATH)} isActiveLink={path === COMPANY_PATH} className={`center-nav`}>
          <CustomLink to={COMPANY_PATH}>Company</CustomLink>
        </CustomNavItem>
        {isCoinvestEnabled && <CustomNavItem onClick={() => handleClick(FUNDS_PATH)} isActiveLink={path === FUNDS_PATH} className={`center-nav`}>
          <CustomLink to={FUNDS_PATH}>Funds</CustomLink>
        </CustomNavItem>}

        {isCarryEnabled &&
        <CustomNavItem onClick={() => handleClick(CARRY_MANAGEMENT_PATH)} isActiveLink={path === CARRY_MANAGEMENT_PATH} className={`center-nav`}>
          <CustomLink to={CARRY_MANAGEMENT_PATH}>Carry Management</CustomLink>
        </CustomNavItem>}
        {isParticipantIndexViewEnabled &&
        <CustomNavItem onClick={() => handleClick(PARTICIPANTS_PATH)} isActiveLink={path.includes(PARTICIPANTS_PATH)} className={`center-nav`}>
          <CustomLink to={PARTICIPANTS_PATH}>Participants</CustomLink>
        </CustomNavItem>}
      </NavWrapper>
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <MyTasksCount/>
        </Nav>
        <Nav>
          <Nav.Item><NotificationBell/></Nav.Item>
        </Nav>
        <Nav>
          <Nav.Item><AuthenticationButton/></Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </NavContainer>
  </Navbar>
};

export default NavBar;
