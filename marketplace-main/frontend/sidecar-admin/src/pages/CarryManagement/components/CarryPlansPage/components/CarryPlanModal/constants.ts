import { get, map } from "lodash";
import { generateDateTimeWithZeroTime, generateDateWithOffset } from "../../../../../../utils/dateFormatting";
import { getSumByProperty } from "../../../../../../utils/getValue";
import { decimalEqual } from "../../../../../../utils/decimal";

export const TABS ={
    CARRY_PLAN:'carry-plan',
    CARRY_ALLOCATIONS:'carry-allocations'
  }
  
 export const tabsStepperConfig:any[]=[
    {
      title:'Carry Plan Setup',
      key:TABS.CARRY_PLAN
    },
    {
      title:'Carry Allocations',
      key:TABS.CARRY_ALLOCATIONS
    }
  ]

  export const validateCarryPlanData = (state: any) => {
    const {
      default_vesting_schedule,
      starting_template,
      name,
      sub_pools,
      effective_date
    } = state;
    const errors: any = {};
    if(!starting_template) errors.starting_template = 'Required'
    if( starting_template?.value === "scratch") {
      if(!default_vesting_schedule) errors.default_vesting_schedule = 'Required'
    }
    if(!effective_date) errors.effective_date = 'Required'
    if(!name) errors.name = 'Required'
    if(sub_pools && sub_pools?.length && !Boolean(sub_pools?.[0]?.id)){
      const hasValidBps = decimalEqual(getSumByProperty(sub_pools,'bps'),'100')
      const hasRequiredEmptyFields = sub_pools.some((subpool:any)=>!(get(subpool,'bps',"").toString() && subpool.name))
      const validationError = hasRequiredEmptyFields ? "Fill all required fields" : !hasValidBps? "Carry Pools must total 100 points":""
      if(validationError) errors.sub_pools = validationError
    }
    return errors
  }

  const formatSubpoolsPayload = (subpools: any[]) =>
    map(subpools, (subpool) => {
      const { name, bps, vehicle, share_class, vesting_schedule, carry_documents } = subpool;
      return {
        name,
        bps,
        vehicle_id: get(vehicle, "value", ""),
        template_share_class_id: get(share_class, "value", ""),
        vesting_schedule_id: get(vesting_schedule, "value", ""),
        carry_documents: (carry_documents||[]).map((doc:any)=>doc.value),
      };
    });
  

  export const generateCarryPlanPayload = (state:any, isEdit:boolean) =>{
    const {
      funds_and_deals,
      bps,
      default_vesting_schedule,
      starting_template,
      selected_carry_template_docs,
      effective_date,
      name,
      sub_pools
    } = state;
   return {
      funds: funds_and_deals.filter((elem:any)=>!elem.is_deal && !elem.is_tranche)?.map((elem:any)=>({external_id:elem.value })),
      deals: funds_and_deals.filter((elem:any)=>elem.is_deal)?.map((elem:any)=>({external_id:elem.value })),
      investment_tranches: funds_and_deals.filter((elem:any)=>elem.is_tranche)?.map((tranche: any) => ({external_id: tranche.value})),
      bps: isEdit ? bps : 100,
      default_vesting_schedule: default_vesting_schedule?.value || null,
      starting_template:
        starting_template?.value !== "scratch"
          ? starting_template?.value
          : undefined,
      carry_documents: (selected_carry_template_docs||[]).map((doc:any)=>doc.value),
       effective_date: generateDateTimeWithZeroTime(effective_date),
      name,
    ...(sub_pools? {sub_pools:formatSubpoolsPayload(sub_pools)}:{})
    };
  }

  export const generateCarryAllocationsPayload = (state:any,mode:string)=>{
    const { allocations } = state;
    return {
      allocations: allocations.map((allocation: any) => ({
        ...allocation,
        share_class: allocation.share_class?.id,
        vehicle: allocation.vehicle?.id,
        vesting_schedule: allocation.vesting_schedule.id,
        allocation_id: mode===MODAL_MODE.ADD_ALLOCATIONS ? null : allocation.allocation_id,
        issue_date: mode===MODAL_MODE.ADD_ALLOCATIONS ? null : allocation.issue_date,
        vesting_start_date: allocation.vesting_start_date ? generateDateTimeWithZeroTime(allocation.vesting_start_date) : null,
        grant_date: generateDateTimeWithZeroTime(allocation.grant_date)
      })).filter((allocation:any)=>allocation.bps),
      mode
    };
  }

  export const MODAL_MODE={
    NONE:'',
    CREATE_CARRY_PLAN:'create_plan',
    EDIT_ALLOCATIONS:'edit',
    ADD_ALLOCATIONS:'add'
  }

  export const getModalTitle = (mode: string) => {

    switch (mode) {
      case MODAL_MODE.CREATE_CARRY_PLAN:
        return "Create New Carry Plan";
      case MODAL_MODE.EDIT_ALLOCATIONS:
        return "Edit Draft Allocations";
      case MODAL_MODE.ADD_ALLOCATIONS:
        return "Issue New Allocations";

      default:
        break;
    }
  };