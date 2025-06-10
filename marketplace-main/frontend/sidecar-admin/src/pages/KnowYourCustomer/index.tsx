import React, {FunctionComponent, useEffect, useState} from "react";
import find from "lodash/find";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {selectKYCState, selectTaxRecords} from "./selectors";
import Record from "./components/Record";
import {
  BigTitle,
  ButtonRow,
  Container,
  EditButton,
  Inner,
  Header,
  HeaderPath,
  HeaderRow,
  RiskValueCol,
  Tab,
  TabRow,
  QuestionContainer,
  QuestionInner,
  CardContainer,
  CardTitle,
  SchemaContainer,
  CommentBadge,
  CommentsContainer, InternalCardContainer,
} from "./styles";
import {
  fetchFund,
  fetchKYCRecords,
  fetchWorkflows,
  fetchTaxFormsAdmin,
  fetchTaxDetailsAdmin,
} from "./thunks";
import {fetchFundDetail} from '../FundDetail/thunks';
import {TABS} from "../FundSetup/constants";
import TaxFormDocument from "./components/TaxFormDocument";
import Comments from "../../components/Comments";
import Row from "react-bootstrap/Row";
import API from "../../api/backendApi";
import {Card} from "../../interfaces/workflows";
import {CHANGES_REQUESTED, PENDING} from "../../constants/taskStatus";
import NotificationModal from "../../components/NotificationModal";
import {notificationConfig, TAB_DOCUMENTS, TAB_INFO} from "./constants";
import {INotificationConfig} from "./interfaces";
import RiskValueSelector from "./components/RiskValueSelector";
import {ITaskDetail} from "../../interfaces/Workflow/task";
import {AGREEMENTS, AML_KYC, GP_SIGNING} from "../../constants/workflowModules";
import RequestRevisionButton from "../../components/ReviewActionButtons/RequestRevisionsButton";
import ApproveButton from "../../components/ReviewActionButtons/ApproveButton";
import BankingDetails from "./components/BankingDetails";
import FundDocuments from "./components/FundDocuments";
import ProgramDocs from "./components/ProgramDocs";
import {IPaymentDetail} from "../../interfaces/paymentDetails";
import TaxDetails from "./components/TaxDetails";
import workflowAPI from "../../api/workflowAPI";
import Overview from "./components/Overview";
import {fetchGeoSelector} from "../EligibilityCriteria/thunks";
import {Button} from "react-bootstrap";
import TaxForm from "./components/TaxFormDocument/TaxForm";
import AdminApplicationDocuments from "../../components/AdminApplicationDocuments/Documents";
import AdminDocuments from "./components/AdminDocumentsTab/kyc";
import TaxInfo from "./components/AdminDocumentsTab/tax";
import ProgramDocuments from "./components/AdminDocumentsTab/programDocuments";
import { TransferBadge } from "../FundSetup/components/ApplicantsList/styles";


interface AMLYKYCProps {
  recordId: number;
  externalId: string;
  kyc_wf_slug: string | null;
  handleEditCustomer?: () => void;
  handleAddDocumentRequest?: () => void;
  eligibilityResponseId: number | null;
  applicationId: number;
  taxRecordId: number | null;
  taskDetail?: ITaskDetail;
  paymentDetail?: IPaymentDetail | null;
}

