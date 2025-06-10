import { FunctionComponent } from "react";
import { Banner, H3, H4, Button, ProgressBar } from "./styles";
import get from "lodash/get";
import round from "lodash/round";
import {useHistory} from "react-router-dom";
import { getOnboardingURL } from "./utils";
import { IOpportunity } from "../../pages/Opportunities/interfaces";
import { useCompanyPrefix } from "../../utils/hooks";
import { getHomepageUrl } from "../../utils/routes";

interface IWorkFlowProgress {
  fund_slug: string;
  fund_name: string;
  percent_completed: number;
  module: number;

}

interface BannerSectionProps {
  workFlowProgress: IWorkFlowProgress;
  workflowFund?: IOpportunity;
}

const BannerSection: FunctionComponent<BannerSectionProps> = ({ workFlowProgress, workflowFund }) => {
  const progress = get(workFlowProgress, 'percent_completed', 0)
  const history = useHistory()
  const {companyPrefix} =useCompanyPrefix()
  const getWorkflowUrl = () => {
    if (workflowFund) return getOnboardingURL(workflowFund.application_link,companyPrefix);
    return getHomepageUrl(companyPrefix)
  }

  return (
    <>
      <H3 className="mb-4">Application in progress</H3>
      <Banner>
        <H4>{get(workFlowProgress, 'fund_name')}</H4>
        <div className="bottom-content">
          <div>
            <span className="value">{round(progress)}</span>
            <span className="sign">%</span> complete
          </div>
          <Button onClick={()=>history.push(getWorkflowUrl())}>Continue to fill out the form</Button>
        </div>
        <ProgressBar value={progress}/>
      </Banner>
    </>
  );
};

export default BannerSection;
