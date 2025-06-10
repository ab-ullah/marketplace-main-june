import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {selectApplicationInfo} from "./selectors";
import {useParams} from "react-router-dom";
import {clearKYCState} from "./kycSlice";
import {clearTaxState} from "./taxRecordsSlice";
import {
  createApplicationDocumentRequest,
  fetchApplicationDocumentRequests,
  fetchApplicationDocumentRequestsResponse,
  fetchApplicationInfo,
  fetchCommentsByApplicationId,
  fetchCommentsByKycRecordId,
  fetchFundAgreements,
  fetchKYCRecords,
} from "./thunks";
import KnowYourCustomer from "./index";
import EditApplicant from "../FundSetup/components/ApplicantsList/EditApplicant";
import RequestDocument from './components/DocumentRequestModal';
import {ITaskDetail} from "../../interfaces/Workflow/task";
import {Container} from "../../components/ScreenError/styles";
import { useGetOnboardingCustomTextQuery } from "../../api/rtkQuery/commonApi";
import {generateStatus} from "../FundSetup/components/utils";

interface ApplicationInfoProps {
  userApplicationId?: string;
  externalId?: string;
  taskDetail?: ITaskDetail;
}

const ApplicationInfo: FunctionComponent<ApplicationInfoProps> = ({userApplicationId, externalId, taskDetail}) => {
  const [showApplicantDetails, setShowApplicantDetails] = useState(false);
  const [showAddDocumentRequest, setShowAddDocumentRequest] = useState(false)
  const dispatch = useAppDispatch();
  const params = useParams<{externalId: string; applicationId: string;}>();
  const applicationInfo = useAppSelector(selectApplicationInfo);
  let applicationId: string;
  if (userApplicationId) {
    applicationId = userApplicationId;
  }else {
    applicationId = params.applicationId
  }
  useGetOnboardingCustomTextQuery(undefined)

  const fetchApplicant = useCallback(
    () => dispatch(fetchApplicationInfo(parseInt(applicationId))),
    [applicationId, dispatch]
  );

  const fetchAdditionalDocumentsRequests = useCallback(
    () => dispatch(fetchApplicationDocumentRequests(parseInt(applicationId))),
    [applicationId, dispatch]
  );

  const fetchAdditionalDocumentsResponse = useCallback(
    () => dispatch(fetchApplicationDocumentRequestsResponse(parseInt(applicationId))),
    [applicationId, dispatch]
  );

  const fetchAgreementsList = useCallback(
    () => {
      dispatch(fetchFundAgreements(applicationId))
    },
    [applicationInfo, dispatch]
  )

  const fetchKycRecord = useCallback(() => {
    if (applicationInfo?.kyc_record && applicationInfo?.kyc_wf_slug) {
      dispatch(
        fetchKYCRecords({
          workflowSlug: applicationInfo?.kyc_wf_slug,
          recordId: applicationInfo?.kyc_record,
          applicationId: applicationInfo?.id
        })
      );
    }
  }, [applicationInfo, dispatch]);

  useEffect(() => {
    fetchKycRecord()
  }, [fetchKycRecord])

  useEffect(() => {
    fetchApplicant();
  }, [fetchApplicant]);

  useEffect(() => {
    fetchAdditionalDocumentsRequests();
  }, [ fetchAdditionalDocumentsRequests ])

  useEffect(() => {
    dispatch(fetchCommentsByApplicationId(parseInt(applicationId)));
  }, [ fetchCommentsByApplicationId ])

  useEffect(() => {
    if (applicationInfo?.kyc_record) {
      dispatch(fetchCommentsByKycRecordId(applicationInfo.kyc_record));
    }
  }, [ fetchCommentsByKycRecordId, applicationInfo ])

  useEffect(() => {
    fetchAdditionalDocumentsResponse()
  }, [ fetchAdditionalDocumentsResponse ])

  useEffect(() => {
    fetchAgreementsList()
  }, [fetchAgreementsList])


  const callbackSaveEditApplicant = () => {
    fetchApplicant();
    setShowApplicantDetails(false);
  };

  const createApplicationDocumeentRequest = (values: any) => {
    dispatch(createApplicationDocumentRequest({
      application_id: parseInt(applicationId),
      ...values
    })).then(() => {
      dispatch(fetchApplicationDocumentRequests(parseInt(applicationId)));
      setShowAddDocumentRequest(false);
    })
  }

  useEffect(() => {
    return () => {
      dispatch(clearKYCState());
      dispatch(clearTaxState());
    }
  }, [])

  if (!applicationInfo ) return<>
    <Container>
      <br/>
      <div>Retrieving application...</div>
    </Container>
  </>;

  const applicationStatusDetails = generateStatus(applicationInfo?.status_detail ? applicationInfo.status_detail : {})
  const applicationDetailsWithStatus = {
    ...applicationInfo,
    ...applicationStatusDetails,
  }

  return (
    <>
      <KnowYourCustomer
        externalId={externalId || params.externalId}
        handleEditCustomer={() => setShowApplicantDetails(true)}
        handleAddDocumentRequest = {() => setShowAddDocumentRequest(true)}
        recordId={applicationInfo.kyc_record}
        kyc_wf_slug={applicationInfo.kyc_wf_slug}
        eligibilityResponseId={applicationInfo.eligibility_response}
        applicationId={parseInt(applicationId)}
        taxRecordId={applicationInfo.tax_record}
        paymentDetail={applicationInfo.payment_detail}
        taskDetail={taskDetail}
      />
      <Modal
        size={"lg"}
        show={showApplicantDetails}
        onHide={() => setShowApplicantDetails(false)}
      >
        <Modal.Header>
          <Modal.Title>Edit Applicant</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {showApplicantDetails && (
            <EditApplicant
              paginationFooter={``}
              handlePrev={false}
              handleNext={false}
              data={applicationDetailsWithStatus}
              callbackSaveEditApplicant={callbackSaveEditApplicant}
              handleClose={() => setShowApplicantDetails(false)}
            />
          )}
        </Modal.Body>
      </Modal>
      <Modal
        size={"lg"}
        show={showAddDocumentRequest}
        onHide={() => setShowAddDocumentRequest(false)}
      >
        <Modal.Header>
          <Modal.Title>Request Document</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <RequestDocument 
            handleClose={() => setShowAddDocumentRequest(false)}
            onSubmit = {createApplicationDocumeentRequest}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ApplicationInfo;
