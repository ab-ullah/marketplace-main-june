import get from "lodash/get";
import includes from "lodash/includes";
import { IOpportunity } from "../../pages/Opportunities/interfaces";
import NameLogo from "./NameLogo";
import {ComingSoon, PillAbsoluteLink, TableButton, CenteredDiv, ApplicationLinkWrapper} from "./styles";
import { useHistory } from "react-router-dom";
import { ArrowForward } from "@material-ui/icons";

const getHost = () => {
  return `${window.location.protocol}//${window.location.host}`
}

export const getOnboardingURL = (link: string,companyPrefix:string = "") => {
  const params = new URL(link);
  return `${companyPrefix}${get(params, 'pathname', link)}`;
}

const getOnboardingLinkTitle = (link: string) => {
  const title = includes(link, "/onboarding") ? "Apply Now" : "Continue";
  return title;
}


const cellRenderer = (row: IOpportunity, key: keyof IOpportunity) => {
  if (row && row[key]) return row[key];
  return "";
};

const isShowActionLink = (row: any) : boolean => {
  return row.accept_applications
}


const generateLinkWithCompany=(url:string,companyPrefix:string)=>{
  const parsedUrl = new URL(url);
  const domain = parsedUrl.origin;
  const path = parsedUrl.pathname;
  return `${domain}${companyPrefix}${path}`
}

export const getColumns =(companyPrefix:string) => [
  {
    title: "Fund",
    dataKey: "name",
    flexGrow: 2,
    Cell:(row: IOpportunity) =><NameLogo logo={row.company_logo} name={row.name}/>
  },
  { title: "Region/Country", dataKey: "focus_region", flexGrow: 1, minWidth: 100, },
  {
    title: "Type",
    dataKey: "type",
    flexGrow: 1.2,
    Cell: (row: IOpportunity) => cellRenderer(row, "type"),
  },
  {
    title: "Risk Profile",
    dataKey: "risk_profile",
    flexGrow:1,
    Cell: (row: IOpportunity) => cellRenderer(row, "risk_profile"),
  },
  {
    title: "Application Period",
    dataKey: "investment_period",
    flexGrow: 1,
    Cell: (row: IOpportunity) => cellRenderer(row, "investment_period"),
  },
  {
    title: "",
    dataKey: "action",
    fixed: "right",
    width: 200,
    Cell: (row: any) => {
      const history = useHistory()
      if(row.status === 'withdrawn'){
      const applicationUrl = `${companyPrefix}/investor/funds/${row.external_id}/application`
      return (
        <CenteredDiv>
        <TableButton onClick={(e:any) => {e.stopPropagation(); history.push(applicationUrl)}}>
          <ApplicationLinkWrapper>
            <span>View application </span> <ArrowForward />
          </ApplicationLinkWrapper>
        </TableButton>
        </CenteredDiv>
      );
      }
      let onboarding_link = row.application_link
      let title = getOnboardingLinkTitle(row.application_link)
      if (row.external_onboarding_url != null) {
        onboarding_link = row.external_onboarding_url
        title = "Apply now"
      }
      
      return (
        <CenteredDiv>
          {isShowActionLink(row) ? (
            <PillAbsoluteLink
              data-apply-link={generateLinkWithCompany(onboarding_link,companyPrefix)}
              onClick={()=>window.open(generateLinkWithCompany(onboarding_link,companyPrefix))}
            >
              {title}
            </PillAbsoluteLink>
          ): <>
          {
            row.open_for_indication_interest ?  
            <PillAbsoluteLink
            data-apply-link={`${getHost()}${companyPrefix}/investor/funds/${row.external_id}/indication_of_interest`}
            onClick={()=>window.open(`${getHost()}${companyPrefix}/investor/funds/${row.external_id}/indication_of_interest`)}
          >
            Indicate Interest
          </PillAbsoluteLink>: <ComingSoon>Coming Soon</ComingSoon>
          }
          </>}
        </CenteredDiv>
      );
    },
  },
];