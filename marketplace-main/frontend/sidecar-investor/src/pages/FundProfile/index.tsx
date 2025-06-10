import React, {FunctionComponent, useEffect} from 'react';
import FundProfileHeader from "./components/Header";
import HelpBlocks from "../../components/HelpBlocks";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import LoggedInFooter from "../../components/Footer";
import FundInformation from "./components/FundInformation";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useParams} from "react-router-dom";
import {fetchFundProfile} from "./thunks";
import {selectFundProfile} from "./selectors";
import RequestAllocation from "./components/RequestAllocation";
import Documents from "./components/Documents";
import IndicateInterest from "./components/InidicateInterest";
import styled from "styled-components";


const IndicateInterestCol = styled(Col)`
  padding: 5px 60px;
  margin-bottom: 40px;
`


interface FundProfileProps {
}


const FundProfile: FunctionComponent<FundProfileProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();

  const dispatch = useAppDispatch()
  const fund = useAppSelector(selectFundProfile);

  useEffect(() => {
    dispatch(fetchFundProfile(externalId))
  }, [])

  if (!fund || !fund.fund_profile) return <></>

  return <div>
    <FundProfileHeader fund={fund}/>
    <Row>
      <Col md={6}>
        <FundInformation fund={fund}/>
      </Col>
      <Col md={6}>
        <RequestAllocation fund={fund}/>
      </Col>
    </Row>
    <Row>
      <Col md={6}>
        <Documents fund={fund}/>
      </Col>
    </Row>
    <Row>
      <IndicateInterestCol md={12}>
        <IndicateInterest fund={fund}/>
      </IndicateInterestCol>
    </Row>
    <HelpBlocks/>
    {/*TODO: Add back contact email*/}
    {/*<ContactInfo email={companyProfile.contact_email} whiteBg={false}/>*/}
    <LoggedInFooter/>
  </div>
};

export default FundProfile;
