import React, { FC, useState } from "react";
import filter from "lodash/filter";
import get from "lodash/get";
import isNil from "lodash/isNil";
import map from "lodash/map";
import includes from "lodash/includes";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { TAX_RECORD } from "../../../../constants/commentModules";
import { KYC_ENTITY_TYPES } from "../../constants";
import { selectKYCState, selectTaxRecords } from "../../selectors";
import Detail from "../BankingDetails/QuestionRow";
import RequestModal from "../RequestModal";
import { ILabels, initFlagModal, ITaxDetails } from "./interfaces";
import { join } from "lodash";
import { COMMENT_CREATED, COMMENT_RESOLVED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import API from "../../../../api";
import { approveComment, fetchCommentsByApplicationId, fetchCommentsByKycRecordId } from "../../thunks";


const TaxDetails: FC<ITaxDetails> = ({ taxDetails, applicationId, record }) => {
  const [flagDetails, setFlagDetails] = useState(initFlagModal);
  const { commentsByRecord, comments, applicationInfo } = useAppSelector(selectKYCState);
  const dispatch = useAppDispatch();
  const {geoSelector} = useAppSelector(selectTaxRecords)
  const commentsOfThisRecord = get(
    commentsByRecord,
    `${TAX_RECORD}.${taxDetails?.id}`
  );

  const hideFlagModal = () => setFlagDetails(initFlagModal);

  const showFlagModal = (questionId: string) => {
    if (questionId)
      setFlagDetails({
        show: true,
        questionId,
        requestModalText: get(ILabels, `${questionId}`),
      });
  };

  const getIsFlagged = (field: string) => {
    const question = get(commentsOfThisRecord, field);
    if (!question) return false;
    const comment = get(question, "");
    return !isNil(comment) && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status);
  };

  const getTaxCountry = () => {
    const selectedCountriesId = get(taxDetails, "countries", [])
    const countries = filter(geoSelector, (country) => includes(selectedCountriesId, country.id));
    return join(map(countries, 'label'), ', ')
  }

  const getCommentId = (field: string) => {
    const question = get(commentsOfThisRecord, field);
    if (!question) return false;
    const comment = get(question, "");
    return comment?.id
  }

  const handleApproveComment = (commentId: number) => {
    dispatch(approveComment(commentId))
  }

  const getComment = (field: string) => {
    const question = get(commentsOfThisRecord, field);
    if (!question) return false;
    const comment = get(question, "");
    return comment
  }

  if(!taxDetails) return null;
  return (
    <>
    <Detail
        label="Countries"
        flagged={getIsFlagged("countries")}
        handleClickFlag={() => showFlagModal("countries")}
        value={getTaxCountry()}
        handleApproveComment={() => handleApproveComment(getCommentId('countries'))}
        comment={getComment('countries')}
      />
      <Detail
        label={ILabels.us_holder}
        flagged={getIsFlagged("us_holder")}
        handleClickFlag={() => showFlagModal("us_holder")}
        handleApproveComment={() => handleApproveComment(getCommentId('us_holder'))}
        value={get(taxDetails, "us_holder", "")}
        comment={getComment('us_holder')}
      />
      {get(taxDetails, 'us_holder', "") === "Yes" && (
        <Detail
          label={ILabels.is_tax_exempt}
          flagged={getIsFlagged("is_tax_exempt")}
          handleClickFlag={() => showFlagModal("is_tax_exempt")}
          handleApproveComment={() => handleApproveComment(getCommentId('is_tax_exempt'))}
          value={get(taxDetails, "is_tax_exempt", "")}
          comment={getComment('is_tax_excempt')}
        />
      )}
      {get(taxDetails, 'us_holder', "") === "Yes" && KYC_ENTITY_TYPES.includes(get(record, 'kyc_investor_type_name', "") as string) && (
        <Detail
          label={ILabels.is_entity}
          flagged={getIsFlagged("is_entity")}
          handleClickFlag={() => showFlagModal("is_entity")}
          handleApproveComment={() => handleApproveComment(getCommentId('is_entity'))}
          value={get(taxDetails, "is_entity", "")}
          comment={getComment('is_entity')}
        />
      )}
      <Detail
        label={ILabels.is_tax_exempt_in_country}
        flagged={getIsFlagged("is_tax_exempt_in_country")}
        handleClickFlag={() => showFlagModal("is_tax_exempt_in_country")}
        handleApproveComment={() => handleApproveComment(getCommentId('is_tax_exempt_in_country'))}
        value={get(taxDetails, "is_tax_exempt_in_country", "")}
        comment={getComment('is_tax_exempt_in_country')}
      />
      <Detail
        label={ILabels.tin_or_ssn}
        flagged={getIsFlagged("tin_or_ssn")}
        handleClickFlag={() => showFlagModal("tin_or_ssn")}
        handleApproveComment={() => handleApproveComment(getCommentId('tin_or_ssn'))}
        value={get(taxDetails, "tin_or_ssn", "")}
        comment={getComment('tin_or_ssn')}
      />
      <Detail
        label={ILabels.tax_year_end}
        flagged={getIsFlagged("tax_year_end")}
        handleClickFlag={() => showFlagModal("tax_year_end")}
        handleApproveComment={() => handleApproveComment(getCommentId('tax_year_end'))}
        value={get(taxDetails, "tax_year_end", "")}
        comment={getComment('tax_year_end')}
      />
      <RequestModal
        key={flagDetails.questionId}
        show={flagDetails.show}
        onHide={hideFlagModal}
        fieldValue={flagDetails.requestModalText}
        applicationId={applicationId}
        module={TAX_RECORD}
        moduleId={taxDetails.id}
        commentFor={record.user.id}
        questionIdentifier={`${flagDetails.questionId}`}
        commentLabel={flagDetails.requestModalText}
      />
    </>
  );
};

export default TaxDetails;
