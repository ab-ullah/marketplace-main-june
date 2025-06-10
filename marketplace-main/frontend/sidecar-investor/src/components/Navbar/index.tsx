import React, {FunctionComponent, useEffect, useState} from 'react';
import Navbar from "react-bootstrap/Navbar";
import styled, { useTheme } from "styled-components";
import Container from "react-bootstrap/Container";
import logo from '../../assets/images/navable-logo.png';
import UserDropDown from "./UserDropDown";
import {INVESTOR_URL_PREFIX} from "../../constants/routes";
import CompanyUserSelector from "../CompanyUserSelector";
import {OptionTypeBase} from "react-select";
import {useAppSelector} from "../../app/hooks";
import {selectUserInfo} from "../../pages/User/selectors";
import useScreenWidth from "../../hooks/useScreenWidth";
import UnpublishedToggle from "../ViewAsPublishedToggle";
import {CustomLink, CustomNavItem, NavWrapper} from "./styles";
import {useLocation} from "react-router-dom";
import {CARRY_MANAGEMENT, TOTAL_COMPENSATION_PATH, NOTICES_PATH, OWNERSHIP_PATH} from "./constants";
import { getHomepageUrl } from '../../utils/routes';
import FeatureFlagsManager from "../../utils/FeatureFlagsManager";
import {
  ADVISOR_FLOW,
  AGGREGATOR,
  CARRY_PARTICIPANT_DASHBOARD,
  COINVEST,
  INVESTOR_PORTFOLIO_PAGE,
  TOTAL_COMPENSATION
} from "../../constants/featureFlags";
import AdvisorUserSelector from '../AdvisorUserSelector';


