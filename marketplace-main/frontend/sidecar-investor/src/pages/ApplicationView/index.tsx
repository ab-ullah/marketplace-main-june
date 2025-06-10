import React, {FunctionComponent, memo, useEffect, useMemo, useReducer, useRef, useState,} from "react";
import API from "../../api";
import { Element as ScrollElement, scroller } from 'react-scroll';
import { AxiosError } from "axios";
import size from "lodash/size";
import first from "lodash/first";
import replace from "lodash/replace";
import map from "lodash/map";
import pickBy from "lodash/pickBy";
import toLower from "lodash/toLower";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";
import each from "lodash/each";
import get from "lodash/get";
import {Link, useHistory, useParams} from "react-router-dom";
import {Field, FieldProps, Formik, FormikHelpers, FormikProps, FormikValues,} from "formik";
import {
  AML_FLOW_SLUGS,
  AML_SLUG_SELECTION_ID,
  initReplyModal,
  KYC_LIMITED_PARTNERSHIP_INVESTOR,
  KYC_PARTICIPANT_INVESTOR,
  KYC_PRIVATE_COMPANY_INVESTOR,
  KYC_TRUST_INVESTOR,
  PARTICIPANT_FORMS_INITIAL_STATE,
  STATUS_CODES,
} from "../KnowYourCustomer/constants";
import {selectKYCRecord} from "../KnowYourCustomer/selectors";
import {
  fetchAdditionalCards,
  fetchApplicationDocumentRequestResponse,
  fetchApplicationDocumentRequests,
  fetchCommentsByApplicationId,
  fetchCommentsByKycRecordId,
  fetchWorkflows,
  dismissApplicationUpdateNotification,
  fetchApplicationKYCDocuments,
  fetchApplicationKYCRecord,
  fetchInitialApplicationRecord,
  fetchApplicationKYCParticipantsDocuments
} from "../KnowYourCustomer/thunks";
import { getUnavailableSectionMesage } from "../../constants/applicationView";
import {fetchAppRecord, fetchTaxDocuments} from "../TaxForms/thunks";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {FormValues, IApplicationRequestedDocument} from "../KnowYourCustomer/interfaces";
import {
  useGetFundDetailsQuery,
  useHasPendingRequestsQuery,
  useGetDocumentsQuery,
  useSubmitApplicationChangesMutation,
  useFetchSignedPowerOfAttorneyQuery,
  useUpdateCommentStatusMutation,
  useGetApplicationStatusQuery,
  useFetchBankingDetailsQuery, useGetApplicationModuleStateQuery, useGetApplicationNextStateQuery,
} from "../../api/rtkQuery/fundsApi";
import BankingDetails from "./BankingDetails";
import ProgramDoc from "./ProgramDoc";
import FundDocuments from "./FundDocuments";
import WithdrawApplication from "./WithdrawApplication";
import {
  getAnswerInputComponent,
  getDocumentFieldsList,
  getIsFieldEnabled,
  handleValidation,
  onFormUpdateError,
  participantFormStatusReducer,
} from "../KnowYourCustomer/utils";
import {getTotalComments, getTotalCommentsByModule, getParticipantsCount, hasNonApprovedComments} from "./utils";
import AutoSave from "../KnowYourCustomer/components/AutoSave";
import {Card, Schema, WorkflowAnswerPayload,} from "../../interfaces/workflows";
import {
  CardContainer,
  ChangeAnswersButton,
  Container,
  Content,
  Flag,
  FormContainer,
  Header,
  HeaderRow,
  Inner,
  LeftSidebar,
  ParticipantContainer,
  Path,
  SidebarBadge,
  SidebarItem,
  SidebarSubItem,
  SubmitButton,
  WithdrawButton,
  Subtitle,
  Tab,
  TabRow,
  Title,
  CommentNote,
  CommentBadge,
  CommentContainer,
  ScrollLink,
  DismissButton,
  SubTitle,
} from "./styles";

import tasksApi from "../../api/tasks";
import {resetToDefault, setApplicationStatus, setIsReplyModalOpen,} from "../KnowYourCustomer/kycSlice";
import CommentWrapper from "../../components/CommentWrapper";
import {INVESTOR_URL_PREFIX} from "../../constants/routes";
import {MODIFY_ELIGBILITY} from "../../constants/urlHashes";
import {Alert, Button} from "react-bootstrap";
import NotificationModal from "../../components/NotificationModal";
import Accordion from "react-bootstrap/Accordion";
import {selectAppRecords} from "../TaxForms/selectors";
import {ELIGIBILITY_CRITERIA_CARD_NAME, FILE_UPLOAD_FIELD, INVESTMENT_AMOUNT_CARD_NAME, notificationConfig, OVERVIEW_FIELDS, PARTICIPANTS_CARD_LABEL} from "./constants";
import SchemaContainer from '../KnowYourCustomer/components/CardContainer';
import Logo from "../../components/Logo";
import TaxDocuments from "./Components/TaxDocuments";
import {ELIGIBILITY_CRITERIA, KYC_RECORD, FUND_DOCUMENTS, TAX_RECORD, INVESTMENT_ALLOCATION, BANKING_DETAILS, PARTICIPANT, PROGRAM_DOCS} from "../../constants/commentModules";
import CommentCount from "./Components/CommentCount";
import Overview from "./Overview";
import InvestmentAmount from "./InvestmentAmount";
import EligibilityCriteria from "./EligibilityCrriteria";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../constants/commentStatus";
import { getEligibilityCriteriaResponse, getFundCriteriaResponseStatus } from "../EligibilityCriteria/thunks";
import { selectIsEligible } from "../EligibilityCriteria/selectors";
import ApplicationStatuses from "./Components/ApplicationStatusPills";
import ReplyModal from "../../components/ReplyModal";
import {lowerCase} from "lodash";

