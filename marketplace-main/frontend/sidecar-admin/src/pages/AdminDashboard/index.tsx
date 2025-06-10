import React, {FunctionComponent, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {getAdminStats} from "./thunks";
import {selectAdminStat} from "./selectors";
import Row from "react-bootstrap/Row";
import {ButtonRow, StyledContainer} from "./styles";
import CreateFund from "../Funds/components/CreateFund";
import Col from "react-bootstrap/Col";
import ActiveFundTable from "./components/ActiveFundsTable";
import RoleInvestmentPieChart from "./components/InvestmentByRole";
import styled from "styled-components";
import FundRaisingTable from "./components/FundraisingTable";
import {Heading} from "../../presentational/Heading";
import {TopBanner} from "../../presentational/TopBanner";
import {SubHeading} from "../../presentational/SubHeading";
import {roleColors} from "./roleColors";
import FundTasksTable from "./components/FundTasksTable";


const GraphContainerCol = styled(Col)`
  height: 300px;
  width: 100%;
  background: #E6E6F1;
  border-radius: 3px;
  margin-left: 20px;
  margin-right: 20px;
`

const RelativeRow = styled(Row)`
  position: relative;
`

const ColorsDiv = styled.div`
  position: absolute;
  top: 25%;
  left: 70%;
`


const ColorCircle = styled.div<{ bgColor: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  background: ${props => props.bgColor};
  border-radius: 50%;
  margin-right: 10px;
`


interface AdminDashboardProps {
}


const AdminDashboard: FunctionComponent<AdminDashboardProps> = () => {
  const dispatch = useAppDispatch();
  const adminStats = useAppSelector(selectAdminStat);
  console.log({adminStats});
  useEffect(() => {
    dispatch(getAdminStats())
  }, [])

  if (!adminStats) return <></>


  return <StyledContainer fluid>
    <Row>
      <TopBanner md={12}>
        <Row>
          <Col md={12}>
            <Heading>Admin Console</Heading>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <SubHeading>Dashboard</SubHeading>
          </Col>
        </Row>
        <ButtonRow className={'mb-3'}>
          <div className={'button-div'}>
            <CreateFund/>
          </div>
        </ButtonRow>
      </TopBanner>
    </Row>
    <Row>
      <Col md={12}>
        <Heading>Active Funds</Heading>
      </Col>
    </Row>
    <Row>
      <ActiveFundTable activeFunds={adminStats.active_funds} lastRow={adminStats.total_row}/>
    </Row>
    <Row className={'mt-3 ml-3 mb-3'}>
      <Col md={12}>
        <Row>
          <Col md={12}>
            <Heading>Investment By Employee Level</Heading>
          </Col>
        </Row>
        <RelativeRow>
          <GraphContainerCol md={12}>
            <RoleInvestmentPieChart/>
          </GraphContainerCol>
          <ColorsDiv>
            <div><ColorCircle bgColor={roleColors.E1}></ColorCircle>Level E1</div>
            <div><ColorCircle bgColor={roleColors.E2}></ColorCircle>Level E2</div>
            <div><ColorCircle bgColor={roleColors.E3}></ColorCircle>Level E3</div>
          </ColorsDiv>

        </RelativeRow>
      </Col>
    </Row>
    <Row>
      <Col md={12}>
        <Heading>Fundraising in Progress</Heading>
      </Col>
    </Row>
    <Row>
      <Col md={12}>
        <FundRaisingTable fundRaising={adminStats.fund_raising}/>
      </Col>
    </Row>
    <Row>
      <Col md={12}>
        <Heading>Tasks</Heading>
      </Col>
    </Row>
    <Row>
      <Col md={12}>
        <FundTasksTable fundTasks={adminStats.fund_tasks}/>
      </Col>
    </Row>

  </StyledContainer>
};

export default AdminDashboard;
