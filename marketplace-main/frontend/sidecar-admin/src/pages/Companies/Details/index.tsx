import {Col, Row, Tab, Tabs} from "react-bootstrap";
import {StyledTabContainer} from "../../../presentational/StyledTabLayout";
import Footer from "../../../components/Footer";
import CompanyInfo from "../../../components/CompanyInfo";
import Documents from "../../../components/CompanyInfo/Documents";
import {Wrapper} from "./styles";
import UsersList from "../../Users/components/UsersList";
import React, {useEffect, useState} from "react";
import {ReportsTable, TableContainer} from "../../../components/CompanyInfo/styles";
import Reports from "../components/Reports";
import {useGetMeAdminUserQuery} from "../../../api/rtkQuery/commonApi";
import AdminDocuments from "../components/AdminDocuments";
import API from "../../../api/backendApi";
import {COMPANY_REPORTS_TAB, NOTICE_AGGREGATOR} from "../../../constants/featureFlags";
import Notices from "../components/Notices";
import FeatureFlags from "../components/FeatureFlags";


const Details = () => {
  const [key, setKey] = useState<string>('program');
  const [isReportsTabEnabled, setIsReportsTabEnabled] = useState<boolean>(false)
  const [isNoticesTabEnabled, setIsNoticesTabEnabled] = useState<boolean>(false)
  const {data: userInfo} = useGetMeAdminUserQuery()

  const handleFetchFeatureFlag = async() => {
    const isEnabled = await API.isFeatureEnabled(COMPANY_REPORTS_TAB)
    setIsReportsTabEnabled(isEnabled)
  }

  const handleFetchNoticesFeatureFlag = async() => {
    const isEnabled = await API.isFeatureEnabled(NOTICE_AGGREGATOR)
    setIsNoticesTabEnabled(isEnabled)
  }

  useEffect( () => {
    handleFetchFeatureFlag()
    handleFetchNoticesFeatureFlag()
  }, [userInfo])

  if (!userInfo) return <></>
  
  const hasFullAccess = userInfo.has_full_access
  const isSidecarAdmin = userInfo.user.is_sidecar_admin

  return (
    <>
      <Wrapper fluid className={'p-0'}>
        <h4>Company</h4>
        <StyledTabContainer fluid className={'p-0'}>
          <Tabs id="my-tasks-tab" activeKey={key} onSelect={(k) => k && setKey(k)}>
            <Tab eventKey="program" title="Program" className="create-form-tab">
              <div className={'content-container'}>
                <div className={'table-container'}>
                  <Row>
                    <Col md={12}>
                      <div className={'task-type-heading'}>Program</div>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="company-info p-0" lg="8" md="8" sm="12">
                      <CompanyInfo/>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Documents/>
                    </Col>
                  </Row>
                </div>
              </div>
            </Tab>
            {hasFullAccess && <Tab eventKey="users" title="User Management" className="create-form-tab">
              <div className={'content-container'}>
                <div className={'table-container'}>
                  <div>
                    <div className={'task-type-heading'}>User Management</div>
                  </div>
                  {key == 'users' && <TableContainer>
                    <UsersList/>
                  </TableContainer>
                  }
                </div>
              </div>
            </Tab>}
            {isReportsTabEnabled && <Tab eventKey="reports" title="Reports" className="create-form-tab">
              <div className={'content-container'}>
                <div>
                  <div className={'task-type-heading'}>Reports By Vehicle</div>
                </div>
                <ReportsTable>
                  <Reports/>
                </ReportsTable>
              </div>
            </Tab>}
            <Tab eventKey="documents" title="Documents" className="create-form-tab">
            <div className={'content-container'}>
              {
                key === "documents" && <AdminDocuments />
              }
            </div>
            </Tab>
            {isNoticesTabEnabled && <Tab eventKey="uploads" title="Data Upload" className="create-form-tab">
            <div className={'content-container'}>
              {
                key === "uploads" && <Notices />
              }
            </div>
            </Tab>}
            {isSidecarAdmin && <Tab title="Feature Flags" eventKey="feature_flags" className="create-form-tab">
              <div className={'content-container'} >
                {
                    key === "feature_flags" && <FeatureFlags />
                }
              </div>
            </Tab>}
          </Tabs>
        </StyledTabContainer>
      </Wrapper>
      <Footer/>
    </>
  )
};

export default Details;
