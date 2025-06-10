import { useEffect, useMemo, useState } from "react";
import { Formik } from "formik";
import { Col, Container, Row } from "react-bootstrap";
import API from "../../../../../../../../api/backendApi";
import styled from "styled-components";
import { StyledForm } from "../../../../../../../../presentational/forms";
import CurrencyInput from "../../../../../../../Funds/components/CreateFund/currencyInput";
import { OutlinedButton, SecondaryButton } from "../../../../../styles";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import get from "lodash/get";
import { INITIAL_VALUES, SOURCE_TYPE, VALIDATION_SCHEMA } from "./constants";
import { useFetchInvestmentTrancheQuery } from "../../../../../../../../api/rtkQuery/carryApi";
import { toast } from "react-toastify";
import { isEmpty } from "lodash";

const ButtonsContainer = styled.div`
  text-align: right;
  background: #f5f7f8;
  width: calc(100% + 56px);
  margin-left: -28px;
  margin-bottom: -16px;
  margin-top: 20px;
  padding: 15px 28px;
  border-top: 1px solid #d5dae1;
`;

interface ICommitmentFormProps {
  closeModal: (_refetch?:boolean) => void;
  initState?: any;
}

const CommitmentForm = ({ closeModal, initState }: ICommitmentFormProps) => {
  const [fundOptions, setFundOptions] = useState<any[]>([]);
  const [dealOptions, setDealOptions] = useState<any[]>([]);
  const [participantOptions, setParticipantOptions] = useState<any[]>([]);
  const { data: investmentTranches } = useFetchInvestmentTrancheQuery();

  const trancheOptions = useMemo(() => {
    if (investmentTranches) {
      return investmentTranches.map((tranche: any) => ({
        label: tranche.name,
        value: tranche.external_id,
        source_type: SOURCE_TYPE.INVESTMENT_TRANCHE,
      }));
    }
    return [];
  }, [investmentTranches]);

  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  const handleFetchFundsList = async () => {
    const res = await API.fetchCarryFundsList();
    if (res.success) {
      const funds = res.data.map((fund: any) => ({
        label: fund.name,
        value: fund.external_id,
        source_type: SOURCE_TYPE.FUND,
      }));
      setFundOptions(funds);
    }
  };

  const handleFetchDealsList = async () => {
    const res = await API.fetchAllDeals();
    if (res.success) {
      const deals = res.data?.map((deal: any) => ({
        label: deal.name,
        value: deal.external_id,
        source_type: SOURCE_TYPE.DEAL,
      }));
      setDealOptions(deals);
    }
  };

  const handleFetchAllCarryParticipantsUngrouped = async () => {
    const res = await API.fetchAllCarryParticipantsUngrouped();
    if (res.success) {
      const participants = res.data?.map((deal: any) => ({
        label: deal.full_name,
        value: deal.id,
      }));
      setParticipantOptions(participants);
    }
  };

  const getInitialValues = () => {
    return INITIAL_VALUES;
  };

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const {
      participant,
      source,
      total_capital_commit,
      cashless_commit,
      management_fee_offset,
      salary_reduction,
    } = values;
    const payload = {
      carry_participant: participant.value,
      source_external_id: source.value,
      source_type: source.source_type,
      total_capital_commit,
      cashless_commit,
      management_fee_offset,
      salary_reduction,
    };

    const res = await API.createCommitment(payload);

    if (res.success) {
      toast.success(`Commitment Created successfully!!`);
    } else {
      toast.error("Something went wrong !!");
    }

    setSubmitting(false);
    closeModal(res.success);
  };

  useEffect(() => {
    handleFetchFundsList();
    handleFetchDealsList();
    handleFetchAllCarryParticipantsUngrouped();
  }, []);

  return (
    <Container fluid>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          errors,
        }) => {
          const hasErrors = !isEmpty(errors)
          return (
            <StyledForm
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <FormSelectorFieldRow
                label="Participant"
                name="participant"
                placeholder="Select"
                onChange={(val: any) => setFieldValue("participant", val)}
                value={values.participant}
                options={participantOptions}
              />
              <FormSelectorFieldRow
                label="Source"
                name="source"
                placeholder="Select"
                onChange={(val: any) => setFieldValue("source", val)}
                value={values.source}
                options={[
                  { label: "Funds", options: fundOptions },
                  { label: "Deals", options: dealOptions },
                  { label: "Tranche", options: trancheOptions },
                ]}
              />

              <CurrencyInput
                label="Total Capital Commit"
                name="total_capital_commit"
                placeholder="Total Capital Commit"
                onChange={(name: any, value: any) => {
                  setFieldValue(name, value);
                }}
                value={values.total_capital_commit}
                error={get(errors, "total_capital_commit", "") as string}
              />
              <CurrencyInput
                label="Cashless Commit"
                name="cashless_commit"
                placeholder="Cashless Commit"
                onChange={(name: any, value: any) => {
                  setFieldValue(name, value);
                }}
                value={values.cashless_commit}
                error={get(errors, "cashless_commit", "") as string}
              />
              <CurrencyInput
                label="Management Fee Offset"
                name="management_fee_offset"
                placeholder="Management Fee Offset"
                onChange={(name: any, value: any) => {
                  setFieldValue(name, value);
                }}
                value={values.management_fee_offset}
                error={get(errors, "management_fee_offset", "") as string}
              />
              <CurrencyInput
                label="Salary Reduction"
                name="salary_reduction"
                placeholder="Salary Reduction"
                onChange={(name: any, value: any) => {
                  setFieldValue(name, value);
                }}
                value={values.salary_reduction}
                error={get(errors, "salary_reduction", "") as string}
              />

              <ButtonsContainer className="text-right">
                <OutlinedButton
                  style={{
                    padding: "12px 26px 12px 26px !important",
                    height: "48px !important",
                  }}
                  onClick={handleClose}
                >
                  Cancel
                </OutlinedButton>
                <SecondaryButton
                  type="submit"
                  disabled={isSubmitting || hasErrors}
                >
                  Save
                </SecondaryButton>
              </ButtonsContainer>
            </StyledForm>
          );
        }}
      </Formik>
    </Container>
  );
};

export default CommitmentForm;
