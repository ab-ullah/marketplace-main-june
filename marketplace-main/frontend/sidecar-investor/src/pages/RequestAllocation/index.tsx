import React, {FunctionComponent, useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchFund} from "./thunks";
import {selectFund} from "./selectors";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {setFund} from "./requestAllocationSlice";
import {Heading} from "../../presentational/Heading";
import {TopBanner} from "../../presentational/TopBanner";
import {StatBlock, StatBlockContainer} from "../../presentational/StatBlock";
import RequestDetail from "./components/RequestDetail";

import InvestorProfileSelector from "../../components/InvestorProfileSelector";
import {OptionTypeBase} from "react-select";
import {fetchInvestorProfiles} from "../FundInvestorDetail/thunks";
import {selectInvestorProfileOptions} from "../FundInvestorDetail/selectors";


interface RequestAllocationPageProps {
}


const RequestAllocationPage: FunctionComponent<RequestAllocationPageProps> = () => {
  const [investorProfile, setInvestorProfile] = useState<OptionTypeBase | null>(null);
  const {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch();
  const fund = useAppSelector(selectFund);
  const investorProfileOptions = useAppSelector(selectInvestorProfileOptions);

  useEffect(() => {
    if (!investorProfile && investorProfileOptions.length) {
      setInvestorProfile(investorProfileOptions[0])
    }
  }, [investorProfileOptions])

  useEffect(() => {
    dispatch(fetchFund(externalId));
    dispatch(fetchInvestorProfiles());
    return () => {
      dispatch(setFund(null));
    }
  }, [])

  if (!fund) return <></>
  if (!investorProfile) return <></>
  const requestedAllocation = fund.requested_allocations?.find(request => request.investor === investorProfile?.value)

  return <Container fluid className={'mt-4'}>
    <Row>
      <TopBanner md={12}>
        <Row>
          <Col md={12}>
            <Heading>Request an Allocation</Heading>
          </Col>
        </Row>
        <Row className={'mt-3'}>
          <Col md={4}>
            <StatBlock heading={'Investment Opportunity'} value={`${fund.name}(${fund.symbol})`}/>
          </Col>
          <Col md={4}>
            <StatBlock heading={'Region/Country'} value={fund.business_line_name}/>
          </Col>
          <Col md={4}>
            <StatBlock heading={'Type'} value={fund.fund_type_name}/>
          </Col>
        </Row>
        <Row className={'mt-3'}>
          <Col md={4}>
            <StatBlock heading={'Risk Profile'} value={`${fund.risk_profile}`}/>
          </Col>
          <Col md={4}>
            <StatBlock
              heading={'Application Period'}
              value={`${fund.application_period_start_date} - ${fund.application_period_end_date}`}
            />
          </Col>
          <Col md={4}>
            <StatBlock heading={'Confirmation Date'} value={fund.confirmation_date}/>
          </Col>
        </Row>
      </TopBanner>
    </Row>
    <Row>
      <Col md={{span: 4, offset: 4}}>
        <StatBlockContainer>
          <InvestorProfileSelector
            options={investorProfileOptions}
            value={investorProfile}
            onChange={setInvestorProfile}
            greyBg={true}
          />
        </StatBlockContainer>
      </Col>
    </Row>
    <Row className={'mt-5'}>
      <Col md={12}>
        <RequestDetail key={`allocation-${investorProfile.value}`} fund={fund} investorId={investorProfile.value}
                       requestedAllocation={requestedAllocation}/>
      </Col>
    </Row>
  </Container>
};

export default RequestAllocationPage;
