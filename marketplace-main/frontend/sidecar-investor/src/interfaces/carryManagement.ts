export interface PendingCarryDocumentTask {
    count: number
    acknowledgment_count: number
    pending_acknowledgment_count: number
    pending_signature_count: number
}

export interface IVestingSchedule {
    name: string
    id: number
}

export interface IDocument {
    title: string
    id: number
    document_id: string
}

export enum StatusEnum {
    "PENDING_SIGNATURE" = "Pending Signature",
    "ACKNOWLEDGED" = "Acknowledgement Complete",
    "ACKNOWLEDGEMENT_PENDING" = "Pending Acknowledgement",
    "SIGNED" = "Signed",
    "PENDING_GP_SIGNATURE" = "Pending GP Signature"
}

export interface ICarryDocument {
    status: StatusEnum;
    id: number
    bps: number
    vesting_schedule: IVestingSchedule
    is_acknowledged: boolean
    carry_plan_name: string
    document: IDocument
    signed_document?: IDocument | null;
    is_gp_signature_required: boolean
    is_signature_required: boolean
    gp_signing_complete: boolean
    completed: boolean
    document_type_display: string
    carry_document_description: string
    display_name: string
}

export interface ParticipantOverview {
    status: StatusEnum;
    id: number
    bps: number
    vesting_schedule: IVestingSchedule
    is_acknowledged: boolean
    carry_plan_name: string
    document: IDocument
    is_gp_signature_required: boolean
    gp_signing_complete: boolean
}

export interface CarryPlan {
    external_id: string;
    carry_plan_name: string
    vested_points: number
    unvested_points: number
    points: number
    pool_percentage: number
    vesting_start_date: string
    estimated_value_date: string
    fair_market_value_date: string
}

export interface VestingSchedule {
    id: number
    name: string
    description: string
}

export interface ParticipantAllocation {
    carry_recipient_name: string
    vested_points: number
    unvested_points: number
    pool_percentage: number
    bps: number
    vesting_start_date: string
    estimated_value: number
    vested_value: number
    unvested_value: number

}

export interface ITooltip {
    description: string;
    heading: string
}

export interface CarryPlansConfig {
    tooltips: {
        key: string;
        tooltip: ITooltip
    }[]
}

export interface OnboardingCustomText {
    custom_domicile_text: string | null
}

export interface ICarryCommitment {
    source_name: string;
    source_type: number;
    source_external_id: string;
    total_capital_commit: number;
    cashless_commit: number;
    management_fee_offset: number;
    salary_reduction: number;
  };