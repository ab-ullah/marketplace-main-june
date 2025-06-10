import React, {FunctionComponent} from 'react';
import bannerImage from '../../../../assets/images/fund-profile/banner.png';
import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import { useGetCompanyInfoQuery } from "../../../../api/rtkQuery/commonApi";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";
import IndicateInterest from "../InidicateInterest";
import HeaderBreadCrumbs from "../../../../components/BreadCrumbs";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import { useCompanyPrefix } from '../../../../utils/hooks';

const BannerCol = styled(Col)`
  background-image: url(${bannerImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px 56px;

  &:after {
    background: linear-gradient(100.86deg, #ECEFF1 58.19%, rgba(236, 239, 241, 0.47) 99.37%);
    content: ' ';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
`

const BaseDiv = styled.div`
  width: 70%;
  text-align: left;
  z-index: 10;
`

const FundNameDiv = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 60px;
  color: #020203;
  margin-top: 40px;
  z-index: 10;
`

const IntroDiv = styled(BaseDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin-top: 28px;
`

const DescriptionDiv = styled(BaseDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 24px;
  color: #020203;
  margin-top: 24px;
`

const WhiteBgBadge = styled(Badge)`
  background: #FFFFFF !important;
  position: relative;
  z-index: 10;
  border-radius: 10px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 12px;
  color: #020203;
  width: fit-content;
  margin-right: 10px;
`

const BadgeParentDiv = styled.div`
  margin-top: 30px;
`


interface FundProfileHeaderProps {
  fund: IFundWithProfile
}


const FundProfileHeader: FunctionComponent<FundProfileHeaderProps> = ({fund}) => {
  const {companyPrefix} =useCompanyPrefix()
  const { data: companyInfo } = useGetCompanyInfoQuery(fund.external_id, { skip: !fund.external_id });
  const crumbs = [
    {name: 'Opportunities', href: `${companyPrefix}/${INVESTOR_URL_PREFIX}/opportunities`, active: false},
    {name: fund.name, href: null, active: true},
  ]

  return <Row>
    <BannerCol md={12}>
      <HeaderBreadCrumbs items={crumbs}/>
      <BaseDiv>{companyInfo?.company_logo && (<img src={companyInfo.company_logo} width={200} alt='' />)}</BaseDiv>
      <FundNameDiv>{fund.name}</FundNameDiv>
      <BadgeParentDiv>
        <WhiteBgBadge pill>{fund.symbol}</WhiteBgBadge>
        <WhiteBgBadge pill>Information guide</WhiteBgBadge>
      </BadgeParentDiv>
      <IntroDiv>{fund.fund_profile.intro}</IntroDiv>
      <DescriptionDiv>{fund.fund_profile.description}</DescriptionDiv>
      <IndicateInterest fund={fund}/>
    </BannerCol>
  </Row>
};

export default FundProfileHeader;
