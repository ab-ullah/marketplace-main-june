import React, {FunctionComponent} from 'react';
import bannerImage from '../../../../assets/images/opportunities/banner.png';
import laSalleLogo from '../../../../assets/images/opportunities/lasalle-logo-white.png';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import {ICompany} from "../../../../interfaces/company";

const BannerCol = styled(Col)`
  background-image: url(${bannerImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;

  &:after {
    background: linear-gradient(98.81deg, rgba(11, 11, 11, 0.69) 0%, rgba(0, 0, 0, 0.32) 99.39%);
    content: ' ';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
`

const FullWidthDiv = styled.div`
  width: 100%;
  text-align: center;
  z-index: 10;
`

const ProgramNameDiv = styled(FullWidthDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 60px;
  text-align: center;
  color: #FFFFFF;
  margin-top: 80px;
`

const MissionStatementDiv = styled(FullWidthDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  text-align: center;
  color: #FFFFFF;
  margin-top: 24px;
`


interface OpportunitiesHeaderProps {
  company: ICompany
}


const OpportunitiesHeader: FunctionComponent<OpportunitiesHeaderProps> = ({company}) => {
  const companyProfile = company.company_profile;

  return <Row>
    <BannerCol md={12}>
      <FullWidthDiv><img src={company?.logo} width={200} alt="company_logo" /></FullWidthDiv>
      <ProgramNameDiv>{companyProfile?.program_name}</ProgramNameDiv>
      <MissionStatementDiv>{companyProfile?.mission_statement}</MissionStatementDiv>
    </BannerCol>
  </Row>
};

export default OpportunitiesHeader;
