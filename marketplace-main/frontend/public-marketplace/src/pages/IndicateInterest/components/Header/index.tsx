import React, {FunctionComponent} from 'react';
import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import { useGetCompanyInfoQuery } from "../../../../api/rtkQuery/commonApi";
import {Link} from "react-router-dom";


const HeaderCol = styled(Col)`
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px 56px;
  background: #ECEFF1;

`

const BaseDiv = styled.div`
  width: 70%;
  text-align: left;
`

const ThanksDiv = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 60px;
  color: #020203;
  margin-top: 40px;
`

const InvestmentOpenDiv = styled(BaseDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin-top: 28px;
`

const DescriptionDiv = styled(BaseDiv)`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #020203;
  margin-top: 20px;
`

const GoToHomeButton = styled(Link)`
  background: #470C75;
  border-radius: 70px;
  padding: 16px 40px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  color: #FFFFFF;
  text-decoration: none;
  width: fit-content;
  margin-top: 40px;
  margin-bottom: 100px;
  
  :hover {
    color: #FFFFFF;
  }
`

interface FundProfileHeaderProps {
  fund: IFundWithProfile
}


const FundProfileHeader: FunctionComponent<FundProfileHeaderProps> = ({fund}) => {
  const { data: companyInfo } = useGetCompanyInfoQuery(fund.external_id, { skip: !fund.external_id });
  const crumbs = [
    {name: 'Opportunities', href: `/${INVESTOR_URL_PREFIX}/opportunities`, active: false},
    {name: fund.name, href: `/${INVESTOR_URL_PREFIX}/funds/${fund.external_id}/profile`, active: false},
    {name: 'Indicate Interest', href: null, active: true},
  ]

  return <Row>
    <HeaderCol md={12}>
      <BaseDiv>{companyInfo?.company_logo && (<img src={companyInfo.company_logo} width={200} alt="laSalle" />)}</BaseDiv>
      {!fund.indicated_interest && <>
        <ThanksDiv>Thanks for expressing interest in {fund.name}</ThanksDiv>
        <InvestmentOpenDiv>This fund will open for investment in December 2021.</InvestmentOpenDiv>
        <DescriptionDiv>
        Please enter your requested equity investment amount and select a leverage option to indicate your total requested gross investment. The requested amount can be updated up until the Application Period is closed. After the Application Period is closed, requested amounts and leverage can only be decreased prior to signing the subscription documents.
        </DescriptionDiv>
      </>}
      {fund.indicated_interest && <>
        <ThanksDiv>Thank you for your interest</ThanksDiv>
        <InvestmentOpenDiv>We'll be in touch soon with next steps</InvestmentOpenDiv>
        {/* <GoToHomeButton to={`/${INVESTOR_URL_PREFIX}/ownership`}>Go to my account</GoToHomeButton> */}
      </>}
    </HeaderCol>
  </Row>
};

export default FundProfileHeader;
