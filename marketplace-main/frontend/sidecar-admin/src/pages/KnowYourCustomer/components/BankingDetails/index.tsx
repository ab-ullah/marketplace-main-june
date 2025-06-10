import { FunctionComponent, useEffect, useMemo, useState } from "react";
import get from "lodash/get";
import find from "lodash/find";
import isNil from "lodash/isNil";
import toLower from "lodash/toLower";
import { useGetCurrenciesQuery } from "../../../../api/rtkQuery/commonApi";
import { fetchGeoSelector } from "../../../EligibilityCriteria/thunks";
import { selectCountrySelector } from "../../../EligibilityCriteria/selectors";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectKYCState } from "../../selectors";
import RequestModal from "../RequestModal";
import { ILabels } from "./config";
import Detail from "./QuestionRow";
import {BANKING_DETAILS} from "../../../../constants/commentModules";
import { approveComment } from "../../thunks";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../../../constants/commentStatus";

interface BankDetailsProps {
  details: any;
  record: any;
  applicationId: number;
}

interface IFlagModal {
  show: boolean, requestModalText: string, questionId: string | keyof ILabels
}

const initFlagModal: IFlagModal = { show: false, requestModalText: "", questionId: "" };

const BankDetails: FunctionComponent<BankDetailsProps> = ({
  details,
  record,
  applicationId,
}) => {
  const dispatch = useAppDispatch();
  const [flagDetails, setFlagDetails] = useState(initFlagModal);
  const countrySelector = useAppSelector(selectCountrySelector);
  const { commentsByRecord } = useAppSelector(selectKYCState);
  const commentsOfThisRecord = get(commentsByRecord, `${BANKING_DETAILS}.${details.id}`);
  const { data: currencies } = useGetCurrenciesQuery({});

  const US_BANK_ID = useMemo(() => {
    const country = find(
      countrySelector,
      (country: any) => toLower(country.label) === "united states"
    );
    return get(country, "id");
  }, [countrySelector]);

  const UK_BANK_ID = useMemo(() => {
    const country = find(
      countrySelector,
      (country: any) => country.value === "UK"
    );
    return get(country, "id");
  }, [countrySelector]);

  useEffect(() => {
    dispatch(fetchGeoSelector());
  }, [dispatch]);

  const getBankCountry = (countryId: number) => {
    if (countryId && countrySelector) {
      const country = find(
        countrySelector,
        (country: any) => country.id === countryId
      );
      return country?.label;
    }
  };

  const getCurrencyName = (currencyId: number) => {
    if (currencyId && currencies) {
      const currency = find(
        currencies,
        (currency: any) => currency.id === currencyId
      );
      return currency?.code;
    }
  };

  const showFlagModal = (questionId: string | keyof ILabels) => {
    if(questionId)
    setFlagDetails({
      show: true,
      questionId,
      requestModalText: get(ILabels, `${questionId}`),
    });
  };
  const hideFlagModal = () => setFlagDetails(initFlagModal);

  const getIsFlagged = (field: string) => {
    const question = get(commentsOfThisRecord, field);
    if (!question) return false
    const comment = get(question, '')
    return !isNil(comment) && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status)
  };

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
  const isUKBank= get(details, "bank_country") === UK_BANK_ID

  if (!US_BANK_ID) return <></>;
  return (
    <>
      {details && details.bank_country && (
        <Detail
          value={getBankCountry(details.bank_country)}
          label={ILabels.bank_country}
          flagged={getIsFlagged("bank_country")}
          handleClickFlag={() => showFlagModal("bank_country")}
          handleApproveComment={() => handleApproveComment(getCommentId('bank_country'))}
          comment={getComment("bank_country")}
        />
      )}
      {details.bank_country && (
        <>
          <Detail
            label={ILabels.bank_name}
            flagged={getIsFlagged("bank_name")}
            handleClickFlag={() => showFlagModal("bank_name")}
            handleApproveComment={() => handleApproveComment(getCommentId('bank_name'))}
            value={details.bank_name}
            comment={getComment("bank_name")}
          />

          {get(details, "bank_country") === US_BANK_ID && (
            <Detail
              label={ILabels.routing_number}
              flagged={getIsFlagged("routing_number")}
              handleClickFlag={() => showFlagModal("routing_number")}
              handleApproveComment={() => handleApproveComment(getCommentId('routing_number'))}
              value={details.routing_number}
              comment={getComment("routing_number")}
            />
          )}
          {get(details, "bank_country") !== US_BANK_ID && (
            <Detail
              label={isUKBank? ILabels.sort_code : ILabels.swift_code}
              flagged={getIsFlagged("swift_code")}
              handleClickFlag={() => showFlagModal("swift_code")}
              handleApproveComment={() => handleApproveComment(getCommentId('swift_code'))}
              value={details.swift_code}
              comment={getComment("swift_code")}
            />
          )}

          {get(details, "bank_country") !== US_BANK_ID &&
            details.have_intermediary_bank && (
              <>
                <Detail
                  value={details.intermediary_bank_name}
                  label={ILabels.intermediary_bank_name}
                  flagged={getIsFlagged("intermediary_bank_name")}
                  handleClickFlag={() =>
                    showFlagModal("intermediary_bank_name")
                  }
                  handleApproveComment={() => handleApproveComment(getCommentId('intermediary_bank_name'))}
                  comment={getComment("intermediary_bank_name")}
                />

                <Detail
                  value={details.intermediary_bank_swift_code}
                  label={isUKBank? ILabels.intermediary_bank_sort_code : ILabels.intermediary_bank_swift_code}
                  flagged={getIsFlagged("intermediary_bank_swift_code")}
                  handleClickFlag={() =>
                    showFlagModal("intermediary_bank_swift_code")
                  }
                  handleApproveComment={() => handleApproveComment(getCommentId('intermediary_bank_swift_code'))}
                  comment={getComment("intermediary_bank_swift_code")}
                />
              </>
            )}

          <Detail
            label={ILabels.street_address}
            flagged={getIsFlagged("street_address")}
            handleClickFlag={() => showFlagModal("street_address")}
            handleApproveComment={() => handleApproveComment(getCommentId('street_address'))}
            value={details.street_address}
            comment={getComment("street_address")}
          />

          <Detail
            label={ILabels.city}
            flagged={getIsFlagged("city")}
            handleClickFlag={() => showFlagModal("city")}
            handleApproveComment={() => handleApproveComment(getCommentId('city'))}
            value={details.city}
            comment={getComment("city")}
          />

          {get(details, "bank_country") === US_BANK_ID ? (
            <Detail
              label={ILabels.state}
              flagged={getIsFlagged("state")}
              handleClickFlag={() => showFlagModal("state")}
              handleApproveComment={() => handleApproveComment(getCommentId('state'))}
              value={details.state}
              comment={getComment("state")}
            />
          ) : (
            !isUKBank &&
            <Detail
              label={ILabels.province}
              flagged={getIsFlagged("province")}
              handleClickFlag={() => showFlagModal("province")}
              handleApproveComment={() => handleApproveComment(getCommentId('province'))}
              value={details.province}
              comment={getComment("province")}
            />
          )}

          <Detail
            label={ILabels.postal_code}
            flagged={getIsFlagged("postal_code")}
            handleClickFlag={() => showFlagModal("postal_code")}
            handleApproveComment={() => handleApproveComment(getCommentId('postal_code'))}
            value={details.postal_code}
            comment={getComment("postal_code")}
          />

          <Detail
            label={ILabels.account_name}
            flagged={getIsFlagged("account_name")}
            handleClickFlag={() => showFlagModal("account_name")}
            handleApproveComment={() => handleApproveComment(getCommentId('account_name'))}
            value={details.account_name}
            comment={getComment("account_name")}
          />
          <Detail
            label={ILabels.account_number}
            flagged={getIsFlagged("account_number")}
            handleClickFlag={() => showFlagModal("account_number")}
            handleApproveComment={() => handleApproveComment(getCommentId('account_number'))}
            value={details.account_number}
            comment={getComment("account_number")}
          />

          {get(details, "bank_country") !== US_BANK_ID && !isUKBank && (
            <Detail
              label={ILabels.iban_number}
              flagged={getIsFlagged("iban_number")}
              handleClickFlag={() => showFlagModal("iban_number")}
              handleApproveComment={() => handleApproveComment(getCommentId('iban_number'))}
              value={details.iban_number}
              comment={getComment("iban_number")}
            />
          )}
          <Detail
            value={details.credit_account_name}
            label={ILabels.credit_account_name}
            flagged={getIsFlagged("credit_account_name")}
            handleClickFlag={() => showFlagModal("credit_account_name")}
            handleApproveComment={() => handleApproveComment(getCommentId('credit_account_name'))}
            comment={getComment("credit_account_name")}
          />
          <Detail
            value={details.credit_account_number}
            label={ILabels.credit_account_number}
            flagged={getIsFlagged("credit_account_number")}
            handleClickFlag={() => showFlagModal("credit_account_number")}
            handleApproveComment={() => handleApproveComment(getCommentId('credit_account_number'))}
            comment={getComment("credit_account_number")}
          />

          <Detail
            value={getCurrencyName(details.currency)}
            label={ILabels.currency}
            flagged={getIsFlagged("currency")}
            handleClickFlag={() => showFlagModal("currency")}
            handleApproveComment={() => handleApproveComment(getCommentId('currency'))}
            comment={getComment("currency")}
          />

          <Detail
            label={ILabels.reference}
            flagged={getIsFlagged("reference")}
            handleClickFlag={() => showFlagModal("reference")}
            handleApproveComment={() => handleApproveComment(getCommentId('reference'))}
            value={details.reference}
            comment={getComment("reference")}
          />
        </>
      )}
      <RequestModal
        key={flagDetails.questionId}
        show={flagDetails.show}
        onHide={hideFlagModal}
        fieldValue={flagDetails.requestModalText}
        applicationId={applicationId}
        module={BANKING_DETAILS}
        moduleId={details.id}
        commentFor={record.user.id}
        questionIdentifier={`${flagDetails.questionId}`}
        commentLabel={flagDetails.requestModalText}
      />
    </>
  );
};

export default BankDetails;
