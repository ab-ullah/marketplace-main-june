import styled, {css} from "styled-components";
import {Link} from "react-router-dom";
import Container from "react-bootstrap/Container";
import BSButton from "react-bootstrap/Button";
import BGImage from "../../assets/images/buildings.jpeg";
import { ThemeButton } from "../Button/styles";

export const Wrapper = styled(Container)`
  background-color: #eceff1;
  min-height: ${(props) => props.hasLoader ? "calc(100vh - 88px)" : "calc(100vh - 200px)"};
  padding: 50px;
  padding-bottom: 1px;

  p {
    font-size: 16px;
  }
`;


export const StartPageWrapper = styled(Wrapper)`
  min-height: ${(props) => props.hasLoader ? "calc(100vh - 88px)" : "calc(100vh - 350px)"};
`;

const StyledButton = css`
  border-radius: 4em;
  font-weight: 700;
  font-size: 18px;
  font-family:'Quicksand Medium';
  text-decoration: none;
  padding: 16px 20px;

  &:hover {
    background-color: #470c75;
    color: #eee;
  }
`

export const Button = styled(ThemeButton)`
  ${StyledButton}
`;

export const TableButton = styled(ThemeButton)`
  padding: 6px 14px;
  font-weight: 700;
  font-size: 14px;`

export const LinkButton = styled(Link)`
  ${StyledButton}
  text-align: center;
`;

export const H1 = styled.h1`
  font-weight: 700;
  font-size: 40px;
`;
export const H2 = styled.h2`
  font-weight: 400;
  font-size: 30px;
  font-family: 'Quicksand Bold';
  a{
    font-family: 'Quicksand Medium';
  }
`;
export const H3 = styled.h3`
  font-weight: 400;
  font-size: 16px;
`;

export const H4 = styled.h4`
  font-weight: 400;
  font-size: 20px;
`;

export const PillStyle = css`
  background-color: #eceff1;
  border-radius: 4em;
  color: #020203;
  font-size: 12px;
  padding: 4px 12px;
  font-weight: 700;
`;


export const Pill = styled.span`
  ${PillStyle}
`;

export const PillLink = styled(Link)`
  ${PillStyle}
  background-color: #EBF3FB;
  color: #2E86DE;
`;

export const PillAbsoluteLink = styled.div`
  ${PillStyle}
  background: ${props=> props.theme.palette.primary} !important;
  border-radius: 27px;
  color: #FFFFFF;
  font-family: 'Quicksand Bold';
  font-weight: 700 !important;
  font-size: 14px;
  text-decoration: none;
  padding: 6px 14px;
  width: 117px;
  cursor: pointer;
  text-align: center;
`;

export const ComingSoon = styled.span`
  background: #CFD8DC;
  border-radius: 27px;
  padding: 6px 14px;
  font-weight: 700;
  font-size: 14px;
  color: #020203;
  font-family: 'Quicksand Bold';
  width: 117px;
  text-align: center;
  white-space: nowrap;
`


export const Banner = styled.div`
  background-image: linear-gradient(90deg,
  rgba(255, 255, 255, 1),
  rgba(255, 255, 255, 0.7)),
  url(${BGImage});
  height: 338px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  padding: 24px;
  position: relative;
  overflow: hidden;

  .bottom-content {
    position: absolute;
    bottom: 24px;
    font-size: 24px;
    color: #ad62aa;

    .value {
      font-size: 80px;
      font-weight: 700;
      margin-right: 8px;
    }

    .sign {
      font-size: 32px;
    }
  }
`;

export const ProgressBar = styled.div<any>`
  width: ${({value}: { value: number }) => `${value || 0}`}%;
  height: 4px;
  display: inline-block;
  background-color: #2E86DE;
  position: absolute;
  bottom: 0;
  left: 0;

`

export const Section = styled.div`
  margin-bottom: 48px;
`;

export const AppStatus = styled.div`
  background-color: #fff;
  padding: 38px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media screen and (max-width: 600px) {
    flex-direction: column;
  }

  p {
    color: #020203;
    font-size: 20px;
  }

  button {
    padding: 16px 40px;
  }
`;

