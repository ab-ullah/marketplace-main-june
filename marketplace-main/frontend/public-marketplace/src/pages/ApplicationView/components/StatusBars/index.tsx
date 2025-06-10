import React, {FunctionComponent} from "react";
import {IApplicationNextState} from "../../../../interfaces/application";
import PendingReviewStatus from "./PendingReview";
import ChangesRequested from "./ChangesRequested";
import ReadyForNextStep from "./ReadyForNext";


export const CONTINUE_STATUS = ['continue', 'approved']

interface NextStatusProps {
  applicationNextState: IApplicationNextState
}

const NextStatus: FunctionComponent<NextStatusProps> = (
  {
    applicationNextState,
  }
) => {
  if (!applicationNextState) return <></>
  const status = applicationNextState.status
  const applicationCompleted = applicationNextState.application_completed
  if (status === 'pending') return <PendingReviewStatus/>
  if (status === 'changes_requested') return <ChangesRequested
    changesRequestedModule={applicationNextState.changes_requested_module}
  />
  if (CONTINUE_STATUS.includes(status) || applicationCompleted) return <ReadyForNextStep nextUrl={applicationNextState.next_url} completed={applicationCompleted}/>
  return <></>
};

export default NextStatus;
