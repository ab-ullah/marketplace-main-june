import {get} from "lodash";
import React, {FunctionComponent} from "react";
import {CommentsContext, IUploadDocDetails} from ".";
import {INVESTMENT_ALLOCATION} from "../../constants/commentModules";

import {CommentsByRecord} from "../KnowYourCustomer/interfaces";
import InvestmentAmountAnswer from "../KnowYourCustomer/components/InvestmentAmountAnswer";

interface IInvestmentAmountProps {
  card: any;
  commentsByRecord: CommentsByRecord;
  recordUUID: string | null;
  recordId: number | null;
  getKYCRecord: () => void;
  handleUploadDouments: (data: IUploadDocDetails) => Promise<void>
}

const InvestmentAmount: FunctionComponent<IInvestmentAmountProps> = ({
  card,
  commentsByRecord,
  recordUUID,
  recordId,
  getKYCRecord,
  handleUploadDouments,
}) => {
  const moduleId = get(card.schema, `0.investmentDetail.investment_record_id`);
  let moduleComments = get(
    commentsByRecord,
    `${INVESTMENT_ALLOCATION}.${moduleId}`
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
        <InvestmentAmountAnswer page='applicationView' question={question} />
      </CommentsContext.Provider>
    </>
  ));
};

export default InvestmentAmount;
