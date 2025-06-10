import { FunctionComponent, useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom";
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
  let { externalId } = useParams<{ externalId: string }>();
  const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
  const { refetch: refetchAppStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(
    externalId, {
      skip: !externalId,
    }
  );
  const [updateConfirmPosition] = useUpdateModulePositionMutation();
  const history = useHistory();

  const showNext = canMovePastReviewDocs(applicationStatus)

  useEffect(() => {
    refetchAppStatus()
    if(moduleId)
      updateConfirmPosition({moduleId, externalId, currentStep: 1});
  }, []);


  return <Confirmation
    showNext={showNext}
    handleClickNext={() => history.push(redirectUrl)}
    customText={customText}
  />
};

export default ConfirmationSection;
