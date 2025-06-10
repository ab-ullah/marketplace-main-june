import {CarryPlan, ICarryCommitment, ICarryDocument} from "../../interfaces/carryManagement";
import {StatusPill} from "./styles";
import FilePreviewModal from "../../components/FilePreviewModal";
import {StyledCheckbox} from "../FundDocuments/styles";
import Form from "react-bootstrap/Form";
import React from "react";
import {
    formatCurrencyWithTwoDecimals,
    limitCarryDecimalPlaces,
} from "../../utils/currency";
import {get} from "lodash";
import {standardizeDate} from "../../utils/dateFormatting";
import { getTooltip } from "../../utils/tooltip";


export const getPillColor=(status:string)=>{
    let color = ''
    switch (status.toLowerCase()) {
        case 'active':
            color = '#10AC84'
            break;
        case 'draft':
            color ='#FF8A00'
            break;
        case 'review':
            color= '#3A8DDF'
            break;
        case 'inactive':
            color= '#FF5722'
            break;
        case 'pending acknowledgement':
        case 'acknowledgement':
            color= '#2E86DE'
            break;
        case 'signed':
        case 'signature':
            color= '#10AC84'
            break
    }
    return color
}

export const getAllocationColumns = (handleSelectCarryPlanAllocation: (arg1: string) => any , tooltips: any) => [
    {
        title: "Name",
        fixed: "left",
        minWidth: 200,
        flexGrow: 1,
        isSortable:true,
        Cell: (row: CarryPlan) => (
            <span
                style={{
                    cursor: "pointer",
                    fontWeight: 900,
                    textDecoration: "underline",
                }}
                onClick={() => handleSelectCarryPlanAllocation(row.external_id)}
            >
        {row.carry_plan_name}
      </span>
        ),
    },
    {
        title: "Estimated Value",
        minWidth: 200,
        flexGrow: 1,
        tooltip: getTooltip('estimated_value' , tooltips)?.tooltip,
        Cell: (row: CarryPlan) => (
            <span>
        {formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry"))}
      </span>
        ),
    },
    {
        title: "Estimated Value As Of",
        minWidth: 220,
        flexGrow: 1,
        Cell: (row: CarryPlan) => (
            <span>
        {row.estimated_value_date ? standardizeDate(row.estimated_value_date) : '-'}
      </span>
        ),
    },
    {
        title: "Vested Value",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: CarryPlan) => (
            <span>
        {formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry_vested"))
        }
      </span>
        ),
    },

    {
        title: "Unvested Value",
        minWidth: 180,
        flexGrow: 1,
        Cell: (row: CarryPlan) => (
            <span>
        {
            formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry_un_vested"))
        }
      </span>
        ),
    },
    {
        title: "Fair Market Value",
        minWidth: 210,
        flexGrow: 1,
        tooltip: getTooltip('fair_market_value' , tooltips)?.tooltip,
        Cell: (row: CarryPlan) => (
            <span>
        {formatCurrencyWithTwoDecimals(get(row, "participant_fair_market_value"))}
      </span>
        )
    },
    {
        title: "Fair Market Value As Of",
        dataKey: "fair_market_value_date",
        minWidth: 230,
        flexGrow: 1,
        Cell: (row: CarryPlan) => (
            <span>
        {row.fair_market_value_date ? standardizeDate(row.fair_market_value_date) : '-'}
      </span>
        ),
    },
    {
        title: "Points",
        minWidth: 100,
        flexGrow: 0.6,
        Cell: (row: CarryPlan) => (
            <span>{limitCarryDecimalPlaces(get(row, 'bps'))}</span>
        ),
    },
    {
        title: "Unvested",
        minWidth: 100,
        flexGrow: 0.6,
        Cell: (row: CarryPlan) => (
            <span>{limitCarryDecimalPlaces(get(row, 'un_vested_bps'))}</span>
        ),
    },
    {
        title: "Vested Points",
        minWidth: 150,
        flexGrow: 0.8,
        Cell: (row: CarryPlan) => (
            <span>{limitCarryDecimalPlaces(get(row,"vested_bps"))}</span>
        ),
    },
    {
        title: "Distributions",
        minWidth: 140,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>{formatCurrencyWithTwoDecimals(get(row, "distributions")
            )}</span>
        ),
    },
];

export const getDocumentsColumns = () => [
    {
        title: "Document",
        fixed: "left",
        dataKey: "name",
        minWidth: 200,
        flexGrow: 1,
        isSortable:true,
        Cell: (row: ICarryDocument) => (
            <span
                style={{
                    cursor: "pointer",
                    fontWeight: 900,
                    textDecoration: "underline",
                }}
            >
              <FilePreviewModal
                  documentId={row.completed ? `${row.signed_document?.document_id}` : `${row.document.document_id}`}
                  documentName={row.document.title}
                  showPreviewIcon={false}
                  callbackPreviewFile={() => {}}
                  callbackDownloadFile={() => {}}
                  showAsButton={false}
                  showDownloadIcon={false}
                  dotted={false}
              />
            </span>
        ),
    },
    {
        title: "Recipient",
        minWidth: 170,
        flexGrow: 1.25,
        Cell: (row: ICarryDocument) => (
            <span>{row.display_name}</span>
        ),
    },
    {
        title: "Description",
        minWidth: 170,
        flexGrow: 1.25,
        Cell: (row: ICarryDocument) => (
            <span>{row.carry_document_description}</span>
        ),
    },
    {
        title: "Requirements",
        minWidth: 150,
        flexGrow: .8,
        Cell: (row: ICarryDocument) => (
            <StatusPill color={getPillColor(row.status)}>
                {row.status}
            </StatusPill>
        ),
    },
    {
        title: "Type",
        minWidth: 150,
        flexGrow: .8,
        Cell: (row: ICarryDocument) => <span>{row.document_type_display}</span>,
    },
];


