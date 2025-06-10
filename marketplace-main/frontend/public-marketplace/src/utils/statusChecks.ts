import {IApplicationStatus} from "../interfaces/application";

export const canMovePastReviewDocs = (applicationStatus: IApplicationStatus) => {
  return applicationStatus?.can_view_agreements;
}