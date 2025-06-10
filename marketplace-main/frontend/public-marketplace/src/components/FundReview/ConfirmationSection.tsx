import { FunctionComponent, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { IApplicationStatus } from "../../interfaces/application";
import Confirmation from "./Confirmation";
import { useGetApplicationStatusQuery, useUpdateModulePositionMutation } from "../../api/rtkQuery/fundsApi";
import {canMovePastReviewDocs} from "../../utils/statusChecks";

interface IConfirmation {
  redirectUrl: string;
  moduleId?: number;
  customText?: string | null
}

const ConfirmationSection: FunctionComponent<IConfirmation> = ({ moduleId, redirectUrl, customText }) => {
  let { externalId, company } = useParams<{ externalId: string, company: string }>();
  const { data: applicationStatus, refetch: refetchAppStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);

  const [updateConfirmPosition] = useUpdateModulePositionMutation();
  const history = useNavigate();

  const showNext = canMovePastReviewDocs(applicationStatus)

  useEffect(() => {
    refetchAppStatus()
    if(moduleId)
      updateConfirmPosition({moduleId, externalId, currentStep: 1});
  }, []);


  return <Confirmation
    showNext={showNext}
    handleClickNext={() => history('/'+company+redirectUrl)}
    customText={customText}
  />
};

export default ConfirmationSection;