export const ContactWrapper = styled.div`
  background-color: #fff;
  height: 350px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-right: 30px;
  text-align: center;
  padding: 48px;
  box-shadow: 0px 76px 74px rgba(0, 0, 0, 0.03), 0px 16px 16px rgba(0, 0, 0, 0.0178832), 0px 5px 5px rgba(0, 0, 0, 0.0121168);
  border-radius: 8px;

  a {
    color: #2e86de;
    text-decoration: none;
    word-break: break-word;
  }

  .help-center-link {
    color: #FFFFFF;
    background: #4A47A3;
    border-color: #4A47A3;
    border-radius: 70px;
    font-weight: 700;
    font-size: 24px;
    padding: 16px 40px;

  }
`;

export const TasksContainer = styled.div`
  max-height: 350px;
  overflow-y: auto;
`;

export const TaskHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    color: #2e86de;
    font-weight: 500;
    font-size: 16px;
  }
`;

export const TaskWrapper = styled.div`
  background-color: #fff;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;

  p {
    margin: 0;
    font-weight: 700;
    font-size: 16px;
  }

  .info-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 23px;

    p {
      font-weight: 500;
      font-size: 14px;
    }

    .task-time {
      color: #e37628;

      svg {
        height: 14px;
        fill: #e37628;
        position: relative;
        bottom: 2px;
      }
    }
  }
`;

export const FooterContainer = styled.div`
  padding: 41px 56px;
  min-height: 348px;
  background-color: ${props => props.theme.palette.common.darkDesaturatedBlueColor};
  color: #FFF;

  .logo {
    margin-bottom: 33px;
  }

  .links {
    margin: 0;
    padding: 0;
    margin-bottom: 42px;

    li {
      display: inline-block;
      margin-right: 32px;
    }
  }

  .content {
    margin-bottom: 42px;
    font-size: 14px;
    font-weight: 500;
  }

  .copyright {
    font-size: 14px;
    font-weight: 400;
  }
`


export const MenuIconWrapper = styled.div`
  display: inline-block;
  cursor: pointer;
  width: 24px;
`


export const ActionLink = styled(Link)`
  border-bottom: 1px dotted #2E86DE;
  color: #2E86DE !important;
  display: block;
  padding: 8px 16px;
  width: 100px;
  text-align: center;

  &:hover {
    background-color: rgba(46, 122, 222, 0.05);
  }
`

export const StatusBarDiv = styled.div`
  display: flex;
  background: #FFF;
  width: fit-content;
  border-radius: 24px;
  border: 1px solid #C1CEE9;

  div {
    padding: 6px 14px;
    display: flex;
    align-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.02em;
    color: #020203
  }

  .right-border {
    border-right: 1px #C1CEE9 solid;
  }

  .counter {
    font-weight: 500;
    font-size: 22px;
    line-height: 32px;
    color: #020203;
    margin-right: 10px;
    margin-left: 6px;
  }
`

export const ActiveApplicationCardDiv = styled.div`
  width: 100%;
  background: #FFFFFF;
  min-height: 170px;
  position: relative;
  border-radius: 8px;
  border: 1px solid #C1CEE9;
  padding: 16px;
  gap: 32px;
  
  .changes-requested {
    font-weight: 700;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.02em;
    padding: 6px 16px;
    background: rgba(236, 161, 6, 0.4);
    border-radius: 27px;
    color: #020203
  }

  h3 {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 24px;
    line-height: 36px;
    color: #020203;
  }

  .lower-div {
    display: flex;
    flex-direction: row;
    position: absolute;
    bottom: 10px;
    width: 95%;
    height: 62px;
    align-items: center;
  }

  .button-div {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .info-div {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    p {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      color: #000000;
      line-height: 18px;
      letter-spacing: 0.02em;
    }
  }

  button {
    height: fit-content;
    padding: 10px 30px;
    gap: 10px;
    background: #4A47A3;
    border-color: #4A47A3;
    border-radius: 70px;
  }
`
export const LinkStyle = styled.span`
color: rgb(46, 134, 222);
font-family: 'Quicksand Bold';
cursor: pointer;
`

export const NameLogoDiv =styled.div`
display:flex;
align-items:center;
padding-left:16px;
`

export const HelpLink =styled.a`
background-color:  ${(props) => props.theme.palette.primary} !important;
border-color:  ${(props) => props.theme.palette.primary} !important;
color: white;
`

export const CenteredDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ApplicationLinkWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  span {
    white-space: nowrap;
  }
  svg {
    font-size: 1em;
  }
`