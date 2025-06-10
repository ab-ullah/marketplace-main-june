import { Breadcrumb } from "react-bootstrap";
import { DangerButton, PageContainer, Title, TopButton, TopRow } from "../styles";
import { DISTRIBUTION_ID_PARAM } from "../../constants";
import { useEffect, useState } from "react";
import DistributionModal from "./components/DistributionModal";
import API from "../../../../api/backendApi";
import DistributionsListView from "./components/DistributionsListView";
import DistributionDetailView from "./components/DistributionDetailView";
import ConfirmationModal from "../../../Funds/components/FundsList/ConfirmationModal";

const DistributionsPage = () => {
  const [distributionsData, setDistributionsData] = useState<any>({});
  const [distDetail, setDistDetail] = useState<Record<string, any>>({});
  const [distToView, setDistToView] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [distributionToDelete, setDistributionToDelete] = useState<Record<string, any> | null>();

  const handleFetchDistributions = async () => {
    const res = await API.fetchDistributionsList();
    if (res.success) {
      setDistributionsData(res.data);
    }
  };

  const handleFetchDistributionDetail = async (id: string) => {
    const res = await API.fetchDistributionDetail(id as string);
    if (res.success) {
      setDistDetail(res.data);
    } else {
      resetDistributionParam();
    }
  };

  const resetDistributionParam = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(DISTRIBUTION_ID_PARAM);
    window.history.replaceState({}, "", `?${searchParams.toString()}`);
    setDistToView(null);
    setDistDetail({});
  };

  const handleCloseModal = (distId: string) => {
    if (!distToView) setDistDetail({});
    setShowModal(false);
    if (distId) setDistToView(distId);
  };

  const handleDeleteDistribution = async () => {
    if(distributionToDelete) {
      await API.deleteDistribution(distributionToDelete.id)
      setDistributionToDelete(null)
      resetDistributionParam()
      handleFetchDistributions()
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsDist = searchParams.get(DISTRIBUTION_ID_PARAM);

    if (paramsDist && paramsDist !== distToView) {
      setDistToView(paramsDist);
    } else if (!paramsDist && distToView) {
      searchParams.set(DISTRIBUTION_ID_PARAM, distToView);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
  }, [distToView]);

  useEffect(() => {
    handleFetchDistributions();
  }, []);

  useEffect(() => {
    if (distToView) handleFetchDistributionDetail(distToView);
  }, [distToView]);
  return (
    <PageContainer>
      <TopRow>
        <Title>Distributions</Title>
        {!distToView ? (
          <TopButton onClick={() => setShowModal(true)}>
            Create New Distribution
          </TopButton>
        ) : (
          distDetail?.source && (
            <div>
            <TopButton onClick={() => setShowModal(true)}>
              Edit Distribution
            </TopButton>
            <DangerButton onClick={() => setDistributionToDelete(distDetail)}>
              Delete Distribution
            </DangerButton>
            </div>
          )
        )}
      </TopRow>
      <Breadcrumb>
        {["Carry Management", "Distributions", distToView && distDetail?.source]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item
              onClick={() => (i === 1 ? resetDistributionParam() : null)}
            >
              {elem}
            </Breadcrumb.Item>
          ))}
      </Breadcrumb>
      {!distToView ? (
        <DistributionsListView
          distributionsData={distributionsData}
          handleSelectDistToView={(distId: any) => setDistToView(distId)}
        />
      ) : (
        <DistributionDetailView distDetail={distDetail} />
      )}
      {showModal && (
        <DistributionModal
          handleCloseModal={handleCloseModal}
          initState={distDetail}
          refreshData={(distId:string)=>{
            if(distToView) handleFetchDistributionDetail(distId)
            handleFetchDistributions();
          }}
        />
      )}
      {
        distributionToDelete && <ConfirmationModal
        title={`Delete: ${distributionToDelete.source}`}
        showModal={true}
        handleClose={() => setDistributionToDelete(null)}
        handleSubmit={handleDeleteDistribution}
        submitLabel={'Delete'}
      >
        <h6>Are you sure you want to delete distribution for source: <i>{distributionToDelete.source}</i></h6>
      </ConfirmationModal>
      }
    </PageContainer>
  );
};

export default DistributionsPage;
