import map from "lodash/map";
import { planFromScratch } from "./components/CarryPlanModal/components/CarryPlanForm/components/CarryPlanStep";
import filter from "lodash/filter";
import { standardizeDate } from "../../../../utils/dateFormatting";
import { isEqual } from "lodash";

export const formatFundCarryPlansList =(plans:any[])=>{
  return map(plans,(plan) => {
    const {
      id,
      created_at,
      allocated_points,
      total_points,
      default_vesting_schedule,
      participants,
      name,
      status,
      un_allocated_points,
      effective_date,
    } = plan;
    return {
      label: name,
      value: id,
      created_at: created_at,
      allocated_points: allocated_points,
      total_points: total_points,
      unallocated_points: un_allocated_points,
      default_vesting_schedule: default_vesting_schedule.name,
      carryPlanId: id,
      participants: participants,
      effective_date,
      status
    };
  });
}

const formatSubpools=(subpools:any[])=>map(subpools,subpool=>{
  const {vehicle, vehicle_name,template_share_class_name, template_share_class, vesting_schedule, carry_documents }= subpool
  return {
    ...subpool,
    vehicle:vehicle ? {label:vehicle_name, value:vehicle }:null,
    share_class: template_share_class? {label: template_share_class_name, value: template_share_class}: null,
    vesting_schedule: vesting_schedule?.id ? {label: vesting_schedule.name, value: vesting_schedule.id} : null,
    carry_documents: carry_documents?.map((doc:any)=>({value:doc.id,file: doc.document}))
  }
})

const markEditedAllocations = (
  allocations: Record<string,any>[],
  lastApprovedAllocations: Record<string,any>[]
): Record<string,any> => {
  const lastApprovedMap: { [key: string]: Record<string,any>} = lastApprovedAllocations.reduce(
    (map, allocation) => {
      map[allocation.allocation_id] = allocation;
      return map;
    },
    {}
  );

  return allocations.map(allocation => {
    const lastApproved = lastApprovedMap[allocation.allocation_id];

    const isEdited = !lastApproved || !isEqual(allocation, lastApproved);

    return {
      ...allocation,
      edited: isEdited
    };
  });
};

export const formatFundCarryPlanAndAllocations = (data:{allocations:any[],last_approved_allocations:any[],carry_pool:any,allocated:any, un_allocated: any},reviewMode=false)=>{
  const { allocations, carry_pool, last_approved_allocations,allocated,un_allocated } = data;
      const {
        name,
        default_vesting_schedule,
        total_points,
        starting_template,
        id,
        created_at,
        status,
        participants,
        carry_documents,
        effective_date,
        deals,
        funds,
        investment_tranches,
        sub_pools,
        has_unreleased_documents
      } = carry_pool;
      const _funds = funds.map((fund:any)=>({...fund,is_deal:false, value: fund.external_id}))
      const _deals = deals.map((deal:any)=>({...deal,is_deal:true,value: deal.external_id}))
      const _tranches = investment_tranches?.map((tranche:any)=>({...tranche, is_tranche:true, value: tranche.external_id})) ?? []
      return {
        funds_and_deals:[..._funds,..._deals, ..._tranches],
        default_vesting_schedule: {
          label: default_vesting_schedule.name,
          value: default_vesting_schedule.id,
        },
        bps: total_points,
        starting_template: starting_template?.id
          ? { label: starting_template.name, value: starting_template.id }
          : planFromScratch,
        carryPlanId: id,
        has_unreleased_documents,
        created_at,
        status,
        participants: participants,
        allocations: reviewMode ? markEditedAllocations(allocations,last_approved_allocations || []):allocations,
        name,
        carry_documents,
        selected_carry_template_docs: carry_documents?.map((doc:any)=>({value:doc.id,file: doc.document})),
        effective_date: standardizeDate(effective_date) || null,
        allocated,
        un_allocated,
        ...(sub_pools? {sub_pools:formatSubpools(sub_pools)}:{})
      };
}

export const carryPlanOptions = (carryPlans: any[], excludePlan: any) => {
  return map(
    filter(
      carryPlans,
      (carryPlan: any) => carryPlan.carryPlanId != excludePlan
    ),
    ({ label, value }: any) => ({
      label,
      value,
    })
  );
};

export const carryPlanStatus={
  PUBLISHED:'Published',
  UNPUBLISHED_CHANGE: 'Unpublished Changes',
  PENDING_APPROVAL:'Pending Approval',
  APPROVED: 'Approved-unpublished',
  UNAPPROVED:'Unapproved'
}