import React, { FunctionComponent } from "react";
import get from "lodash/get";
import first from "lodash/first";
import {useHistory, useParams} from "react-router";
import { useAppSelector } from "../../app/hooks";
import {
  useUpdateBankingDetailsMutation,
  useFetchBankingDetailsQuery, useGetApplicationStatusQuery,
} from "../../api/rtkQuery/fundsApi";
import { selectKYCRecord } from "../KnowYourCustomer/selectors";
import DetailsForm from "../BankDetailsForm/Form";
import { Params } from "../TaxForms/interfaces";
import {ChangeAnswersButton, SubTitle} from "./styles";
import {BANKING_DETAILS} from "../../constants/commentModules";
import { IBankingDetails } from "../../interfaces/bankingDetails";
import { getUnavailableSectionMesage } from "../../constants/applicationView";
import {INVESTOR_URL_PREFIX} from "../../constants/routes";
import { Link } from "react-router-dom";
import { useCompanyPrefix } from "../../utils/hooks";
import {IApplicationStatus} from "../../interfaces/application";


interface BankingDetailsProps {
  callbackSubmit: () => void;
  taxDocumentsSigned?: boolean;
  disabled?: boolean;
}

const BankingDetails: FunctionComponent<BankingDetailsProps> = ({ callbackSubmit, taxDocumentsSigned, disabled }) => {
  const { externalId } = useParams<Params>();
  const {companyPrefix} =useCompanyPrefix()
  const [updateBankingDetails] = useUpdateBankingDetailsMutation();
  const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
  const { commentsByRecord } = useAppSelector(selectKYCRecord);
  const applicationReadOnlyViewKYCWorkflow = !applicationStatus?.has_pre_document_stage || applicationStatus?.has_pre_document_workflow
  const history = useHistory()

  const { data: bankingApiData, isLoading: isLoadingBankingData } =
    useFetchBankingDetailsQuery(externalId, {
      skip: !externalId,
    });
  const bankingData: IBankingDetails | undefined = first(bankingApiData);

  let commentsOfThisRecord = {}
  if (bankingData) {
    commentsOfThisRecord = get(commentsByRecord, `${BANKING_DETAILS}.${bankingData.id}`);
  }

  const onSubmit = (values: any) => {
    updateBankingDetails({
      fundId: values.id,
      ...values,
      fund_external_id: externalId,
      currency: get(values, "currency.value"),
      bank_country: get(values, "bank_country.value"),
    })
      .then((resp: any) => {
        callbackSubmit();
      })
      .catch((e) => {
        console.log({ e });
      });
  };

  if (isLoadingBankingData) return <></>;

  const changeBankingDetails = () => {
    if(taxDocumentsSigned || applicationStatus.has_pre_document_stage)
      history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/bank_details`)
  }

  return (
    <>
      <SubTitle>Banking Details</SubTitle>
      {applicationReadOnlyViewKYCWorkflow && <ChangeAnswersButton
        onClick={changeBankingDetails}
        disabled={!taxDocumentsSigned && !applicationStatus.has_pre_document_stage}
      >
        Go to Bank Details
      </ChangeAnswersButton>}
      {(!isLoadingBankingData && !bankingData) && (
         <p>{getUnavailableSectionMesage('Banking Details')}</p>
      )}
      {(!isLoadingBankingData && bankingData) && (
        <DetailsForm
          details={bankingData}
          submitOnBlur={true}
          handleSubmit={onSubmit}
          comments={commentsOfThisRecord}
          disabled={disabled}
        />
      )}
      {!applicationStatus.has_pre_document_stage && <div className="mt-2">
        <Link
          to={`${companyPrefix}/investor/funds/${externalId}/bank_details`}
        >
          Go to Banking Details
        </Link>
      </div>}
    </>
  );
};

export default BankingDetails;
