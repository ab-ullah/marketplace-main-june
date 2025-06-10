import { FunctionComponent } from "react";
import get from "lodash/get";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import { ADMIN_URL_PREFIX } from "../../../../constants/routes";
import ApplicantActions from "./ApplicantActions";
import { TableLink } from "../../../../components/Table/styles";
import ApplicantPill from "./ApplicantPill";
import { getLeverageOptionLabel } from "../../constants";
import {isApplicationApproveable} from "../utils";
import { TransferBadge } from "./styles";
import { isEmpty } from "lodash";
import {WORKFLOW_PRE_DOCUMENT_SIGNING} from "./constants";

const formatCurrency = (row: any, column: string, symbol: string) => {
  const val = get(row, column, "");
  return <>{val ? <FormattedCurrency value={val} symbol={symbol} /> : <></>}</>;
};

const LeverageRatio: FunctionComponent<any> = ({ leverageValue }) => {
  const label = getLeverageOptionLabel(leverageValue);
  return <span>{label}</span>;
};

export const getColumns = (
  fundDetails: any,
  toggleModal: any,
  handleUpdateSelectedStatus: any,
  withdrawConfirmationModal: any,
) => {
  let columns = [
    {
      title: '',
      dataKey: '',
      fixed: "left",
      width: 10,
      flexGrow: 0.5,
      Cell: (row: any) => (
        <>
        {row.is_transferred && <TransferBadge>Transfer</TransferBadge>}
        </>
      )
    },
    {
      title: "First Name",
      dataKey: "first_name",
      fixed: "left",
      width: 80,
      flexGrow: 1,
      isSortable: true,
      Cell: (row: any) => (
        <>
        <TableLink
          to={`/${ADMIN_URL_PREFIX}/funds/${fundDetails.external_id}/applicants/${row.id}`}
        >
          {get(row, "first_name", "")}
        </TableLink>
        </>
      ),
    },
    {
      title: "Last Name",
      dataKey: "last_name",
      fixed: "left",
      width: 80,
      flexGrow: 1,
      isSortable: true,
      Cell: (row: any) => (
        <TableLink
          to={`/${ADMIN_URL_PREFIX}/funds/${fundDetails.external_id}/applicants/${row.id}`}
        >
          {get(row, "last_name", "")}
        </TableLink>
      ),
    },
    {
      title: "Account Code",
      dataKey: "investor_account_code",
      fixed: "left",
      width: 80,
      flexGrow: 2,
      isSortable: false,
    },
    {
      title: "Requested Leverage",
      dataKey: "investment_detail.requested_leverage",
      width: 85,
      flexGrow: 1,
      isSortable: true,
      Cell: (row: any) => (
        <LeverageRatio
          leverageValue={get(row, "investment_detail.requested_leverage")}
        />
      ),
    },
    {
      title: "Max Leverage",
      dataKey: "investment_detail.max_leverage",
      width: 85,
      flexGrow: 1,
      isSortable: true,
      Cell: (row: any) => {
        const maxLeverage = get(row, "investment_detail.max_leverage")
        return maxLeverage ? <LeverageRatio
        leverageValue={maxLeverage}
      /> : 'None'
      },
    },
    {
      title: "Final Leverage",
      dataKey: "investment_detail.final_leverage_ratio",
      width: 85,
      flexGrow: 1,
      isSortable: true,
      Cell: (row: any) => (
        <LeverageRatio
          leverageValue={get(row, "investment_detail.final_leverage_ratio")}
        />
      ),
    },
    {
      title: "Leverage Amount",
      dataKey: "investment_detail.leverage_amount",
      width: 100,
      flexGrow: 1.2,
      isSortable: true,
      Cell: (row: any) =>  formatCurrency(row, "investment_detail.leverage_amount", get(fundDetails, 'currency.symbol', '$'))
   
    },
   fundDetails.cashless_commitment_enabled &&
    {
      title: "Cashless Commit",
      dataKey: "investment_detail.cashless_commitment",
      width: 100,
      flexGrow: 1.2,
      isSortable: true,
      Cell: (row: any) =>  formatCurrency(row, "investment_detail.cashless_commitment", get(fundDetails, 'currency.symbol', '$'))
        
    },
    {
      title: "Requested Equity",
      dataKey: "investment_detail.requested_entity",
      width: 100,
      flexGrow: 1.2,
      isSortable: true,
      Cell: (row: any) => {
        if(get(row, 'investment_detail.requested_entity')){
          return formatCurrency(row, "investment_detail.requested_entity", get(fundDetails, 'currency.symbol', '$'))
        }
        else {
          return <FormattedCurrency value={0} symbol={get(fundDetails, 'currency.symbol', '$')} />
        }
      },
    },
    {
      title: "Final Equity",
      dataKey: "investment_detail.final_entity",
      width: 80,
      flexGrow: 1,
      isSortable: true,
      Cell: (row: any) => formatCurrency(row, "investment_detail.final_entity", get(fundDetails, 'currency.symbol', '$')),
    },
    {
      title: "Total Investment",
      dataKey: "investment_detail.total_investment",
      width: 85,
      flexGrow: 1.1,
      isSortable: true,
      Cell: (row: any) => formatCurrency(row, "investment_detail.total_investment", get(fundDetails, 'currency.symbol', '$')),
    },
    {
      title: "Eligibility Decision",
      dataKey: "eligibility_decision",
      width: 120,
      flexGrow: 1.5,
      isSortable: true,
      Cell: (row: any) => (
        <ApplicantPill
          data={row}
          field="eligibility_decision"
        />
      ),
    },
    {
      title: "Application Approval",
      dataKey: "application_approval",
      width: 115,
      flexGrow: 1.5,
      isSortable: true,
      Cell: (row: any) => (
        <ApplicantPill data={row} field="application_approval"/>
      ),
    },
    {
      title: "KYC/AML",
      dataKey: "kyc_aml",
      width: 110,
      flexGrow: 1.5,
      isSortable: true,
      Cell: (row: any) => <ApplicantPill data={row} field="kyc_aml"/>,
    },
    {
      title: "Tax Review",
      dataKey: "taxReview",
      width: 110,
      flexGrow: 1.5,
      isSortable: true,
      Cell: (row: any) => <ApplicantPill data={row} field="taxReview"/>,
    },
    {
      title: "Application Approval",
      dataKey: "pre_document_stage",
      width: 110,
      flexGrow: 1.5,
      isSortable: true,
      Cell: (row: any) => <ApplicantPill data={row} field="pre_document_stage"/>,
    },
    {
      title: "Final Review",
      dataKey: "legalDocs",
      width: 120,
      flexGrow: 1.5,
      isSortable: true,
      Cell: (row: any) => <ApplicantPill data={row} field="legalDocs"/>,
    },
    {
      title: "Action",
      dataKey: "action",
      fixed: "right",
      maxWidth: 150,
      Cell: (row: any, rowIndex: number) => {
        return (
          <>
            {fundDetails && row && (
              <ApplicantActions
                fundDetailsURL={`/${ADMIN_URL_PREFIX}/funds/${fundDetails.external_id}/applicants/${row.id}`}
                toggleModal={() => toggleModal(row.id)}
                hideApproval={!isApplicationApproveable(row)}
                toggleWithdrawConfirmationModal={() => withdrawConfirmationModal(row.id)}
                handleUpdateSelectedStatus={(status: number, comment?: string) =>
                  handleUpdateSelectedStatus(row.id, status, comment)
                }
              />
            )}
          </>
        );
      },
    },
  ].filter(elem=>!isEmpty(elem));
  if (fundDetails?.enable_internal_tax_flow) {
    const internalTax = {
      title: "Internal Tax",
      dataKey: "internal_tax",
      width: 150,
      flexGrow: 2,
      isSortable: true,
      Cell: (row: any) => <ApplicantPill data={row} field="internal_tax"/>,
    }
    columns.splice(15, 0, internalTax)
  }
  if(get(fundDetails, `enabled_workflows.${WORKFLOW_PRE_DOCUMENT_SIGNING}`)) {
    const preDocumentSkipColumns = ['eligibility_decision', 'application_approval', 'taxReview']
    columns = columns.filter(column => !preDocumentSkipColumns.includes(column.dataKey));
  }
  else {
    const preDocumentSkipColumns = ['pre_document_stage']
    columns = columns.filter(column => !preDocumentSkipColumns.includes(column.dataKey));
  }
  if(!fundDetails.offer_leverage){
    const leverage_columns = ['Requested Leverage','Max Leverage', 'Final Leverage','Leverage Amount']
    columns = columns.filter(column => !leverage_columns.includes(column.title));
  }
  if (fundDetails?.skip_tax) {
    return columns.filter(column => column.title !== 'Tax Review')
  }

  return columns;
}
