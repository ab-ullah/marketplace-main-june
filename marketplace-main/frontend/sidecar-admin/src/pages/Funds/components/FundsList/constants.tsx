import { ADMIN_URL_PREFIX } from "../../../../constants/routes";
import Actions from "./Actions";
import { FundId, StatusDateContainer, Status } from "./styles";
import Finalize from "./Finalize";
import { IFund } from "../../interfaces";
import _ from "lodash";


const statusFilterOptions = () => {
  const options = [
    "Live on Portal",
    "In Draft",
    "Closed for New Applications",
    "Accepting Applications",
    "Applicant Review",
    "Finalized",
  ];

  return options.map((opt) => ({ label: opt, value: opt }));
};

export const getTableColumns = (showDocumentModal: (fund: IFund) => void) => [
    {
      title: "Fund Name",
      dataKey: "name",
      flexGrow: 1.5,
      minWidth: 250,
      isSortable: true,
      Cell: (row: IFund) => (
        <FundId to={`/${ADMIN_URL_PREFIX}/funds/${row.external_id}`}>{row.name}</FundId>
      ),
    },
    {
      title: "Status",
      dataKey: "status",
      flexGrow: 1,
      minWidth: 150,
      isSortable: true,
      filterOptions: statusFilterOptions(),
      Cell: (row: IFund) => (
        <StatusDateContainer>
          <Status>{row.status}</Status>
        </StatusDateContainer>
      ),
    },
    {
      title: "Fund Setup",
      dataKey: "fund_setup",
      flexGrow: 1,
      Cell: (row: IFund) => (
        <>
          {row.is_published ? (
            <FundId to={`/${ADMIN_URL_PREFIX}/funds/${row.external_id}`}>Edit</FundId>
          ) : (
            <FundId
              to={`/${ADMIN_URL_PREFIX}/funds/${row.external_id}?view=setup&tab=fundSetup`}
            >
              View
            </FundId>
          )}
        </>
      ),
    },
    {
      title: "Eligibility",
      dataKey: "Eligibility",
      flexGrow: 0.6,
      Cell: (row: IFund) => (
        <>
          <FundId
            to={`/${ADMIN_URL_PREFIX}/funds/${row.external_id}?view=setup&tab=eligibilityCriteria`}
          >
            {row.has_eligibility_criteria ? "Edit" : "View"}
          </FundId>
        </>
      ),
    },
    {
      title: "Application Management",
      dataKey: "ApplicationManagement",
      flexGrow: 1,
      minWidth: 230,
      Cell: (row: IFund) => (
        <>
          <FundId
            to={`/${ADMIN_URL_PREFIX}/funds/${row.external_id}?view=setup&tab=applicants`}
          >
            View
          </FundId>
        </>
      ),
    },
    {
      title: "Finalize",
      dataKey: "Finalize",
      flexGrow: 0.6,
      Cell: (row: IFund) => (
        <>
          {!row.is_finalized && (
            <Finalize fundId={row.id} canBeFinalized={row.can_finalize} />
          )}
        </>
      ),
    },
    {
      title: "Fund Documents",
      dataKey: "FundDocuments",
      flexGrow: 1,
      minWidth: 200,
      Cell: (row: IFund) => (
        <>
          <FundId
            to={`/${ADMIN_URL_PREFIX}/funds/${row.external_id}?view=setup&tab=documents`}
            onClick={(e: any) => {
              e.preventDefault();
              showDocumentModal(row);
            }}
          >
            Edit
          </FundId>
        </>
      ),
    },
    {
      title: "Actions",
      dataKey: "Actions",
      flexGrow: 0.5,
      Cell: (row: IFund) => {
          return (
          <Actions
            fundId={row.id}
            fundName={row.name}
            hasEligibilityCriteria={row.has_eligibility_criteria}
            showPublishOpportunity={!row.is_published}
            showPublishInvestmentDetails={!row.publish_investment_details}
            showAcceptApplications={!row.accept_applications}
            showCloseApplications={!row.close_applications}
            showReOpenApplications={row.close_applications}
            showIndicationOfInterest={!row.open_for_indication_interest}
            closeIndicationOfInterest={row.open_for_indication_interest}
            canStartAcceptingApplications={row.can_start_accepting_applications}
            hasDynamoId={_.has(row, "dynamo_id") && row.dynamo_id_content!=null && row.dynamo_id_content!=""}
            canPushRecordsToBooks={row.can_start_push_records_to_books}/>
      )}
     }
  ];
