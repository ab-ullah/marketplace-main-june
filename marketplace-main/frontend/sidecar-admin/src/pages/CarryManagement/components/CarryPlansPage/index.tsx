import { Breadcrumb } from "react-bootstrap";
import { toast } from "react-toastify";
import { PageContainer, Title, TopButton, TopRow, SecondaryButton, OutlinedButton, ButtonsCont, PillButton, StatusPill} from "../styles";
import CarryPlanModal from "./components/CarryPlanModal";
import { useEffect, useState } from "react";
import API from "../../../../api/backendApi";
import CarryPlansListView from "./components/CarryPlansListView";
import CarryPlanDetailView from "./components/CarryPlanDetailView";
import { carryPlanOptions, carryPlanStatus, formatFundCarryPlanAndAllocations, formatFundCarryPlansList } from "./constants";
import { getPillColor, PLAN_ID_PARAM } from "../../constants";
import { get, isEmpty } from "lodash";
import { MODAL_MODE } from "./components/CarryPlanModal/constants";
import CarryDiluteModal from "./components/CarryDiluteModal";
import { useGetCarryHurdleFlagQuery, useGetCarryPublishFlowFlagQuery } from "../../../../api/rtkQuery/commonApi";
import CarryPublishModal from "./components/CarryPublishModal";
import CarryHurdleModal from "./components/CarryHurdleModal";