const KnowYourCustomer: FunctionComponent<AMLYKYCProps> = ({
                                                             recordId,
                                                             externalId,
                                                             eligibilityResponseId,
                                                             applicationId,
                                                             taskDetail,
                                                             handleEditCustomer,
                                                             handleAddDocumentRequest,
                                                             kyc_wf_slug,
                                                             taxRecordId,
                                                             paymentDetail
                                                           }) => {
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [tabId, setTabId] = useState<string>(TAB_INFO);
  const [eligibilityCard, setEligibilityCard] = useState<Card | null>(null);
  const [investmentAmountCard, setInvestmentAmountCard] = useState<Card | null>(null);
  const [eligibilityCardFetched, setEligibilityCardFetched] = useState<boolean>(false);
  const [notification, setNotification] = useState<INotificationConfig>(notificationConfig.default);

  const dispatch = useAppDispatch();
  const {
    amlKYCWorkflows,
    fund,
    kycRecordsById,
    applicationDocumentsRequests,
    applicationDocumentsRequestsResponse,
    applicationInfo,
    fundAgreements,
    isApproveButtonDisabled
  } = useAppSelector(selectKYCState);
  const {taxFormsAdmin, taxDetails} = useAppSelector(selectTaxRecords);
  const [userId, setUserId] = useState(0 as number);

  useEffect(() => {
    dispatch(fetchGeoSelector());
  }, [dispatch]);

  useEffect(() => {
    if (externalId) {
      dispatch(fetchWorkflows(externalId));
      dispatch(fetchFund(externalId));

      // Populate Fund Details Store for displaying correct currencies
      dispatch(fetchFundDetail(externalId));
    }
  }, [dispatch, externalId]);

  useEffect(() => {
    amlKYCWorkflows.filter(workflow => workflow.slug === kyc_wf_slug).forEach((workflow) => {
      dispatch(fetchKYCRecords({workflowSlug: workflow.slug, recordId, applicationId}));
    });
  }, [amlKYCWorkflows, dispatch]);

  useEffect(() => {
    if (taxRecordId) {
      dispatch(fetchTaxFormsAdmin(taxRecordId));
      dispatch(fetchTaxDetailsAdmin(taxRecordId));
    }
  }, [dispatch, taxRecordId]);

  useEffect(() => {
    if (!recordId) return;
    const record = kycRecordsById[recordId];
    if (!record) return;

    const fetchEligibilityCriteriaCard = async () => {
      if (!eligibilityResponseId) return;
      try {
        const data = await API.getEligibilityCriteriaCard(eligibilityResponseId);
        if (data.eligibility_card) {
          setEligibilityCard(data.eligibility_card);
        }
        if (data.investment_card) {
          setInvestmentAmountCard(processInvestmmentCard(data.investment_card));
        }
        if (data.workflow_id) setWorkflowId(data.workflow_id);
      } catch (e) {
        console.error(e);
      } finally {
        setEligibilityCardFetched(true);
      }
    };
    fetchEligibilityCriteriaCard();
  }, [dispatch, recordId, kycRecordsById]);

  const processInvestmmentCard = (card: any) => {
    if(fund.offer_leverage) return {
      ...card,
      schema: card.schema.filter((item: any) => (!item.id.includes('leverage-description')))
    }
    const schema = card.schema.filter((item: any) => !(item.id.includes('leverage-requested') || item.id.includes('final-leverage')));
    return {
      ...card,
      schema
    }
  }

  const onApproveTask = () => {
    if (taskDetail && taskDetail.module === AGREEMENTS) {
      workflowAPI.createGPSigningTask({application_id: applicationId})
    }
  }

  const getApproveButton = () => {
    if (!taskDetail) return null;
    if (taskDetail.module === GP_SIGNING) {
      const agreementDocument = find(
        fundAgreements,
        (agreement: { task: number; }) =>
          agreement.task === taskDetail.id
      );
      if (!agreementDocument)
        return (
          <ApproveButton
            taskId={taskDetail.id}
            showNotification={() => setNotification(notificationConfig.approve)}
            disabled={pendingRiskEvaluation || isApproveButtonDisabled}
          />
        );
      if (agreementDocument?.gp_signing_complete) {
        return (
          <ApproveButton
            taskId={taskDetail.id}
            showNotification={() => setNotification(notificationConfig.approve)}
            disabled={pendingRiskEvaluation || isApproveButtonDisabled}
          />
        );
      } else {
        return (
          <Button
            className={"mb-3"}
            variant="primary"
            onClick={() => setNotification(notificationConfig.approvalDisabled)}
          >
            Approve
          </Button>
        );
      }
    } else {
      return (
        <ApproveButton
          taskId={taskDetail?.id}
          showNotification={() => setNotification(notificationConfig.approve)}
          onTaskApproved={onApproveTask}
          disabled={pendingRiskEvaluation || isApproveButtonDisabled}
        />
      );
    }
  };

  const currentRecord = kycRecordsById[recordId];
  const currentRecordUser = currentRecord && currentRecord.user;
  const fullName = applicationInfo
    ? `${applicationInfo?.first_name} ${applicationInfo.last_name}`
    : "";

  currentRecordUser && userId === 0 && setUserId(currentRecordUser.id);

  const hasApplicationStarted = !!recordId;

  if (hasApplicationStarted && !currentRecord)
    return (
      <Container>
        <br/>
        {Object.keys(kycRecordsById).length
          ? "Not found"
          : "Retrieving full application..."}
      </Container>
    );

  const needRiskEvaluation = taskDetail && taskDetail.module === AML_KYC
  const hasPendingComment = taskDetail ? taskDetail.has_pending_comment : false
  const pendingRiskEvaluation = needRiskEvaluation && !(Boolean(currentRecord.risk_evaluation))
  const skipTax = fund?.skip_tax

  return (
    <Container>
      <Header>
        <HeaderRow>
          <div>
            {fund && (
              <HeaderPath>
                <a href={`/admin/funds/${fund.external_id}`}>{fund.name}</a> /
                <a
                  href={`/admin/funds/${fund.external_id}?tab=${TABS.APPLICANTS_MANAGEMENT}`}
                >
                  Applicants
                </a>{" "}
                /
              </HeaderPath>
            )}
            <BigTitle>
              {fullName}
              {applicationInfo?.is_transferred && <TransferBadge>Transfer</TransferBadge>}
            </BigTitle>
          </div>
        </HeaderRow>
        <HeaderRow>
          <TabRow>
            <Tab active={tabId === TAB_INFO} onClick={()=>setTabId(TAB_INFO)}>Info</Tab>
            <Tab active={tabId === TAB_DOCUMENTS} onClick={()=>setTabId(TAB_DOCUMENTS)}>Documents</Tab>
          </TabRow>
          <ButtonRow>
            <EditButton className={"mb-3"} onClick={handleEditCustomer}>
              Edit
            </EditButton>
            {
              hasApplicationStarted && currentRecord &&
              (<>
                <EditButton
                  className={"mb-3"}
                  onClick={() => setNotification(notificationConfig.requests)}
                >
                  Requests
                </EditButton>
                <EditButton className={"mb-3"} onClick={handleAddDocumentRequest}>
                  Add Document Request
                </EditButton>
              </>)
            }
            {taskDetail && (taskDetail.status === PENDING || taskDetail.status === CHANGES_REQUESTED) && (
              <>
                <RequestRevisionButton
                  taskId={taskDetail.id}
                  allowSubmitRevision={hasPendingComment}
                  showSubmitNotification={() =>
                    setNotification(notificationConfig.requestChanges)
                  }
                  showCommentRequiredNotification={() => setNotification(notificationConfig.commentRequired)}
                />
                {getApproveButton()}
              </>
            )}
          </ButtonRow>
        </HeaderRow>
      </Header>
      {tabId === TAB_DOCUMENTS && <>
        <AdminDocuments/>
        <TaxInfo/>
        <ProgramDocuments/>
      </>}
      {tabId === TAB_INFO && <Row>
        {!hasApplicationStarted ? <Inner md={9}>
          <div>{`Applicant details will become available once ${applicationInfo ? applicationInfo.first_name : 'user'} has started the on-boarding process`}</div>
        </Inner> : <Inner md={9}>
          {needRiskEvaluation && (
            <RiskValueCol md={4}>
              <RiskValueSelector
                recordId={currentRecord.id}
                currentRiskValue={currentRecord.risk_evaluation}
              />
            </RiskValueCol>
          )}
          {
            currentRecord && <Overview record={currentRecord} applicationId={applicationId}/>
          }
          {currentRecord && (
            <Record
              record={currentRecord}
              eligibilityCard={eligibilityCard}
              investmentAmountCard={investmentAmountCard}
              eligibilityCardFetched={eligibilityCardFetched}
            />
          )}

          {
            applicationInfo?.investment_detail.is_eligible && <>
            {!skipTax && <CardContainer>
            <CardTitle>Tax Details</CardTitle>
            <TaxDetails taxDetails={taxDetails} record={currentRecord} applicationId={applicationId}/>
          </CardContainer>}

            {!skipTax && <CardContainer>
            <CardTitle>Tax Forms</CardTitle>
            <SchemaContainer>
              {taxFormsAdmin.length === 0
                ? "There are no documents to show."
                : taxFormsAdmin.map((doc: any) => {
                    return (
                      <QuestionContainer key={doc.document.document_id}>
                        <TaxForm
                          doc={doc}
                          recordId={currentRecord.id}
                          userId={currentRecordUser.id}
                          applicationId={applicationId}
                        />
                        <QuestionInner>
                          {doc.completed === "True" ? (
                            <TaxFormDocument
                              doc={doc}
                              recordId={currentRecord.id}
                              userId={currentRecordUser.id}
                              applicationId={applicationId}
                            />
                          ) : (
                            <CommentBadge>Pending</CommentBadge>
                          )}
                        </QuestionInner>
                      </QuestionContainer>
                    );
                  })}
            </SchemaContainer>
          </CardContainer>}

              <CardContainer className="mb-4">
                <CardTitle>Banking Details</CardTitle>
                {paymentDetail && applicationId ?
                  (<BankingDetails details={paymentDetail} record={currentRecord} applicationId={applicationId}/>)
                  : (<>There are no banking details to show.</>)}
              </CardContainer>
              <CardContainer className="mb-4">
                <CardTitle>Documents</CardTitle>
                {applicationId ? <FundDocuments record={currentRecord} applicationId={applicationId}/> : (<></>)}
              </CardContainer>
              <CardContainer className="mb-4">
                <CardTitle>Program Documents</CardTitle>
                {applicationInfo ? <ProgramDocs record={currentRecord} applicationId={applicationId}
                                                documents={applicationInfo.power_of_attorney_documents}/> : (<></>)}
              </CardContainer>

            </>
          }
          <InternalCardContainer className="mb-4">
            <CardTitle>Internal Supporting Documentation</CardTitle>
            <AdminApplicationDocuments applicationId={applicationId}/>
          </InternalCardContainer>
        </Inner>}
        {hasApplicationStarted && <CommentsContainer md={3}>
          {workflowId && (
            <Comments workFlowId={workflowId} wrapperClass={"comments-box"}             approver={taskDetail?.approver}
                      approvalDate={taskDetail?.approval_date}/>
          )}
        </CommentsContainer>}

      </Row>}
      <NotificationModal
        title={notification?.title}
        showModal={notification?.show}
        handleClose={() => setNotification(notificationConfig.default)}
      >
        {notification?.msg}
      </NotificationModal>
    </Container>
  );
};

export default KnowYourCustomer;
