import { useEffect, useState } from "react";
import { PageContainer, TopRow, TopButton, Title, DangerButton } from "../styles";
import {
  COMMITMENT_SOURCE_ID_PARAM,
  COMMITMENT_SOURCE_TYPE_PARAM,
} from "../../constants";
import { Breadcrumb } from "react-bootstrap";
import CommitmentModal from "./components/CommitmentModal";
import API from "../../../../api/backendApi";
import CommitmentsListView from "./components/CommitmentsListView";
import isEmpty from "lodash/isEmpty";
import CommitmentDetailPage from "./components/CommitmentDetailView";
import NavableLoader from "../../../../components/NavableLoader";
import ConfirmationModal from "../../../Funds/components/FundsList/ConfirmationModal";
import { toast } from "react-toastify";

const CommitmentsPage = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [commitToView, setCommitToView] = useState<{
    id?: string;
    type?: string;
  }>({});

  const [commitDetail, setCommitDetail] = useState<Record<string, any>>({});
  const [commitsList, setCommitsList] = useState<any[]>([]);
  const [commitmentToDelete, setCommitmentToDelete] = useState<Record<string, any> | null>(null)

  const handleCloseModal = (refetch = false) => {
    if (!commitToView.id) {
      setCommitDetail({});
      if (refetch) handleFetchAllCommits();
    } else {
      if (refetch) handleFetchCommitDetails(commitToView);
    }
    setShowModal(false);
  };
  const handleFetchAllCommits = async () => {
    const res = await API.fetchAllCommitments();
    if (res.success) {
      setCommitsList(res.data);
    }
  };

  const handleFetchCommitDetails = async (commitment: any) => {
    const { id, type } = commitment;
    const res = await API.fetchCommitmentDetail(id, type);
    if (res.success) {
      setCommitDetail(res.data);
    } else {
      resetCommitParam();
    }
  };

  const resetCommitParam = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(COMMITMENT_SOURCE_ID_PARAM);
    searchParams.delete(COMMITMENT_SOURCE_TYPE_PARAM);
    window.history.replaceState({}, "", `?${searchParams.toString()}`);
    setCommitToView({});
    setCommitDetail({});
  };

  const handleDeleteCommitment = async () => {
    if(commitmentToDelete) {
      const res = await API.deleteCommitment(commitmentToDelete.id, commitmentToDelete.type);
    if (res.success) {
      setCommitmentToDelete(null);
      resetCommitParam();
      handleFetchAllCommits();
      toast.success(`Commitment updated successfully!!`);
    }
    else {
      toast.error(`Commitment could not be deleted`);
    }
    }
  }

  useEffect(() => {
    if (commitToView.id) {
      handleFetchCommitDetails(commitToView);
    }
  }, [commitToView]);

  useEffect(() => {
    handleFetchAllCommits();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsSourceId = searchParams.get(COMMITMENT_SOURCE_ID_PARAM);
    const paramsSourceType = searchParams.get(COMMITMENT_SOURCE_TYPE_PARAM);

    if (paramsSourceId && paramsSourceId !== commitToView.id) {
      setCommitToView((prev: any) => ({ ...prev, id: paramsSourceId }));
    }
    if (paramsSourceType && paramsSourceType !== commitToView.type) {
      setCommitToView((prev: any) => ({ ...prev, type: paramsSourceType }));
    } else if (
      !(Boolean(paramsSourceId) && Boolean(paramsSourceType)) &&
      commitToView.id &&
      commitToView.type
    ) {
      searchParams.set(COMMITMENT_SOURCE_ID_PARAM, commitToView.id);
      searchParams.set(COMMITMENT_SOURCE_TYPE_PARAM, commitToView.type);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
  }, [commitToView]);

  return (
    <PageContainer>
      <TopRow>
        <Title>Commitments</Title>
        {commitToView.id ? (
          <div>
          <TopButton
            onClick={() => setShowModal(true)}
          >
            Edit Commitment
          </TopButton>
          <DangerButton onClick={() => setCommitmentToDelete(commitToView)}>
          Delete Commitment
        </DangerButton>
          </div>
        ) : (
          <TopButton onClick={() => setShowModal(true)}>
            Create New Commitment
          </TopButton>
        )}
      </TopRow>
      <Breadcrumb>
        {[
          "Carry Management",
          "Commitments",
          commitToView?.id && commitDetail?.source_name,
        ]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item
              key={elem}
              onClick={() => (i === 1 ? resetCommitParam() : null)}
            >
              {elem}
            </Breadcrumb.Item>
          ))}
      </Breadcrumb>
      {!commitToView?.id ? (
        <CommitmentsListView
          commitsList={commitsList}
          handleSelectCommitToView={(_commitment: any) =>
            setCommitToView({
              id: _commitment.source_external_id,
              type: _commitment.source_type,
            })
          }
        />
      ) : !isEmpty(commitDetail) ? (
        <CommitmentDetailPage commitDetail={commitDetail} />
      ) : <NavableLoader/>}
      {showModal && <CommitmentModal initState={commitDetail} handleCloseModal={handleCloseModal} />}
      {
        commitmentToDelete && <ConfirmationModal
        title="Delete Commitment"
        showModal={true}
        handleClose={() => setCommitmentToDelete(null)}
        handleSubmit={handleDeleteCommitment}
        submitLabel={'Delete'}
      >
        <h6>Are you sure you want to delete this commitment?</h6>
      </ConfirmationModal>
      }
    </PageContainer>
  );
};

export default CommitmentsPage;
