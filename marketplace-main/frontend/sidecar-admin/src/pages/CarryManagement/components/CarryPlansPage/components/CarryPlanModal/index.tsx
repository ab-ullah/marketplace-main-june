import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { DangerButton, OutlinedButton, SecondaryButton } from "../../../styles";
import CarryPlanForm from "./components/CarryPlanForm";
import CustomTabsStepper from "./components/CustomTabsStepper";
import { tabsStepperConfig, TABS, generateCarryPlanPayload, generateCarryAllocationsPayload, validateCarryPlanData, getModalTitle, MODAL_MODE } from "./constants";
import API from "../../../../../../api/backendApi";
import { toast } from "react-toastify";
import { get, isEmpty, isEqual } from "lodash";
import { planFromScratch } from "./components/CarryPlanForm/components/CarryPlanStep";
import { getSumByProperty } from "../../../../../../utils/getValue";
import { FullPageModal } from "./styles";
import { carryPlanStatus } from "../../constants";
import ConfirmationModal from "../../../../../../components/ConfirmationModal";

interface ICarryPlanModal {
  carryPlanOptions: any[];
  handleCloseModal: (planId:string)=>void
  handlePublish: (planId:string)=>void
  publishFlagActive: boolean
  initState:Record<string,any>;
  refreshData:(_planId:string,_fetchDetails:boolean)=>void
  mode: string;
}

const CarryPlanModal = ({
  carryPlanOptions,
  handleCloseModal,
  handlePublish,
  publishFlagActive,
  initState,
  refreshData,
  mode
}: ICarryPlanModal) => {
  const [tab, setTab] = useState("");
  const [state, setState] = useState<Record<string, any>>({starting_template:planFromScratch,funds_and_deals:[]});
  const [errors, setErrors] = useState<any>({});
  const [isLoading,setIsLoading] = useState(false)
  const currentTabIndex = useMemo(
    () => tabsStepperConfig.findIndex((_tab) => _tab.key === tab),
    [tab]
  );

  const gotoNextStep = () => {
    if (currentTabIndex + 1 !== tabsStepperConfig.length)
      setTab(tabsStepperConfig[currentTabIndex + 1].key);
  };

  const handleNext = async () => {
    const success = await handleDraft(true,false);
    if (success) gotoNextStep();
  };

  const handlePublishChanges = ()=>{
     handleDraft(false,true)
  }

  const handleDraft = async (nextStep:boolean, publishChanges:boolean) => {
    let success = true;
    let showToast = true;
    let errMsg='';
    setIsLoading(true)
    let planId =state.carryPlanId || ''
    if (!isEqual(initState, state)) {   
      switch (tab) {
        case TABS.CARRY_PLAN:
          {
            const errors = validateCarryPlanData(state);
            console.log(errors,'caarry plan step 1 errors')
            if(isEmpty(errors)){
            const payload = generateCarryPlanPayload(state, [MODAL_MODE.ADD_ALLOCATIONS, MODAL_MODE.EDIT_ALLOCATIONS].includes(mode));
            const res = planId
              ? await API.updateCarryPlan(planId, payload)
              : await API.createCarryPlan(payload);
            if(!planId) planId=res.data.id
            success = res.success;
            }
            else {
              setErrors(errors)
              success = false;
              showToast = false;
            }
          }
          break;
        case TABS.CARRY_ALLOCATIONS:
            const payload = generateCarryAllocationsPayload(state,mode);
            const res = await API.createCarryPlanAllocations(
              planId,
              payload
            );
            success = res.success;
          break;
      }
      if (success) {
        if(publishChanges){
          handlePublish(planId)
        }
        else{
        refreshData(planId,nextStep)};
      }
    }
    else{
      if(get(state,'status')===carryPlanStatus.APPROVED && publishChanges){
        handlePublish(planId)
      }
    }
    if (success) {
      if(!nextStep) handleCloseModal(planId)
      showToast && toast.success(publishChanges ? "Changes Published" : "Saved to draft");
    } else {
      showToast && toast.error(errMsg || "Request failed");
    }
    setIsLoading(false)
    return success;
  };

  useEffect(()=>{
    if(!isEmpty(initState)){ 
      setState(initState)
      setTab(TABS.CARRY_ALLOCATIONS)
    }
    else{
      setTab(TABS.CARRY_PLAN)
    }
  },[initState])
console.log(state,'state')
  return (
    <>
      <FullPageModal size={"xl"} show={true} onHide={() => handleCloseModal(state.carryPlanId || '')}>
        <FullPageModal.Header closeButton>
          <FullPageModal.Title>{getModalTitle(mode)}</FullPageModal.Title>
        </FullPageModal.Header>
        <CustomTabsStepper tabs={tabsStepperConfig} activeTab={tab} handleChange={isEmpty(initState)?null:setTab}/>
        <FullPageModal.Body>
          <CarryPlanForm
            mode={mode}
            tab={tab}
            state={state}
            errors={errors}
            setState={setState}
            setErrors={setErrors}
            carryPlanOptions={carryPlanOptions}
            refreshData={refreshData}
            handleCloseModal={handleCloseModal}
          />
        </FullPageModal.Body>
        <FullPageModal.Footer>
          <OutlinedButton onClick={()=>handleDraft(false,false)} disabled={isLoading}>Save</OutlinedButton>
          {tabsStepperConfig.length > currentTabIndex + 1 ? (
            <SecondaryButton onClick={handleNext}>Next</SecondaryButton>
          ):
          publishFlagActive && state?.status === carryPlanStatus.APPROVED ?
          (
            // <SecondaryButton onClick={handlePublishChanges}>Publish</SecondaryButton>
            <></>
          )
          :null
        
        }
        </FullPageModal.Footer>
      </FullPageModal>
    </>
  );
};

export default CarryPlanModal;
