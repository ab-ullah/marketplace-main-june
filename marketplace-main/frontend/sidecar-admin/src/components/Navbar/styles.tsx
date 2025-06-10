import styled from "styled-components";
import Nav from "react-bootstrap/Nav";
import {Link} from "react-router-dom";
import Container from "react-bootstrap/Container";

export const NavContainer = styled(Container)`
  padding: 5px 80px;
  @media (max-width: 991px) {
    padding: 5px 24px;
    .navbar-brand {
      img {
        max-width: 147px;
        height: 23px;
      }
    }
  }
  .navbar-brand {
    img {
      max-width:188px;
      height: 29px;
    }
  }
`

export const CustomNavItem = styled(Nav.Link)`
  font-family: 'Inter';
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: #2E2E3A;
  border-bottom: 4px solid ${(props: any) => props.theme.palette.common.brandColor};
  ${({isActiveLink}) => isActiveLink ? `
    border-radius: 4px;
  ` : `
    border-bottom: 0px;
  `}
`

export const CustomLink = styled(Link)`
  text-decoration: none;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: inherit;
`
export const NavWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: inherit;
  justify-content: flex-end;
`;

export const NavTaskCount = styled.span`
  margin-right: 30px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  color: #2E86DE;
  
  a {
    text-decoration: none;
    color: inherit;
  }
  
  .count {
    padding: 2px 8px;
    background: #ECA106;
    border-radius: 100px;
    color: #FFFFFF;
    margin-left: 8px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 17px;
  }

`
