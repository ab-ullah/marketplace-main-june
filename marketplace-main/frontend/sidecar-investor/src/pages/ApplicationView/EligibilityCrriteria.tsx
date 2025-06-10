import { get } from "lodash";
import React, { FunctionComponent } from "react";
import { CommentsContext } from ".";
import { ELIGIBILITY_CRITERIA } from "../../constants/commentModules";
import EligibilityCriteriaAnswer from "../KnowYourCustomer/components/EligibilityCriteriaAnswer";
import { CommentsByRecord } from "../KnowYourCustomer/interfaces";

interface IEligibilityCriteriaProps {
  card: any;
  commentsByRecord: CommentsByRecord;
  recordUUID: string | null;
  recordId: any;
  getKYCRecord: () => void;
  handleUploadDouments: (data: any) => Promise<void>
  moduleId: number;
  isDisabled?: boolean;
}

const EligibilityCriteria: FunctionComponent<IEligibilityCriteriaProps> = ({
  card,
  commentsByRecord,
  recordUUID,
  recordId,
  moduleId,
  isDisabled,
  getKYCRecord,
  handleUploadDouments,
}) => {
  let moduleComments = get(
    commentsByRecord,
    `${ELIGIBILITY_CRITERIA}.${moduleId}`
  );
  return card.schema.map((question: any) => (
    <>
      <CommentsContext.Provider
        value={{
          comments: moduleComments,
          recordUUID,
          recordId,
          callbackDocumentUpload: handleUploadDouments,
          fetchKYCRecord: getKYCRecord,
        }}
      >
        <EligibilityCriteriaAnswer question={question} isDisabled={isDisabled}/>
      </CommentsContext.Provider>
    </>
  ));
};

EligibilityCriteria.defaultProps = {
  isDisabled: false
}

export default EligibilityCriteria;