const CarryPlansPage = () => {
  const [carryPlansData, setCarryPlansData] = useState<any>({});
  const [carryPlanDetail, setCarryPlanDetail] = useState<Record<string, any>>({});
  const [planToView, setPlanToView] = useState<string | null>(null);
  const [showCarryPlanModal, setShowCarryPlanModal] = useState<string>(MODAL_MODE.NONE);
  const [showCarryDiluteModal, setShowCarryDiluteModal] = useState<boolean>(false);
  const [showCarryPublishModal, setShowCarryPublishModal] = useState<boolean>(false);
  const [showCarryHurdleModal, setShowCarryHurdleModal] = useState<boolean>(false);
  const [approvalDisabled, setApprovalDisabled] = useState(false)

  const {data: carryPublishFlowFlag} = useGetCarryPublishFlowFlagQuery()
  const {data: carryHurdleFlag} = useGetCarryHurdleFlagQuery()
  const publishFlagActive = Boolean(carryPublishFlowFlag?.is_active)
  const hurdleEnabled = Boolean(carryHurdleFlag?.is_active)

  const handleCloseModal = (planId:string) => {
    if(!planToView) setCarryPlanDetail({});
    setShowCarryPlanModal(MODAL_MODE.NONE);
    if(planId) setPlanToView(planId)
  };

  const handleCloseDilutionModal = () => {
    setShowCarryDiluteModal(false)
  }

  const handleCloseHurdleModal = (refetch=false) => {
    setShowCarryHurdleModal(false)
    if(refetch){
      handleFetchCarryPlans();
      if (planToView) handleFetchCarryPlanAndAllocations(planToView);
    }
  }

  const handleClosePublishModal = (refetch=false) => {
    if(refetch){
      handleFetchCarryPlans();
      if (planToView) handleFetchCarryPlanAndAllocations(planToView);
    }
    setShowCarryPublishModal(false)
  }

  const handleFetchCarryPlanAndAllocations = async (planId: string) => {
    const res = await API.fetchCarryPlanAndAllocations(planId);
    if (res.success) {
      setCarryPlanDetail(formatFundCarryPlanAndAllocations(res.data));
    }
    else {
      resetFundParam()
    }
  };

  const handleFetchCarryPlans = async () => {
    const res = await API.fetchCarryPlans();
    if (res.success) {
      setCarryPlansData((prev:any)=>({...prev,carryPlans: formatFundCarryPlansList(res.data)}));
    }
  };

  const handleFetchFirmOverview = async() =>{
    const res = await API.fetchCarryPlanFirmOverview();
    if (res.success) {
      setCarryPlansData((prev:any)=>({...prev,firmOverview:res.data}))
    }
  }

  const resetFundParam = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(PLAN_ID_PARAM);
    window.history.replaceState({}, "", `?${searchParams.toString()}`);
    setPlanToView(null);
    setCarryPlanDetail({});
  };

  const handleSubmitForApproval = async(planId:string)=>{
    setApprovalDisabled(true)
    const res = await API.submitForApprovalCarryPlan(planId)
    if(res.success){
      if (res.data?.has_errors) {
        toast.error(res.data?.msg);
        setApprovalDisabled(false)
      } else {
        toast.success(res.data?.msg);
      }
      handleFetchCarryPlans();
      if (planToView) handleFetchCarryPlanAndAllocations(planToView);    
    }
    else{
      setApprovalDisabled(false)
    }
  }

  useEffect(() => {
    if (planToView) handleFetchCarryPlanAndAllocations(planToView);
  }, [planToView]);

  useEffect(() => {
    handleFetchCarryPlans();
    handleFetchFirmOverview()
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsPlan = searchParams.get(PLAN_ID_PARAM);
  
    if (paramsPlan && paramsPlan !== planToView) {
      setPlanToView(paramsPlan);
    } else if (!paramsPlan && planToView) {
      searchParams.set(PLAN_ID_PARAM, planToView);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
  }, [planToView]);

  return (
    <PageContainer>
      <TopRow>
        <div className="d-flex align-items-center">
        <Title>Carry Plans</Title>
        {!isEmpty(carryPlanDetail) && carryPublishFlowFlag?.is_active && ( <StatusPill style={{fontSize:'14px'}} color={getPillColor(get(carryPlanDetail,'status'))}>{get(carryPlanDetail,'status')}</StatusPill>)}
        </div>

        {planToView ? (
          !isEmpty(carryPlanDetail) && (
            <ButtonsCont>
              <PillButton
                borderColor="#4A47A3"
                color="#4A47A3"
                font={{"font-size":"14px", "font-family":"Quicksand Bold"}}
                onClick={() =>
                  setShowCarryPlanModal(MODAL_MODE.ADD_ALLOCATIONS)
                  }
                  >
                    + Issue New Allocation
                  </PillButton>
              {carryPlanDetail?.allocations?.length>0 &&
              <>
              <PillButton
                borderColor="#CFD8DC"
                color="#4A47A3"
                borderWidth="1px"
                font={{"font-size":"14px", "font-family":"Quicksand Bold"}}
                onClick={() =>
                  setShowCarryPlanModal(MODAL_MODE.EDIT_ALLOCATIONS)
                  }
                  >
                    Edit Current Allocation
                  </PillButton>
                  <PillButton
                borderColor="#CFD8DC"
                color="#4A47A3"
                borderWidth="1px"
                font={{"font-size":"14px", "font-family":"Quicksand Bold"}}
                onClick={() =>
                  setShowCarryDiluteModal(true)
                  }
                  >
                    New Dilution
                  </PillButton>
                  {hurdleEnabled &&
                  <PillButton
                borderColor="#CFD8DC"
                color="#4A47A3"
                borderWidth="1px"
                font={{"font-size":"14px", "font-family":"Quicksand Bold"}}
                onClick={() =>
                  setShowCarryHurdleModal(true)
                  }
                  >
                    New Hurdle
                  </PillButton>}
              </>
}
          {carryPlanDetail?.status === carryPlanStatus.APPROVED && publishFlagActive &&
              <PillButton
                borderColor="#4A47A3"
                color="white"
                borderWidth="1px"
                background="#4A47A3"
                font={{"font-size":"14px", "font-family":"Quicksand Bold"}}
                onClick={()=>setShowCarryPublishModal(true)}
                  >
                    Publish
                  </PillButton>
            }
            
            {carryPlanDetail?.status === carryPlanStatus.UNPUBLISHED_CHANGE &&
              <PillButton
              borderColor="#CFD8DC"
              color="#4A47A3"
              borderWidth="1px"
              font={{"font-size":"14px", "font-family":"Quicksand Bold"}}
              onClick={()=>handleSubmitForApproval(carryPlanDetail?.carryPlanId)}
              disabled={approvalDisabled}
                >
                  Submit For Approval
                </PillButton>
            }
            </ButtonsCont>
          )
        ) : (
          <TopButton onClick={() => setShowCarryPlanModal(MODAL_MODE.CREATE_CARRY_PLAN)}>
            Create Carry Plan
          </TopButton>
        )}
      </TopRow>
      <Breadcrumb>
        {[
          "Carry Management",
          "Carry Plans",
          planToView && carryPlanDetail?.name,
        ]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item
              onClick={() => (i === 1 ? resetFundParam() : null)}
            >
              {elem}
            </Breadcrumb.Item>
          ))}
      </Breadcrumb>
      {!planToView ? (
        <CarryPlansListView
        carryPlansData={carryPlansData}
          handleSelectPlanToView={(planId: any) => setPlanToView(planId)}
          publishFlagActive={publishFlagActive}
        />
      ) : (
        <CarryPlanDetailView hurdleEnabled={hurdleEnabled} carryPlanDetail={carryPlanDetail} refetchCarryDetail={()=>handleFetchCarryPlanAndAllocations(planToView)}/>
      )}

      {showCarryPlanModal && (
        <CarryPlanModal
          mode ={showCarryPlanModal}
          carryPlanOptions={carryPlanOptions(carryPlansData?.carryPlans, planToView)}
          handleCloseModal={handleCloseModal}
          handlePublish={()=>setShowCarryPublishModal(true)}
          publishFlagActive={publishFlagActive}
          initState={carryPlanDetail}
          refreshData={(planId: string, nextStep:boolean) => {
            if(planToView || (nextStep && showCarryPlanModal)) handleFetchCarryPlanAndAllocations(planId);
            handleFetchCarryPlans();
          }}
        />
      )}

      {showCarryDiluteModal && (
        <CarryDiluteModal
          initState={carryPlanDetail}
          handleCloseModal={handleCloseDilutionModal}
          refreshData={(planId: string) => {
             handleFetchCarryPlanAndAllocations(planId);
            handleFetchCarryPlans();
          }}
        />
      )}

      {showCarryPublishModal && (
        <CarryPublishModal
        handleCloseModal={handleClosePublishModal}
        carryDetail={carryPlanDetail}
        />
      )}
      
      {showCarryHurdleModal &&
      <CarryHurdleModal
        handleCloseModal={handleCloseHurdleModal}
        carryPlanDetail={carryPlanDetail}
      />}

    </PageContainer>
  );
};

export default CarryPlansPage;
