import styled from "styled-components";
import Nav from "react-bootstrap/Nav";
import {Link} from "react-router-dom";



export const CustomNavItem = styled(Nav.Link)`
  font-family: 'Inter';
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  margin-right: 35px;
  color: #2E2E3A;
  
`


export const CustomLink = styled(Link)<{isActiveLink: boolean}>`
  text-decoration: none;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  ${({isActiveLink}) => isActiveLink ? `
    color: ${(props: any) => props.theme.palette.common.brandColor};
  ` : `
    color: #2E2E3A
  `}
`



export const NavWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5%;
  align-content: center;
`;

