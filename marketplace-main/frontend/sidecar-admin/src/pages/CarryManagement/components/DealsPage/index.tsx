import { Breadcrumb } from "react-bootstrap";
import { PageContainer, PillButton, Title, TopButton, TopRow } from "../styles";
import DealsListView from "./components/DealsListView";
import DealModal from "./components/DealModal";
import { useEffect, useState } from "react";
import API from "../../../../api/backendApi";
import { DEAL_ID_PARAM } from "../../constants";
import DealDetailView from "./components/DealDetailView";

const DealsPage = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dealToView, setDealToView] = useState<string | null>(null);
  const [dealDetail, setDealDetail] = useState<Record<string, any>>({});
  const [dealsList, setDealsList] = useState<any[]>([]);
  const handleCloseModal = () => {
    if(!dealToView) setDealDetail({});
    setShowModal(false);
  };
  const handleFetchAllDeals = async () => {
    const res = await API.fetchAllDeals();
    if (res.success) {
      setDealsList(res.data);
    }
  };

  const handleUpdateDealsList = (newDeal: Record<string, any>) => {
    if (dealToView) {
      handleFetchDealDetails(dealToView)
      setDealsList((prev)=> prev.map((deal) => {
        if (deal.id === newDeal.id) {
          return newDeal;
        }
        return deal;
      }))
    } else {
      setDealsList((prev) => [newDeal, ...prev]);
    }
  };

  const handleFetchDealDetails=async(dealId:any)=>{
    const res = await API.fetchCarryDealAllocationsById(dealId)
    if(res.success){
      setDealDetail(res.data)
    }
    else{
      resetDealParam()
    }
  }

  const resetDealParam = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(DEAL_ID_PARAM);
    window.history.replaceState({}, "", `?${searchParams.toString()}`);
    setDealToView(null);
    setDealDetail({});
  };

  const getInitState=()=>{
    if(dealDetail?.deal?.id){
      const { fund_name, fund_external_id, id}= dealDetail?.deal
      return {
        ...dealDetail.deal,
        dealId: id,
        fund: fund_external_id? {label: fund_name, value:fund_external_id}:null,
      }
    }
    else return null
  }

  useEffect(() => {
    if (dealToView) {
      handleFetchDealDetails(dealToView)
    };
  }, [dealToView]);

  useEffect(() => {
    handleFetchAllDeals();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsPlan = searchParams.get(DEAL_ID_PARAM);
  
    if (paramsPlan && paramsPlan !== dealToView) {
      setDealToView(paramsPlan);
    } else if (!paramsPlan && dealToView) {
      searchParams.set(DEAL_ID_PARAM, dealToView);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
  }, [dealToView]);

  return (
    <PageContainer>
      <TopRow>
        <Title>Deals</Title>
        {dealToView ? (
          <PillButton onClick={() => setShowModal(true)} color="#4A47A3" borderColor="#4A47A3" style={{fontSize:'16px'}}>
            Edit Deal
          </PillButton>
        ) : (
          <TopButton onClick={() => setShowModal(true)}>
            Create New Deal
          </TopButton>
        )}
      </TopRow>
      <Breadcrumb>
        {["Carry Management", "Deals", dealToView && dealDetail?.deal?.name]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item
              key={elem}
              onClick={() => (i === 1 ? resetDealParam() : null)}
            >
              {elem}
            </Breadcrumb.Item>
          ))}
      </Breadcrumb>
      {!dealToView ? (
        <DealsListView
          dealsList={dealsList}
          handleSelectDealToView={(dealId: any) => setDealToView(dealId)}
        />
      ) :
      Object.keys(dealDetail).length? (
        <DealDetailView dealDetail={dealDetail} goBack={resetDealParam}/>
      ): null
    }
      {showModal && (
        <DealModal
          handleCloseModal={handleCloseModal}
          handleUpdateDealsList={handleUpdateDealsList}
          initState={getInitState()}
        />
      )}
    </PageContainer>
  );
};

export default DealsPage;
