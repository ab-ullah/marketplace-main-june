export interface PendingCarryDocumentTask {
    count: number
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
    signed_document: IDocument
    is_gp_signature_required: boolean
    completed: boolean
    gp_signing_complete: boolean
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
    name: string
    vested_points: number
    unvested_points: number
    bps: number
    pool_percentage: number
}

export interface VestingSchedule {
    id: number
    name: string
    description: string
}