import BackToDashboard from "./Components/BackToDashboard";
import NextStatus, {CONTINUE_STATUS} from "./Components/StatusBars";
import {IApplicationStatus} from "../../interfaces/application";
import {resetRtkStore} from "../../api/rtkQuery/resetRtkStore";
import { useCompanyPrefix } from "../../utils/hooks";
import { ThemeButton } from "../../components/Button/styles";
import { useGetOnboardingCustomTextQuery } from "../../api/rtkQuery/pageConfigsApi";
import { isApplicationPage } from "../../utils/routes";


export interface IUploadDocDetails {
  files: File[],
  recordId: number,
  questionId: string
}

interface ICommentsContext {
  comments: any,
  recordId: null | number;
  recordUUID: null | string;
  callbackDocumentUpload: null | ((data: IUploadDocDetails) => void),
  fetchKYCRecord: null | (() => void),

}

export const CommentsContext = React.createContext<ICommentsContext>({
  comments: {},
  recordId: null,
  recordUUID: null,
  callbackDocumentUpload: null,
  fetchKYCRecord: null
});

const ApplicationView: FunctionComponent<any> = () => {
  const dispatch = useAppDispatch();
  const { externalId, ...restParams } = useParams<{ externalId: string }>();
  const {companyPrefix} =useCompanyPrefix()
  const {
    answers,
    commentsByRecord,
    didFetch,
    kycRecordId,
    workflow,
    comments,
    investorType,
    eligibilityCard,
    investmentAmountCard,
    kycRecordParticipants,
    kycParticipantIds,
    currentTaskId,
    recordUUID,
    applicationRecord,
    applicationDocumentsRequests,
    applicationRequestedDocuments,
    replyModal
  } = useAppSelector(selectKYCRecord);
  const isEligible = useAppSelector(selectIsEligible);
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const { data: fundDocuments } = useGetDocumentsQuery(externalId, {
    skip: !externalId,
  });

  const [hashScrollDone, setHashScrollDone] = useState(false)
  const {data: submitChangesStatus} = useHasPendingRequestsQuery(externalId);
  const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
  const { data: applicationNextState, refetch: refetchNextState } = useGetApplicationNextStateQuery(externalId);
  const { data: applicationModuleStats, refetch: refetchModuleState } = useGetApplicationModuleStateQuery(externalId);
  const [apiHandleSubmitChanges] = useSubmitApplicationChangesMutation();
  const [apiResetComment] = useUpdateCommentStatusMutation();
  const { data: bankingApiData } =
    useFetchBankingDetailsQuery(externalId, {
      skip: !externalId,
    });
  useGetOnboardingCustomTextQuery(undefined);

  const { hasFetchedAppRecords, appRecords, taxDocumentsList } = useAppSelector(selectAppRecords);
  const [activeCard, setActiveCard] = useState<string>("");
  const [application, setApplication] = useState<Card[]>([]);
  const [hasFundDocuments, setHasFundDocuments] = useState(false);
  const [schema, setSchema] = useState<Schema>([]);
  const [notification, setNotification] = useState(notificationConfig.default);
  const history = useHistory();
  const showAmlKyc = applicationStatus?.can_go_past_eligibility;
  const isAllocationApproved = applicationStatus?.can_go_past_eligibility;
  const isApplicationLocked = applicationStatus?.is_locked || (applicationStatus?.application_view_editing_disabled && isApplicationPage());

  const applicationStatusApproved = applicationStatus?.can_go_past_eligibility;
  const skipTax = fundDetails?.skip_tax

  const searchParams = new URLSearchParams(window.location.search);
  const view = searchParams.get('view');

  const [participantForms, dispatchParticipantForms] = useReducer(
    participantFormStatusReducer,
    PARTICIPANT_FORMS_INITIAL_STATE
  );
  const [enableSubmitChanges, setEnableSubmitChanges] = useState(true);
  const [participantApplications, setParticipantApplications] = useState<{
    [key: string]: Card;
  }>({});
  const [
    submittingParticipantApplications,
    setSubmittingParticipantApplications,
  ] = useState<boolean>(false);
  const participantRefs = useRef<{ [key: string]: FormikProps<FormikValues> }>(
    {}
  );

  const hidratedAnswers = useMemo(() => {
    if (
      investorType === KYC_PRIVATE_COMPANY_INVESTOR ||
      investorType === KYC_LIMITED_PARTNERSHIP_INVESTOR ||
      investorType === KYC_TRUST_INVESTOR
    ) {
      return Object.assign({}, answers, {
        [AML_SLUG_SELECTION_ID]: AML_FLOW_SLUGS[investorType],
      });
    }
    return answers;
  }, [investorType, answers]);

  const onValidate = (values: FormValues) => handleValidation(values, schema);

  const commentsOfCurrentRecord = useMemo(() => {
    if (kycRecordId === null) return {};
    return commentsByRecord[kycRecordId];
  }, [kycRecordId, commentsByRecord]);

  const commentsPerCard = useMemo(() => {
    const commentsPerCard: { [key: string]: number } = {};
    if (
      !!commentsOfCurrentRecord &&
      Object.keys(commentsOfCurrentRecord).length > 0
    ) {
      application.forEach((card) => {
        const schema = card.schema.reduce((acc, question) => {
          if (!acc.includes(question.id)) {
            acc.push(question.id);
          }
          return acc;
        }, [] as string[]);
        schema.forEach((questionId) => {
          if (questionId in commentsOfCurrentRecord) {
            commentsPerCard[card.name] = commentsPerCard[card.name]
              ? commentsPerCard[card.name] + 1
              : 1;
          }
        });
      });
    }
    return commentsPerCard;
  }, [commentsOfCurrentRecord, application]);

  const additionalDocumentPendingRequestsCount = useMemo(() => {
    let count: number = 0;
    const documentResponseFlags: any = {}
    if(applicationDocumentsRequests){
      applicationDocumentsRequests.forEach((request) => {
        documentResponseFlags[request.id] = false;
        applicationRequestedDocuments.forEach((document) => {
          if(document.application_document_request === request.id){
            documentResponseFlags[request.id] = true
          }
        })
      })
    }
    Object.keys(documentResponseFlags).forEach((key) => {
      if(!documentResponseFlags[key]) count++;
    })
    return count
  }, [
    applicationRequestedDocuments,
    applicationDocumentsRequests
  ]);

  useEffect(() => {
    if(get(appRecords, `0.eligibility_response`)){
      dispatch(getFundCriteriaResponseStatus(appRecords[0]?.eligibility_response))
    }
  }, [appRecords])

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAppRecord(externalId));
    return () => {
      dispatch(resetToDefault());
      resetRtkStore(dispatch)
    };
  }, []);

  const submitParticipantForm = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
    participantId: number
  ) => {
    const documentFields = getDocumentFieldsList(values, workflow!);
    const initialValues = kycRecordParticipants![participantId] ?? {};
    const nonDocumentFields = Object.entries(values).reduce(
      (acc, [key, value]) => {
        if (!documentFields.includes(key) && initialValues[key] !== value) {
          acc[key] = value;
        }
        return acc;
      },
      {} as FormValues
    );
    try {
      if (Object.keys(nonDocumentFields).length > 0) {
        await API.updateParticipantRecord(
          workflow!.slug,
          kycRecordId!,
          participantId,
          nonDocumentFields
        );
        if (recordUUID) dispatch(fetchApplicationKYCRecord({
          recordUUID,
          applicationId: applicationRecord?.id
        }));
      }
      if (documentFields.length > 0) {
        dispatch(fetchApplicationKYCParticipantsDocuments(participantId));
      }
    } catch (e) {
      const error = e as AxiosError;
      if (error.response?.data && error.response.status === 400) {
        onFormUpdateError(error.response?.data, helpers.setFieldError);
      }
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const onChangeAMLKYCAnswers = async () => {
    if (
      !window.confirm("Are you sure you want to change your AML/KYC answers?")
    )
      return;
    await API.updateKYCRecordStatus(
      workflow!.slug,
      kycRecordId!,
      STATUS_CODES.CREATED
    );
    dispatch(setApplicationStatus(STATUS_CODES.CREATED));
    history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/amlkyc`);
  };

  useEffect(() => {
    if (externalId) {
      dispatch(fetchWorkflows(externalId));
      hasFetchedAppRecords &&
        !skipTax &&
        appRecords[0] &&
        appRecords[0].tax_record &&
        dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
        kycRecordId && dispatch(fetchCommentsByKycRecordId(kycRecordId));
    }
  }, [dispatch, hasFetchedAppRecords, appRecords, externalId, kycRecordId]);

  useEffect(() => {
    if (didFetch.fundWorkflows) {
      dispatch(fetchInitialApplicationRecord(externalId));
    }
  }, [didFetch.fundWorkflows, dispatch, externalId]);

  useEffect(() => {
    if(applicationRecord){
      dispatch(fetchApplicationDocumentRequests(applicationRecord.id))
      dispatch(fetchApplicationDocumentRequestResponse(applicationRecord.id))
      dispatch(fetchCommentsByApplicationId(applicationRecord.id));
    }
  }, [dispatch, applicationRecord])

  useEffect(() => {
    if (kycRecordId === null || applicationRecord === null) return;
    dispatch(fetchApplicationKYCDocuments({
      recordId: kycRecordId,
      applicationId: applicationRecord.id
    }));
    dispatch(fetchCommentsByKycRecordId(kycRecordId));
  }, [dispatch, kycRecordId, applicationRecord]);

  useEffect(() => {
    if (workflow?.cards && hidratedAnswers) {
      const workflowCards = [...workflow.cards];

      if (investmentAmountCard) workflowCards.push(investmentAmountCard);
      if (eligibilityCard) workflowCards.push(eligibilityCard);
      const updatedCards = workflowCards;
      const application = updatedCards.reduce((acc, card) => {
        const schema = card.schema.filter(
          (question) =>
            (hidratedAnswers![question.id] !== undefined ||
              question.submitted_answer ||
              question.investmentDetail ||
              question.type === "file_upload")
        );
        if (
          schema.length > 0 &&
          card.kyc_investor_type_name !== KYC_PARTICIPANT_INVESTOR
        ) {
          acc.push({ ...card, schema });
        }
        return acc;
      }, [] as Card[]);

      const schema = application.reduce((acc, card) => {
        card.schema.forEach((question) => {
          acc.push(question);
        });
        return acc;
      }, [] as Schema);
      setApplication(application);
      setActiveCard(get(application, "[0].name", ""));
      setSchema(schema);
    }
  }, [
    workflow?.cards,
    hidratedAnswers,
    eligibilityCard,
    investmentAmountCard,
    investorType,
  ]);

  useEffect(() => {
    if (appRecords && appRecords[0])
      dispatch(fetchAdditionalCards(appRecords[0].id));
  }, [dispatch, appRecords]);

  useEffect(() => {
    if (
      kycParticipantIds !== null &&
      kycRecordParticipants !== null &&
      workflow?.cards !== undefined
    ) {
      const partApp: { [key: string]: Card } = {};
      const repeatableCards = workflow.cards.filter(
        (card) => card.is_repeatable
      );
      kycParticipantIds.forEach((participantId) => {
        const answers = kycRecordParticipants[participantId];
        repeatableCards.forEach((card) => {
          const schema = card.schema.filter(
            (question) => answers[question.id] !== undefined || question.type === FILE_UPLOAD_FIELD
          );
          const fullName = answers.first_name + " " + answers.last_name;
          if (schema.length > 0) {
            partApp[participantId] = {
              ...card,
              schema,
              name: fullName ?? `${card.name} ${participantId}`,
            };
          }
        });
      });
      setParticipantApplications(partApp);
    }
  }, [kycParticipantIds, kycRecordParticipants, workflow?.cards]);

  useEffect(() => {
    if(kycRecordId)
      dispatch(fetchCommentsByKycRecordId(kycRecordId));
    if (!didFetch.participantDocuments && kycParticipantIds !== null) {
      kycParticipantIds.forEach((participantId) => {
        dispatch(fetchApplicationKYCParticipantsDocuments(participantId));
      });
    }
  }, [dispatch, didFetch.participantDocuments, kycRecordId, kycParticipantIds ]);


  useEffect(() => {
    if (kycParticipantIds === null) return;
    kycParticipantIds.forEach((participantId) => {
      dispatch(fetchCommentsByKycRecordId(participantId))
    }
    );
  }, [dispatch, kycParticipantIds]);

  useEffect(() => {
    if (
      submittingParticipantApplications &&
      !participantForms.anyDirty &&
      !participantForms.anySubmitting
    ) {
      setSubmittingParticipantApplications(false);
    }
  }, [
    submittingParticipantApplications,
    participantForms.anyDirty,
    participantForms.anySubmitting,
  ]);

  useEffect(()=>{
   if(externalId) dispatch(getEligibilityCriteriaResponse(externalId))
  },[externalId])

  const bankingCommentsCount = useMemo(() => {
    return getTotalCommentsByModule(comments, BANKING_DETAILS);
  }, [comments]);


  const programCommentsCount = useMemo(() => {
    return getTotalCommentsByModule(comments, PROGRAM_DOCS);
  }, [comments]);

  const fundDocumentCommentsCount = useMemo(() => {
    const ids = map(fundDocuments, (val) => `${val.id}`);
    return getTotalComments(comments, ids, FUND_DOCUMENTS);
  }, [comments, fundDocuments]);

  const investmentCommentsCount = useMemo(() => {
    return getTotalCommentsByModule(comments, INVESTMENT_ALLOCATION);
  }, [comments, fundDocuments]);


  const taxCommentsCount = useMemo(() => {
    return getTotalCommentsByModule(comments, TAX_RECORD);
  }, [comments])

  const investmentCard = useMemo(() => {
    return application.find(card => card.name === "Investment Amount")
  }, [application])

  const eligibilityCriteriaCard = useMemo(() => {
    return application.find(card => card.name === "Eligibility Criteria")
  }, [application])

  const overviewCommentsCount = useMemo(() => {
    let newCommentCount = 0;
    let updatedCommentCount = 0;
    const kycComments = get(commentsByRecord, `${KYC_RECORD}.${kycRecordId}`);
    each(OVERVIEW_FIELDS, (field) => {
      if (
        kycComments &&
        kycComments[field] &&
        get(kycComments[field], `${""}.0`)?.status === COMMENT_CREATED
      ) {
        newCommentCount++;
      }
      if (
        kycComments &&
        kycComments[field] &&
        get(kycComments[field], `${""}.0`)?.status === COMMENT_UPDATED
      ) {
        updatedCommentCount++;
      }
    });
    if(newCommentCount > 0) return newCommentCount;
    if(updatedCommentCount > 0) return -1;
    return 0
  }, [commentsByRecord]);

  const onDismissNotification = () => {
    dispatch(
      dismissApplicationUpdateNotification({
        application_id: applicationRecord?.uuid,
        application_fields: { is_application_updated: false },
      })
    ).then(() => {
      dispatch(fetchInitialApplicationRecord(externalId));
    });
  };

  const participantCommentsCount = useMemo(() => {
    const count = getParticipantsCount(comments, kycParticipantIds);
    return count;
  }, [kycParticipantIds, comments])

  const formInit = hidratedAnswers ?? answers

  if (didFetch.fundWorkflows && didFetch.initialRecord && !workflow)
    return (
      <Container>
        <Inner>
          <Content>No application found for this fund.</Content>
        </Inner>
      </Container>
    );
  if (!answers || !workflow)
    return (
      <Container>
        <Inner>
          <Content>Fetching application...</Content>
        </Inner>
      </Container>
    );


  const getSectionId = (label: string) => {
    return toLower(replace(label, /\s/g, "_"));
  }

  const handleSubmitChanges = async () => {
    if(submitChangesStatus?.has_pending_requests && enableSubmitChanges){
      await apiHandleSubmitChanges(externalId);
      refetchNextState()
      refetchModuleState()
      setNotification(notificationConfig.submittedChanges);
      setEnableSubmitChanges(false);
    }else {
      setNotification(notificationConfig.submittedChanges);
    }
  }

  const getKYCRecord = () => {
    if (recordUUID) dispatch(fetchApplicationKYCRecord({
      recordUUID,
      applicationId: applicationRecord?.id
    }))
  }

  const callbackSubmitPOA = () => {
    getKYCRecord();
    applicationRecord && dispatch(fetchCommentsByApplicationId(applicationRecord.id));
  }

  const handleSubmit = async (formikData: FormValues, { setFieldError }: FormikHelpers<FormValues>) => {
    const values = pickBy(formikData, (value, key) => {
      return (!isEqual(get(formInit, key), value) && key !== "aml-kyc-type-selection")
    })

    if(!isEmpty(values)) {
      if (currentTaskId) await tasksApi.submitChangesForTask(currentTaskId);
      try {
        const fieldsToExclude = getDocumentFieldsList(values, workflow);
        const payload = Object.keys(values).reduce((acc, key) => {
          if (fieldsToExclude.indexOf(key) === -1) {
            acc[key] = values[key];
          }
          return acc;
        }, {} as WorkflowAnswerPayload);
        payload.status = STATUS_CODES.SUBMITTED.id + "";
        payload.fund_external_id = externalId
        await API.updateKYCRecord(workflow!.slug, kycRecordId!, payload);
        if (recordUUID) dispatch(fetchApplicationKYCRecord({
          recordUUID,
          applicationId: applicationRecord?.id
        }))
        dispatch(fetchApplicationKYCDocuments({
          recordId: kycRecordId,
          applicationId: applicationRecord?.id
        }));
        if (kycParticipantIds !== null) {
          setSubmittingParticipantApplications(true);
          kycParticipantIds.forEach((participantId) => {
            participantRefs?.current[participantId]?.submitForm();
          });
        }
      } catch (e) {
        const error = e as AxiosError;
        if (error.response?.data && error.code === "400") {
          onFormUpdateError(error.response.data, setFieldError);
        }
      }
    }
  }

  const handleUploadDouments = async (data: IUploadDocDetails) => {
    if(size(data.files) > 0 && data.recordId && data.questionId){
      const acc: Promise<any>[] = [];
      each(data.files, (file: File) => {
        const formData = new FormData();
        formData.append('file_data', file);
        formData.append('field_id', data.questionId);
        formData.append('record_id', `${data.recordId}`);
        formData.append('fund_external_id', externalId);
        acc.push(API.uploadDocumentToKYCRecord(data.recordId, formData));
      });
      await Promise.allSettled(acc);
      if(kycRecordId)
        dispatch(fetchApplicationKYCDocuments({
          recordId: kycRecordId,
          applicationId: applicationRecord?.id
        }));
      dispatch(fetchApplicationKYCParticipantsDocuments(data.recordId));
      getKYCRecord();
    }
  }

  const getCommentsCount = (card: any) => {
    if(card.id === "aml-kyc-entities-and-stuff-aml-entity-card")
      return getTotalComments(comments, ["kyc_investor_type_name", "investor_location"]);

    if(card.name === "Eligibility Criteria")
      return getTotalCommentsByModule(comments, ELIGIBILITY_CRITERIA);

    if(card.name === "Investment Amount")
      return investmentCommentsCount;

    const ids = map(card?.schema, 'id');
    return getTotalComments(comments, ids);
  }

  const getModuleDetails = (card: any) => {
    const isEligibilityCard = card.name === "Eligibility Criteria";
    const resp = {
      isEligibilityCard: false,
      commentsModule: KYC_RECORD,
      moduleId: appRecords[0].kyc_record.id
    };
    if(isEligibilityCard) {
      return { ...resp, isEligibilityCard: true, commentsModule: ELIGIBILITY_CRITERIA, moduleId: appRecords[0].eligibility_response}
    }
    if(card.name === "Investment Amount"){
      return { ...resp, commentsModule: INVESTMENT_ALLOCATION, moduleId: get(card.schema, `0.investmentDetail.investment_record_id`) };
    }
    return resp;
  }

  if (didFetch.fundWorkflows && !workflow)
    return <Container>No application found.</Container>;
  if (!answers || !workflow || formInit === null) return <Container>Loading...</Container>;

  let showModifyEligibilityButton = false

  if (appRecords && appRecords[0]) {
    showModifyEligibilityButton = hasNonApprovedComments(comments, ELIGIBILITY_CRITERIA, appRecords[0]?.eligibility_response) || (submitChangesStatus?.has_pending_requests && enableSubmitChanges)
  }

  if (!hashScrollDone && hasFundDocuments && view && lowerCase(view) === 'documents') {
    scroller.scrollTo('fund_documents', {
      delay: 2000,
      duration: 1000,
      smooth: true,
    });
    setHashScrollDone(true)
  }

  const kycCompleted = !applicationStatus?.has_pre_document_stage || applicationStatus?.user_completed_kyc
  const canMoveForward = applicationNextState && !applicationNextState?.application_completed && CONTINUE_STATUS.includes(applicationNextState?.status)
  let readOnlyText = 'This is a read-only version of the application.'
  if (canMoveForward) {
    readOnlyText = 'This is a read-only version of the application. To continue, click "Continue your application" in the top green banner.'
  }
  return (
    <Formik
      initialValues={formInit}
      onSubmit={handleSubmit}
      validate={onValidate}
      enableReinitialize={true}
    >
      {(formikProps: FormikProps<FormValues>) => (
        <Container>
            <AutoSave />
            <Header>
              <HeaderRow>
                <div>
                  <BackToDashboard/>
                  <Title>Application Overview</Title>
                  <Logo size="md" logo={fundDetails?.logo} suffixText={fundDetails?.name} />
                </div>
              </HeaderRow>
              <HeaderRow>
                <TabRow>
                  <Tab active>Info</Tab>
                </TabRow>
                {!applicationStatus?.is_locked && <div>
                  <SubmitButton onClick={handleSubmitChanges} className="me-2">
                    Submit Changes
                  </SubmitButton>
                  {applicationRecord && applicationRecord.uuid ? (
                    <WithdrawApplication
                      status={applicationRecord?.status}
                      applicationUuId={applicationRecord.uuid}
                    />
                  ) : (
                    <></>
                  )}
                </div>}
              </HeaderRow>
            </Header>
            <Inner>
              <LeftSidebar>
                <SidebarItem active>
                  Investor Information
                  <CommentCount count={overviewCommentsCount}  title="Investor Information"/>
                </SidebarItem>
                {investmentCard && isEligible && (
                  <SidebarItem key={investmentCard.name}>
                    <ScrollLink to={getSectionId(investmentCard.name)}>
                      {investmentCard.name}
                      <CommentCount count={getCommentsCount(investmentCard)}  title={investmentCard.name}/>
                    </ScrollLink>
                  </SidebarItem>
                )}
                {eligibilityCriteriaCard && (
                  <SidebarItem key={eligibilityCriteriaCard.name}>
                    <ScrollLink to={getSectionId(eligibilityCriteriaCard.name)}>
                      {eligibilityCriteriaCard.name}
                      <CommentCount
                        count={getCommentsCount(eligibilityCriteriaCard)}

                        title={eligibilityCriteriaCard.name}
                      />
                    </ScrollLink>
                  </SidebarItem>
                )}
                {isEligible && <>
                  {application.map(
                  (card) =>
                    card.name && applicationStatusApproved &&
                    ![
                      ELIGIBILITY_CRITERIA_CARD_NAME,
                      INVESTMENT_AMOUNT_CARD_NAME,
                    ].includes(card.name) && (
                      <SidebarItem key={card.name}>
                        <ScrollLink to={getSectionId(card.name)}>
                          {card.name}
                          <CommentCount count={getCommentsCount(card)}  title={card.name}/>
                        </ScrollLink>
                      </SidebarItem>
                    )
                )}
                {applicationStatusApproved &&
                  kycParticipantIds !== null &&
                  Object.keys(participantApplications).length > 0 &&
                  kycRecordParticipants !== null && (
                    <SidebarItem active={activeCard === PARTICIPANTS_CARD_LABEL}>
                      {" "}
                      <ScrollLink to={getSectionId(PARTICIPANTS_CARD_LABEL)}>
                        {PARTICIPANTS_CARD_LABEL}
                      </ScrollLink>
                    </SidebarItem>
                  )}
                {applicationStatusApproved &&
                  kycParticipantIds !== null &&
                  Object.keys(participantApplications).length > 0 &&
                  kycRecordParticipants !== null &&
                  kycParticipantIds!.map((participantId, index) => {
                    const label =
                      kycRecordParticipants[participantId] !== null
                        ? `${kycRecordParticipants[participantId].first_name} ${kycRecordParticipants[participantId].last_name}`
                        : `Participant ${index + 1}`;
                    return (
                      <SidebarSubItem active={activeCard === label}>
                        {" "}
                        <ScrollLink to={getSectionId(label)}>
                          {label}
                          <CommentCount
                            count={get(participantCommentsCount, participantId)}

                            title={label}
                          />
                        </ScrollLink>
                      </SidebarSubItem>
                    );
                  })}
                  {!skipTax && isAllocationApproved && size(taxDocumentsList) > 0 && (
                    <SidebarItem>
                      <ScrollLink to={getSectionId("Tax Forms")}>
                        Tax Forms
                        <CommentCount count={taxCommentsCount}  title="Tax Forms"/>
                      </ScrollLink>
                    </SidebarItem>
                  )}
                  {first(bankingApiData) && (
                    <SidebarItem>
                      <ScrollLink to={getSectionId('Banking Details')}>
                        Banking Details
                        <CommentCount count={bankingCommentsCount}  title="Banking Details"/>
                      </ScrollLink>
                    </SidebarItem>
                  )}
                  {isAllocationApproved && hasFundDocuments && (
                    <SidebarItem>
                      <ScrollLink to={getSectionId('Fund Documents')}>
                        Documents
                        <CommentCount count={(fundDocumentCommentsCount + additionalDocumentPendingRequestsCount)}  title="Fund Documents"/>
                      </ScrollLink>
                    </SidebarItem>
                  )}
                  {isAllocationApproved && (
                    <SidebarItem>
                      <ScrollLink to={getSectionId("POA")}>
                        Program Documents
                        <CommentCount count={programCommentsCount}  title="POA"/>
                      </ScrollLink>
                    </SidebarItem>
                  )}
                  </>
                }
               </LeftSidebar>
               <Content>
                 <FormContainer>
                   <ApplicationStatuses applicationStatus={applicationModuleStats} fundDetails={fundDetails}/>
                   {applicationRecord?.is_application_updated && (
                    <CommentContainer className={"mb-3"}>
                      <DismissButton onClick={onDismissNotification}>
                        &#x274C;
                      </DismissButton>
                      <CommentBadge>
                        Your application has been updated
                      </CommentBadge>
                      <CommentNote>
                        {applicationRecord.withdrawn_comment ? applicationRecord.withdrawn_comment : applicationRecord.update_comment}
                      </CommentNote>
                    </CommentContainer>
                  )}
                   <NextStatus applicationNextState={applicationNextState}/>
                   {applicationStatus?.application_view_editing_disabled && <Alert variant={'warning'}>
                     {readOnlyText}
                   </Alert>}
                  <fieldset disabled={isApplicationLocked}>
                  <CommentsContext.Provider
                    value={{
                      comments: get(
                        commentsByRecord,
                        `${KYC_RECORD}.${appRecords[0]?.kyc_record.id}`
                      ),
                      recordUUID,
                      recordId: kycRecordId,
                      callbackDocumentUpload: handleUploadDouments,
                      fetchKYCRecord: getKYCRecord,
                    }}
                  ><div id={getSectionId( "Investor Information")}>
                    <Overview />
                    </div>
                  </CommentsContext.Provider>
                  {isEligible && investmentCard && <CardContainer className={"mb-3"} id={getSectionId(investmentCard.name)}>
                    <ScrollElement name={getSectionId(investmentCard.name)}>
                      <SubTitle>Investment Amount</SubTitle>
                    </ScrollElement>
                    {investmentCard && (
                      <InvestmentAmount
                        card={investmentCard}
                        commentsByRecord={commentsByRecord}
                        recordUUID={recordUUID}
                        recordId={kycRecordId}
                        getKYCRecord={getKYCRecord}
                        handleUploadDouments={handleUploadDouments}
                      />
                    )}
                  </CardContainer>}
                  {
                    eligibilityCriteriaCard && <CardContainer className={"mb-3"} id={getSectionId(eligibilityCriteriaCard.name)}>
                    <ScrollElement name={getSectionId(eligibilityCriteriaCard.name)}>
                      <SubTitle>Eligibility Criteria</SubTitle>
                    </ScrollElement>
                      {applicationStatus?.has_pre_document_stage && !showModifyEligibilityButton && <div>
                        <ThemeButton
                          var="outlined"
                          onClick={() => {
                            window.location.href = `${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/onboarding${MODIFY_ELIGBILITY}`
                          }}>
                          Modify My Answers Below
                        </ThemeButton>
                      </div>}
                      {showModifyEligibilityButton && <ThemeButton
                      var="outlined"
                      onClick={() => {
                        apiResetComment({
                          module: ELIGIBILITY_CRITERIA,
                          moduleId: appRecords[0]?.eligibility_response,
                        });
                        window.location.href = `${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/onboarding${MODIFY_ELIGBILITY}`
                      }}
                    >
                      Modify My Answers Below
                    </ThemeButton>}
                    {eligibilityCriteriaCard && (
                      <EligibilityCriteria
                        card={eligibilityCriteriaCard}
                        commentsByRecord={commentsByRecord}
                        recordUUID={recordUUID}
                        recordId={kycRecordId}
                        moduleId={appRecords[0]?.eligibility_response}
                        getKYCRecord={getKYCRecord}
                        handleUploadDouments={handleUploadDouments}
                        isDisabled={isApplicationLocked}
                      />
                    )}
                  </CardContainer>
                  }
                  {showAmlKyc && isEligible ? (
                    <>
                      {application.map((card, i) => {
                        if (
                          [
                            ELIGIBILITY_CRITERIA_CARD_NAME,
                            INVESTMENT_AMOUNT_CARD_NAME,
                          ].includes(card.name)
                        )
                          return;
                        const { isEligibilityCard, commentsModule, moduleId } =
                          getModuleDetails(card);
                        let moduleComments = get(
                          commentsByRecord,
                          `${commentsModule}.${moduleId}`
                        );

                        return (
                          <CardContainer key={card.name} id={getSectionId(card.name)}>
                            <ScrollElement name={getSectionId(card.name)}>
                              <Subtitle onClick={() => setActiveCard(card.name)}>
                                {card.name}
                              </Subtitle>
                            </ScrollElement>
                            {i === 0 && applicationStatusApproved && kycCompleted && (
                              <div>
                                <ChangeAnswersButton
                                  onClick={onChangeAMLKYCAnswers}
                                >
                                  Change AML/KYC Answers
                                </ChangeAnswersButton>
                              </div>
                            )}
                            {get(card, "card_id") !==
                              "aml-kyc-individual-personal-information" &&
                            !isEligibilityCard &&
                            !applicationStatusApproved ? (
                              <>
                                {getUnavailableSectionMesage(
                                  i === 0 ? "Entity details" : card.name
                                )}
                              </>
                            ) : (
                              <>
                              
                                {card.schema.map((question) => {
                                  const isFieldEnabled = getIsFieldEnabled(
                                    formikProps.values,
                                    question.field_dependencies
                                  );
                                  if (!isFieldEnabled) return null;
                                  const AnswerInput =
                                    getAnswerInputComponent(question);
                                  let comments = get(
                                    moduleComments,
                                    `${question.id}`
                                  );
                                  if (question.id === AML_SLUG_SELECTION_ID)
                                    comments = get(
                                      moduleComments,
                                      `kyc_investor_type_name`
                                    );

                                  const nonDocumentComments =
                                    comments && comments[""];

                                  return (
                                    <Field key={question.id}>
                                      {(_: FieldProps) => (
                                        <>
                                          <CommentsContext.Provider
                                            value={{
                                              comments,
                                              recordUUID,
                                              recordId: kycRecordId,
                                              callbackDocumentUpload:
                                                handleUploadDouments,
                                              fetchKYCRecord: getKYCRecord,
                                            }}
                                          >
                                            <AnswerInput question={question} disabled={isApplicationLocked}/>
                                          </CommentsContext.Provider>
                                          {Array.isArray(nonDocumentComments) &&
                                            question.type !==
                                              "eligibility_criteria_response" &&
                                            nonDocumentComments?.map(
                                              (comment: any) => (
                                                <CommentWrapper
                                                  key={comment.id}
                                                  comment={comment}
                                                />
                                              )
                                            )}
                                        </>
                                      )}
                                    </Field>
                                  );
                                })}
                              </>
                            )}
                          </CardContainer>
                        );
                      })}
                    </>
                  ) : <>
                  {
                    isEligible ? <CardContainer id={getSectionId("Personal information")}>
                    <ScrollElement
                      className="p-0 pb-4 pt-2"
                      name={getSectionId("Personal information")}
                    >
                      <Subtitle>AML/KYC</Subtitle>
                      AML/KYC will appear later.
                    </ScrollElement>
                  </CardContainer> : null
                  }
                  </>}
                  {kycParticipantIds !== null && isEligible &&
                    Object.keys(participantApplications).length > 0 &&
                    kycRecordParticipants !== null && (
                      <ScrollElement name={getSectionId(PARTICIPANTS_CARD_LABEL)}>
                        <h3>{PARTICIPANTS_CARD_LABEL}</h3>
                        <br />
                      </ScrollElement>
                    )}
                  {!applicationStatusApproved && isEligible && (
                    <div className="pb-4">
                      {getUnavailableSectionMesage(PARTICIPANTS_CARD_LABEL)}
                    </div>
                  )}
                  {applicationStatusApproved &&
                    kycParticipantIds !== null &&
                    Object.keys(participantApplications).length > 0 &&
                    kycRecordParticipants !== null && isEligible &&
                    kycParticipantIds!.map((id) => {
                      const participantSchema = participantApplications[id];
                      const participantAnswers = kycRecordParticipants![id];
                      const idString = id.toString();
                      if (!participantAnswers || !participantSchema) return null;
                      return (
                        <>
                          {" "}
                          <div id={getSectionId(participantSchema.name)}>
                          <ParticipantContainer
                            flush
                            key={id}
                            defaultActiveKey={idString}
                          >
                            <Accordion.Item eventKey={idString} key={idString}>
                            <ScrollElement
                                  name={getSectionId(participantSchema.name)}
                                >
                              <Accordion.Header>
                                  {participantSchema.name}
                              </Accordion.Header>
                              </ScrollElement>
                              <Accordion.Body>
                                <CommentsContext.Provider
                                  value={{
                                    comments: get(
                                      commentsByRecord,
                                      `${PARTICIPANT}.${id}`
                                    ),
                                    recordUUID,
                                    recordId: id,
                                    callbackDocumentUpload: handleUploadDouments,
                                    fetchKYCRecord: getKYCRecord,
                                  }}
                                >
                                  <SchemaContainer
                                    recordId={id}
                                    schema={participantSchema.schema}
                                    key={id}
                                    initialValues={participantAnswers}
                                    isParticipant={true}
                                    innerRef={participantRefs}
                                    onStatusChange={dispatchParticipantForms}
                                    onSubmit={(values, helpers) =>
                                      submitParticipantForm(values, helpers, id)
                                    }
                                    recordComments={get(
                                      commentsByRecord,
                                      `${PARTICIPANT}.${id}`
                                    )}
                                  />
                                </CommentsContext.Provider>
                              </Accordion.Body>
                            </Accordion.Item>
                          </ParticipantContainer>
                          </div>
                          <br />
                        </>
                      );
                    })}

                  {isAllocationApproved && <>
                    {!skipTax && <ScrollElement
                    className="p-0 pb-4 pt-2"
                    name={getSectionId("Tax Forms")}
                    id={getSectionId("Tax Forms")}

                  >
                    <TaxDocuments isApplicationLocked={isApplicationLocked} />
                   </ScrollElement>}
                   <ScrollElement className="p-0 pb-4" name={getSectionId("Banking Details")} id={getSectionId("Banking Details")}>
                     <BankingDetails
                       callbackSubmit={callbackSubmitPOA}
                       taxDocumentsSigned={applicationStatus?.are_tax_documents_signed}
                       disabled={isApplicationLocked}
                     />
                   </ScrollElement>
                    {isAllocationApproved && <ScrollElement className="p-0 pb-4" name={getSectionId("Fund Documents")} id={getSectionId("Fund Documents")}>
                     <FundDocuments callbackFundDocumentStatus={setHasFundDocuments} />
                   </ScrollElement>}
                    {isAllocationApproved && <ScrollElement className="p-0 pb-4" name={getSectionId("POA")} id={getSectionId("POA")}>
                     <ProgramDoc isApplicationView={true} callbackSubmitPOA={callbackSubmitPOA} />
                   </ScrollElement>}
                    </>
                  }
                  </fieldset>
                 </FormContainer>
               </Content>
             </Inner>
             <NotificationModal
               title={notification?.title}
               showModal={notification?.show}
               handleClose={() => setNotification(notificationConfig.default)}
             >
               {notification?.msg}
             </NotificationModal>
             <ReplyModal
                title="Reply to Comment"
                showModal={replyModal.show}
                handleClose={() => dispatch(setIsReplyModalOpen(initReplyModal))}
             />
         </Container>
       )}
     </Formik>
   );
};

export default ApplicationView;