export const getAllocationsColumns = () => [
    {
        title: "Grant Date",
        dataKey: "grant_date",
        minWidth: 100,
        flexGrow: 0.5,
        Cell: (row: any) => (
            <span>
            {standardizeDate(get(row, "grant_date"))}
          </span>
        ),
    },
    {
        title: "Carry Recipient",
        dataKey: "carry_recipient_name",
        minWidth: 160,
        flexGrow: 1.2,
        Cell: (row: any) => (
            <span style={{cursor: 'pointer'}}>
                {row.carry_recipient_name}
      </span>
        ),
    },
    {
        title: "Vesting Start Date",
        dataKey: "vesting_start_date",
        width: 165,
        flexGrow: 0.85,
        Cell: (row: any) => (
            <span>
            {standardizeDate(get(row,"vesting_start_date"))}
          </span>
        ),
    },
    {
        title: "Vesting Schedule",
        minWidth: 200,
        flexGrow: 0.85,
        Cell: (row: any) => (
            <span>
            {get(row,"vesting_schedule_name")}
          </span>
        ),
    },
    {
        title: "Points",
        dataKey: "points",
        minWidth: 80,
        flexGrow: 0.5,
        Cell: (row: any) => (
            <span>{limitCarryDecimalPlaces(get(row, 'points'))}</span>
        ),
    },
    {
        title: "Unvested",
        minWidth: 120,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>{limitCarryDecimalPlaces(get(row, 'unvested_points'))}</span>
        ),
    },
    {
        title: "Vested",
        minWidth: 120,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>{limitCarryDecimalPlaces(get(row,"vested_points"))}</span>
        ),
    },
    {
        title: "Estimated Value",
        dataKey: "estimated_value",
        minWidth: 120,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>
        {formatCurrencyWithTwoDecimals(  get(row, "estimated_value"))}
      </span>
        ),
    },
    {
        title: "Estimated Value As Of",
        dataKey: "estimated_value_date",
        minWidth: 140,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>
        {get(row, "estimated_value_date") ? standardizeDate(get(row, "estimated_value_date")) : '-'}
      </span>
        ),
    },
    {
        title: "Unvested Value",
        dataKey: "unvested_value",
        minWidth: 120,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>
        {formatCurrencyWithTwoDecimals(get(row, "unvested_value"))}
      </span>
        ),
    },
    {
        title: "Vested Value",
        dataKey: "vested_value",
        minWidth: 100,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>
        {formatCurrencyWithTwoDecimals(get(row, "vested_value"))}
      </span>
        ),
    },
    {
        title: "Fair Market Value",
        minWidth: 100,
        flexGrow: 0.75,
        Cell: (row: CarryPlan) => (
            <span>
        {formatCurrencyWithTwoDecimals(get(row, "fair_market_value"))}
      </span>
        )
    },
    {
        title: "Fair Market Value As Of",
        dataKey: "fair_market_value_date",
        minWidth: 140,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>
        {get(row, "fair_market_value_date") ? standardizeDate(  get(row, "fair_market_value_date")) : '-'}
      </span>
        ),
    },

    {
        title: "Distributions",
        minWidth: 120,
        flexGrow: 0.7,
        Cell: (row: any) => (
            <span>{formatCurrencyWithTwoDecimals(get(row, "distributions"))}</span>
        ),
    },
];

export const getCommitmentsColumns = () => [
    {
        title: "Source",
        fixed: "left",
        dataKey: "source_name",
        minWidth: 200,
        flexGrow: 1,
    },
    {
        title: "Total Capital Commit",
        minWidth: 170,
        flexGrow: 1.25,
        dataKey: "total_capital_commit",
        Cell: (row: ICarryCommitment) => (
            <span>{formatCurrencyWithTwoDecimals(get(row, "total_capital_commit"))}</span>
        ),
    },
    {
        title: "Cashless Commit",
        minWidth: 170,
        flexGrow: 1.25,
        Cell: (row: ICarryCommitment) => (
            <span>{formatCurrencyWithTwoDecimals(get(row, "cashless_commit"))}</span>
        ),
    },
    {
        title: "Management Fee Offset",
        minWidth: 150,
        flexGrow: .8,
        Cell: (row: ICarryCommitment) => (
            <span>{formatCurrencyWithTwoDecimals(get(row, "management_fee_offset"))}</span>
        ),
    },
    {
        title: "Salary Reduction",
        minWidth: 150,
        flexGrow: .8,
        Cell: (row: ICarryCommitment) => (
            <span>{formatCurrencyWithTwoDecimals(get(row, "salary_reduction"))}</span>
        ),
    },
];