const StyledNavBar = styled(Navbar)`
  padding: ${props => `${props.theme.baseLine * 0.8}px ${props.theme.baseLine * 2}px`};

  .container-fluid {
    padding: 0;

    .navbar-text {
      padding: 0;
    }
  }

  @media screen and (max-width: 1199px) {
    padding-left: 20px;
    padding-right: 20px;
  }
  @media screen and (max-width: 655px) {
    padding: 0 20px;
    min-height: 64px;
    .container-fluid {
      //.navbar-text {
      //  display: none;
      //}
      .navbar-brand {
        img {
          max-width: 147px;
          height: 23px;
        }
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

interface NavBarProps {
  onViewAsChange: any;
  viewAs: OptionTypeBase | null | undefined;
  showUnPublished: boolean;
  setShowUnPublished: (args0: boolean) => void;
  onViewAsAdvisorChange: any
  viewAsAdvisor:OptionTypeBase | null | undefined;
}

const NavBar: FunctionComponent<NavBarProps> = ({viewAs, onViewAsChange, showUnPublished, setShowUnPublished, onViewAsAdvisorChange,viewAsAdvisor }) => {
  const location = useLocation();
  const path = location.pathname
  const userInfo = useAppSelector(selectUserInfo);
  const {isSmall} = useScreenWidth();
  const companyName = location.pathname.split('/')[1]
  const companyPrefix = companyName && (companyName=== INVESTOR_URL_PREFIX ? "" : `/${companyName}`)
  const theme = useTheme()
  const companyLogo = theme.logo
  // TODO: this has to be solved through hooks
  const featureFlagManager = new FeatureFlagsManager()
  const [isCarryEnabled, setIsCarryEnabled] = useState<boolean>(false)
  const [isNoticesEnabled, setIsNoticesEnabled] = useState<boolean>(false)
  const [isCoinvestEnabled, setIsCoinvestEnabled] = useState<boolean>(false)
  const [isTotalCompEnabled, setIsTotalCompEnabled] = useState<boolean>(false)
  const [isAdvisorFlowEnabled, setIsAdvisorFlowEnabled] = useState<boolean>(false)
  const [isInvestorPortfolioEnabled, setIsInvestorPortfolioEnabled] = useState<boolean>(false)

  const handleFetchFeatureFlag = async () => {
    const res = await featureFlagManager.isFeatureEnabled(CARRY_PARTICIPANT_DASHBOARD)
    setIsCarryEnabled(res)
    const resCoinvest = await featureFlagManager.isFeatureEnabled(COINVEST)
    setIsCoinvestEnabled(resCoinvest)
    const resInvestorPortfolio = await featureFlagManager.isFeatureEnabled(INVESTOR_PORTFOLIO_PAGE)
    setIsInvestorPortfolioEnabled(resInvestorPortfolio)
    const resNotices = await featureFlagManager.isFeatureEnabled(AGGREGATOR)
    setIsNoticesEnabled(resNotices)
    const resTotalComb = await featureFlagManager.isFeatureEnabled(TOTAL_COMPENSATION)
    setIsTotalCompEnabled(resTotalComb)

    const resAdvisorFlow = await featureFlagManager.isFeatureEnabled(ADVISOR_FLOW)
    setIsAdvisorFlowEnabled(resAdvisorFlow)
  };

  const getHomeCustomLinkProps =(homeUrl: string)=>{
    const generatedUrl = new URL(homeUrl)
    if(generatedUrl.origin === window.location.origin){
      return {to: generatedUrl.pathname}
    }
    else return {to:'#', onClick: ()=>window.open(homeUrl,"_self")}
  }

  useEffect(() => {
    handleFetchFeatureFlag()
  }, [])

  return <StyledNavBar>
    <Container fluid>
      <Navbar.Brand href={getHomepageUrl(companyPrefix)}>
        <img src={companyLogo || logo} className="App-logo" alt="logo"/>
      </Navbar.Brand>
      <NavWrapper>
        {userInfo && <CustomNavItem className={`center-nav`}>
          <CustomLink isActiveLink={path === getHomepageUrl(companyPrefix)}  {...getHomeCustomLinkProps(getHomepageUrl(companyPrefix))}
           >Home</CustomLink>
        </CustomNavItem>}
        {userInfo && isInvestorPortfolioEnabled && <CustomNavItem isActiveLink={path === `${companyPrefix}${OWNERSHIP_PATH}`} className={`center-nav`}>
          <CustomLink isActiveLink={path === `${companyPrefix}${OWNERSHIP_PATH}`}  to={`${companyPrefix}${OWNERSHIP_PATH}`}>My Portfolio</CustomLink>
        </CustomNavItem>}
        {isNoticesEnabled && <CustomNavItem isActiveLink={path === `${companyPrefix}${NOTICES_PATH}`} className={`center-nav`}>
          <CustomLink isActiveLink={path === `${companyPrefix}${NOTICES_PATH}`}  to={`${companyPrefix}${NOTICES_PATH}`}>Investment Summary</CustomLink>
        </CustomNavItem>}
        {userInfo && isCarryEnabled && <CustomNavItem isActiveLink={path === `${companyPrefix}${CARRY_MANAGEMENT}`} className={`center-nav`}>
          <CustomLink isActiveLink={path === `${companyPrefix}${CARRY_MANAGEMENT}`} to={`${companyPrefix}${CARRY_MANAGEMENT}`}>Carry</CustomLink>
        </CustomNavItem>}
        {userInfo && isTotalCompEnabled && <CustomNavItem className={`center-nav`}>
          <CustomLink isActiveLink={path === `${companyPrefix}${TOTAL_COMPENSATION_PATH}`} to={`${companyPrefix}${TOTAL_COMPENSATION_PATH}`}>Total Compensation</CustomLink>
        </CustomNavItem>}
       
        {!isAdvisorFlowEnabled ? 
        (userInfo && userInfo.is_sidecar_admin && !isSmall && <Navbar.Text>
          <CompanyUserSelector
            onChange={onViewAsChange}
            value={viewAs}
          />
        </Navbar.Text>):
        (userInfo?.is_advisor &&
        <Navbar.Text>
          <AdvisorUserSelector onChange={onViewAsAdvisorChange} value={viewAsAdvisor}/>
        </Navbar.Text>)}
      </NavWrapper>

      {userInfo && userInfo.is_sidecar_admin && !isSmall && viewAs && <Navbar.Text>
        <UnpublishedToggle showUnpublished={showUnPublished} onChange={setShowUnPublished}/>
      </Navbar.Text>}
      {userInfo && <UserDropDown hideNotifications={!isInvestorPortfolioEnabled}/>}
    </Container>
  </StyledNavBar>
};

export default NavBar;
