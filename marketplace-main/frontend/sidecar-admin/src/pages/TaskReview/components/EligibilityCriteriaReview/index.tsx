import React, {FunctionComponent, useState} from 'react';
import {StyledLink, StyledTabContainer} from "../../../../presentational/StyledTabLayout";
import {Breadcrumb, Tab, Tabs} from "react-bootstrap";
import {calculateFlowElements} from "../../../EligibilityCriteria/components/CriteriaFlow/calculateFlowElements";
import {FlowContainer} from "../../../EligibilityCriteria/components/CriteriaFlow/styles";
import ReactFlow from "react-flow-renderer";
import Col from "react-bootstrap/Col";
import NotificationModal from '../../../../components/NotificationModal';
import Comments from "../../../../components/Comments";
import Row from "react-bootstrap/Row";
import API from '../../../../api/backendApi';
import EligibilityCriteriaPreviewPage from "../../../EligibilityCriteriaPreview";
import {ADMIN_URL_PREFIX} from "../../../../constants/routes";
import {StyledBreadCrumb} from "../../../../presentational/StyledBreadCrumb";
import RequestRevisionButton from "../../../../components/ReviewActionButtons/RequestRevisionsButton";
import ApproveButton from "../../../../components/ReviewActionButtons/ApproveButton";
import {ITaskDetail} from "../../../../interfaces/Workflow/task";
import {PENDING} from "../../../../constants/taskStatus";
import EligibilityCriteriaHeading from "../../../../components/EligibilityCriteriaHeading";
import { get } from 'lodash';
import { getNodes } from '../../../../components/CreationWizard/LogicalFlow/utils';
import { CommentsContainer } from '../../styles';

interface EligibilityCriteriaReviewProps {
  taskDetail: ITaskDetail
}

const notificationConfig = {
  default: {
    show: false,
    title: "",
    msg: ""
  },
  approve: {
    show: true,
    title: "Form Approved",
    msg: "Congratulations! The form has been successfully approved."
  },
  request: {
    show: true,
    title: "Revision Requested",
    msg: `Your comments have been sent to the admin to make requested changes. You will receive a notification when it's
     ready for review again.`
  },
  commentRequired: {
    show: true,
    title: "Comment Required",
    msg: `Please leave a comment before requesting revisions.`
  },
}


const EligibilityCriteriaReview: FunctionComponent<EligibilityCriteriaReviewProps> = ({
                                                                                        taskDetail,

                                                                                      }) => {
  console.log("task deetails ====>>>> ", taskDetail)                                                                                    
  const [notification, setNotification] = useState(notificationConfig.default);
  const [commentAdded, setCommentAdded] = useState(false);
  const eligibilityCriteriaDetail = taskDetail.eligibility_criteria;
  const taskId = taskDetail.id;
  const workFlowId = taskDetail.workflow;
  if (!eligibilityCriteriaDetail) return <></>
  const isSmartCriteria = get(eligibilityCriteriaDetail, 'is_smart_criteria')
  const smart_canvas_payload = get(eligibilityCriteriaDetail, 'smart_canvas_payload')
  let nodes: any[] = []
  let edges: any[] = []
  if(isSmartCriteria){
    nodes = getNodes(smart_canvas_payload.nodes)
    edges = smart_canvas_payload.edges
  }else{
    const criteriaElements = calculateFlowElements(eligibilityCriteriaDetail)
    nodes = criteriaElements.nodes
    edges = criteriaElements.edges
  }

  const onApproveTask = () => {
    API.saveTemplates(eligibilityCriteriaDetail.id);
  }

  return <StyledTabContainer fluid>
    <div className="page-header">
      <StyledBreadCrumb>
        <Breadcrumb.Item><StyledLink to={`/${ADMIN_URL_PREFIX}/tasks`}>My Tasks</StyledLink></Breadcrumb.Item>
        <Breadcrumb.Item active>Recent</Breadcrumb.Item>
      </StyledBreadCrumb>
      <h2 className="page-title mt-2">
        <EligibilityCriteriaHeading criteriaDetail={eligibilityCriteriaDetail}/>
      </h2>
    </div>
    <Row>
      <Col sm="12">
        <div className="tabs-cta-wrapper">
          {taskDetail.status === PENDING && <div className="tabs-cta-section">
            <span>Leave a comment before requesting revisions</span>
            <RequestRevisionButton
              taskId={taskId}
              allowSubmitRevision={commentAdded}
              showSubmitNotification={() => setNotification(notificationConfig.request)}
              showCommentRequiredNotification={() => setNotification(notificationConfig.commentRequired)}
            />
            <ApproveButton 
            taskId={taskId}
            onTaskApproved={onApproveTask}
            showNotification={() => setNotification(notificationConfig.approve)}/>
          </div>}
        </div>
      </Col>
      <Col md={9}>
        <Tabs defaultActiveKey="logic" id="eligibility-review-tab">
          <Tab eventKey="logic" title="Logic View" className="create-form-tab">
            <FlowContainer isSmartCriteria={isSmartCriteria}>
              <ReactFlow nodes={nodes} edges={edges} panOnScroll={true} />
            </FlowContainer>
          </Tab>
          <Tab eventKey="preview" title="Preview" className="create-form-tab">
            <EligibilityCriteriaPreviewPage
              criteriaIdProp={eligibilityCriteriaDetail.id.toString()}
              reviewMode={true}
            />
          </Tab>
        </Tabs>
      </Col>
      <CommentsContainer md={3}>
          <Comments wrapperClass="white-bg" workFlowId={workFlowId} callbackCreateComment={() => setCommentAdded(true)} approver={taskDetail.approver} approvalDate={taskDetail.approval_date}/>
      </CommentsContainer>
    </Row>
    <NotificationModal
      title={notification?.title}
      showModal={notification?.show}
      handleClose={() => setNotification(notificationConfig.default)}
    >
      {notification?.msg}
    </NotificationModal>
  </StyledTabContainer>
};

export default EligibilityCriteriaReview;
