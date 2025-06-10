import { useMemo, useState } from "react";
import { Formik } from "formik";
import { Container } from "react-bootstrap";
import API from "../../../../../../../../api/backendApi";
import styled from "styled-components";
import { StyledForm } from "../../../../../../../../presentational/forms";
import CurrencyInput from "../../../../../../../Funds/components/CreateFund/currencyInput";
import { OutlinedButton, SecondaryButton } from "../../../../../styles";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import get from "lodash/get";
import { toast } from "react-toastify";
import { INITIAL_VALUES } from "./constants";

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

interface IEditCommitmentFormProps {
  closeModal: (_refetch?:boolean) => void;
  initState?: any;
}

const EditCommitmentForm = ({ closeModal, initState }: IEditCommitmentFormProps) => {
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  const initValues = useMemo(() => {
    if(!selectedParticipant) return INITIAL_VALUES
    const { participants } = initState;
    const participant = participants.find((participant: any) => participant.id === selectedParticipant.value)
    if(participant) {
      return {
        total_capital_commit: participant.total_capital_commit,
        cashless_commit: participant.cashless_commit,
        management_fee_offset: participant.management_fee_offset,
        salary_reduction: participant.salary_reduction,
      }
    }
    return INITIAL_VALUES;
  }, [selectedParticipant])

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const { participants } = initState;
    const participant = participants.find((participant: any) => participant.id === selectedParticipant.value)
    const {
      total_capital_commit,
      cashless_commit,
      management_fee_offset,
      salary_reduction,
    } = values;
    const payload = {
      carry_participant: participant.carry_participant,
      total_capital_commit,
      cashless_commit,
      management_fee_offset,
      salary_reduction,
      id: participant.id
    };


    const res = await API.editCommitment(payload);

    if (res.success) {
      toast.success(`Commitment updated successfully!!`);
    } else {
      toast.error("Something went wrong !!");
    }

    setSubmitting(false);
    closeModal(res.success);
  };

  return (
    <Container fluid>
      <Formik
        initialValues={initValues}
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
          return (
            <StyledForm
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <FormSelectorFieldRow
                label="Participant"
                name="participant"
                placeholder="Select"
                onChange={(val: any) => setSelectedParticipant(val)}
                value={selectedParticipant}
                options={initState.participants.map((participant: any) => ({
                    label: participant.participant_full_name,
                    value: participant.id
                }))}
              />

              {
                selectedParticipant && <>
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
                </>
              }

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
                  disabled={isSubmitting || !selectedParticipant}
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

export default EditCommitmentForm;
