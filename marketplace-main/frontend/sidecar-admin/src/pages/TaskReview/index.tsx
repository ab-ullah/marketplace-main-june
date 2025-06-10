import React, {FunctionComponent, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {selectTaskReviewDetail} from "./selectors";
import {fetchTaskDetail} from "./thunks";
import Footer from "../../components/Footer";
import {useHistory, useParams} from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {InvalidApplicationContainer, ReviewContainer} from "./styles";
import EligibilityCriteriaReview from "./components/EligibilityCriteriaReview";
import {PENDING} from "../../constants/taskStatus";
import ReviewRequestedModal from "../../components/ReviewActionButtons/ReviewRequestedModal";
import {APPLICATION_ALLOCATION, APPLICATION_DOCUMENTS_SIGNING, REVIEW, USER_RESPONSE} from "../../constants/workflowTypes";
import {resetToDefault} from "./taskReviewSlice";
import ApplicationInfo from "../KnowYourCustomer/ApplicationInfo";
import FundDetail from '../FundDetail';
import {ALLOCATION, CARRY_PLAN} from "../../constants/workflowModules";
import { includes } from 'lodash';
import NavableLoader from '../../components/NavableLoader';
import CarryPlanReview from './components/CarryPlanReview';

interface TasksPageProps {
}


const TaskReview: FunctionComponent<TasksPageProps> = () => {
  const {taskId} = useParams<{ taskId: string }>();
  const taskDetail = useAppSelector(selectTaskReviewDetail)
  const dispatch = useAppDispatch()
  const history=useHistory()

  useEffect(() => {
    dispatch(fetchTaskDetail(taskId))
    return () => {
      dispatch(resetToDefault())
    }
  }, [])

  if (!taskDetail) return <></>

  if(taskDetail.workflow_type === REVIEW && taskDetail.module === CARRY_PLAN && taskDetail.carry_plan_id){
   return <CarryPlanReview task={taskDetail}/>
  }

  if (
    taskDetail.workflow_type === APPLICATION_ALLOCATION &&
    taskDetail.module === ALLOCATION
  )
    return <FundDetail task={taskDetail}/>;


  if (!taskDetail.application_id && taskDetail.workflow_type === USER_RESPONSE) {
    return <InvalidApplicationContainer>
      <div className={'mt-5'}>
        <h4 className={'mt-5'}>This task has been completed, or is no longer required.</h4>
      </div>
    </InvalidApplicationContainer>
  }

  if (includes([USER_RESPONSE, APPLICATION_DOCUMENTS_SIGNING], taskDetail.workflow_type) && taskDetail.application_id)
    return (
      <ApplicationInfo
        externalId={taskDetail.fund_external_id}
        userApplicationId={taskDetail.application_id.toString()}
        taskDetail={taskDetail}
      />
    );

    if (taskDetail?.name === "Capital-Call-review-task") {
      setTimeout(() => {
        const capitalCallId=taskDetail?.capital_call_id
        const capitalCallIdParam=capitalCallId ? `&capitalCallId=${capitalCallId}`:''
        history.push(
          `/admin/funds/${taskDetail?.fund_external_id}?view=setup&tab=capitalCalls${capitalCallIdParam}`
        );
      }, 1000);

      return (
        <div style={{height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <NavableLoader />
          <p style={{ textAlign: "center" }}>
            Redirecting to Capital Call Page
          </p>
        </div>
      );
    }

    if (taskDetail?.name === "Distribution-Notice-review-task") {
      setTimeout(() => {
        const distributionNoticeId=taskDetail?.distribution_notice_id
        const capitalCallIdParam=distributionNoticeId ? `&distributionNoticeId=${distributionNoticeId}`:''
        history.push(
          `/admin/funds/${taskDetail?.fund_external_id}?view=setup&tab=distributionNotices${capitalCallIdParam}`
        );
      }, 1000);

      return (
        <div style={{height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <NavableLoader />
          <p style={{ textAlign: "center" }}>
            Redirecting to Distribution Notices Page
          </p>
        </div>
      );
    }

  return <>
    {taskDetail.status === PENDING && <ReviewRequestedModal/>}
    <ReviewContainer fluid className="white-bg">
      <Row>
        <Col md={12}>
          {taskDetail.eligibility_criteria &&
            <EligibilityCriteriaReview
              taskDetail={taskDetail}
            />}
        </Col>

      </Row>
    </ReviewContainer>
    <Footer/>
  </>
};

export default TaskReview;
