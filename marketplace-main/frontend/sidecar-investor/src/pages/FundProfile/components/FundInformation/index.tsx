import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";
import FundInfoTable from "../InfoTable";


const FundInformationParent = styled.div`
  padding: 40px 60px;
`

const MainHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 32px;
  line-height: 38px;
  color: #020203;
  margin-top: 60px;
  margin-bottom: 32px;
`

const SubHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin-bottom: 24px;
`

interface FundProfileHeaderProps {
  fund: IFundWithProfile
}


const FIELD_MAPPINGS = [
  {label: 'Investment Region', path: 'fund_profile.investment_region'},
  {label: 'Structure', path: 'fund_type'},
  {label: 'Risk Profile', path: 'fund_profile.risk_profile'},
  {label: 'Target Size', path: 'fund_profile.target_size'},
  {label: 'Target Investment Markets', path: 'fund_profile.target_investment_markets'},
  {label: 'Target Return', path: 'fund_profile.target_return'},
  {label: 'Employee Investment Period', path: 'fund_profile.employee_investment_period'},
]


const FundInformation: FunctionComponent<FundProfileHeaderProps> = ({fund}) => {

  return <FundInformationParent>
    <Row>
      <MainHeading md={12}>Fund Information</MainHeading>
    </Row>
    <Row>
      <SubHeading md={12}>Fund Facts</SubHeading>
    </Row>
    <Row>
      <Col md={12}>
        <FundInfoTable fund={fund} mappings={FIELD_MAPPINGS}/>
      </Col>
    </Row>
  </FundInformationParent>
};

export default FundInformation;
