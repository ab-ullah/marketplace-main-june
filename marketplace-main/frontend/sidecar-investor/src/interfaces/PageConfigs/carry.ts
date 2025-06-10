export interface TooltipType {
    heading: string;
    description: string;
}

export interface carryTooltip {
    key: string;
    tooltip: TooltipType
}

export interface carryPlansConfig {
    tooltips: carryTooltip[]
}