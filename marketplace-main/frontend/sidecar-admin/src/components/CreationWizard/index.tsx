import React, {FunctionComponent} from 'react';


import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {Nav, Tab, Tabs} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {CreationWizardContainer, StyledLink} from "./styles";
import LogicalFlow from './LogicalFlow';


interface CreationWizardProps {
  heading: string | React.ReactNode;
  previewButtonText?: string;
  previewButtonLink?: string;
  submitForReviewModal?: React.ReactNode;
  addButton?: React.ReactNode;
  leftPane: React.ReactNode;
  middlePane?: React.ReactNode;
  rightPane?: React.ReactNode;
  settingsTabContent?: React.ReactNode;
  is_publishable?: boolean;
  publishButton?: any;
  isSmartDecisionFlow?: boolean;

}


const CreationWizard: FunctionComponent<CreationWizardProps> = ({
                                                                  heading,
                                                                  previewButtonText,
                                                                  previewButtonLink,
                                                                  submitForReviewModal,
                                                                  leftPane,
                                                                  middlePane,
                                                                  rightPane,
                                                                  addButton,
                                                                  publishButton,
                                                                  settingsTabContent,
                                                                  is_publishable,
                                                                  isSmartDecisionFlow

                                                                }) => {

  return <CreationWizardContainer fluid className="p-0">
    <div className="page-header">
      {/*<Breadcrumb>*/}
      {/*  <Breadcrumb.Item>Home</Breadcrumb.Item>*/}
      {/*  <Breadcrumb.Item active>Eligibility criteria</Breadcrumb.Item>*/}
      {/*</Breadcrumb>*/}
      <h2 className="page-title mt-2">
        {heading}
      </h2>
      <div className="tabs-cta-section">
        {previewButtonLink && previewButtonText && <StyledLink
          to={previewButtonLink}>
          <Button
            variant="outline-primary"
          >
            {previewButtonText}
          </Button>
        </StyledLink>}
        {submitForReviewModal}
      </div>
    </div>

    <Tabs defaultActiveKey="createForm" id="uncontrolled-tab-example">
      <Tab eventKey="createForm" title="Create form" className="create-form-tab">
        <Tab.Container id="left-tabs" defaultActiveKey="firstTab">
          <Row>
            <Col sm={3}>
              <div className="col-head">
                <h4>
                  Blocks
                  {addButton && addButton}
                </h4>
              </div>
              <Nav variant="pills" className="flex-column">
                {leftPane}
              </Nav>
            </Col>
            {middlePane && <Col sm={rightPane ? 6 : 9}>
              {middlePane}
            </Col>}
            {rightPane && <Col sm={3}>
              {rightPane}
            </Col>}
          </Row>
        </Tab.Container>
      </Tab>
      {
        isSmartDecisionFlow && <Tab eventKey="logicalForm" title="Logical form" className="create-form-tab">
      <Tab.Container id="left-tabs" defaultActiveKey="secondTab">
        <LogicalFlow />
      </Tab.Container>
      </Tab>
      }
      {settingsTabContent && <Tab eventKey="settings" title="Settings" className="create-form-tab">
        {settingsTabContent}
      </Tab>}
    </Tabs>
  </CreationWizardContainer>

};

CreationWizard.defaultProps = {
  isSmartDecisionFlow: false
}

export default CreationWizard;
