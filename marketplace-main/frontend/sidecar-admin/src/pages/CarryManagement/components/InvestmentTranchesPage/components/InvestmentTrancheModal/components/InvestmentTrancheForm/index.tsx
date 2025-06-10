import { Formik } from "formik";
import { Col, Container, Row } from "react-bootstrap";
import styled from "styled-components";
import { StyledForm } from "../../../../../../../../presentational/forms";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import { INITIAL_VALUES, VALIDATION_SCHEMA } from "./constants";
import API from "../../../../../../../../api/backendApi";
import { useEffect, useMemo, useState } from "react";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import { toast } from "react-toastify";
import { OutlinedButton, SecondaryButton } from "../../../../../styles";
import get from "lodash/get";
import CurrencyInput from "../../../../../../../Funds/components/CreateFund/currencyInput";
import { Label } from "./styles";
import { DatePickerContainer } from "../../../../../../../FundSetup/components/CarryManagementSection/components/VestingScheduleModal/components/VestingScheduleForm/styles";
import moment from "moment";
import { useCreateInvestmentTrancheMutation, useUpdateInvestmentTrancheMutation } from "../../../../../../../../api/rtkQuery/carryApi";
import ReactDatePickerComp from "../../../../../../../../components/ReactDatePickerComp";

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

interface IInvestmentTrancheFormProps {
  closeModal: () => void;
  handleUpdateTranchList: () => void;
  initState?: any;
}

const InvestmentTrancheForm = ({
  closeModal,
  handleUpdateTranchList,
  initState
}: IInvestmentTrancheFormProps) => {
  const [dealOptions, setDealOptions] = useState<any[]>([]);

  const [ createInvestmentTranche ] = useCreateInvestmentTrancheMutation()
  const [updateInvestmentTranche] = useUpdateInvestmentTrancheMutation()

  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };
  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const { name, estimated_value, fair_market_value, deal, estimated_value_date, fair_market_value_date } = values;
    const payload = {
      name,
      estimated_value,
      fair_market_value,
      estimated_value_date: estimated_value_date ? moment(estimated_value_date).format('YYYY-MM-DD') : null,
      fair_market_value_date: fair_market_value_date ? moment(fair_market_value_date).format('YYYY-MM-DD') : null,
      ...(deal && { deal: deal.value }),
      ...(initState && { id: initState.id }),
    };

    const promise = initState ? updateInvestmentTranche(payload) : createInvestmentTranche(payload)
    await promise.unwrap()
    handleUpdateTranchList();
    setSubmitting(false);
    closeModal();
  };
  const handleFetchFundsList = async () => {
    const res = await API.fetchAllDeals();
    if (res.success) {
      const deals = res.data
        .map((deal: any) => ({
          label: deal.name,
          value: deal.id,
        }));
      setDealOptions(deals);
    }
  };

  const initialValues = useMemo(() => {
    if (initState && Object.keys(initState).length) {
      let deal = null;
      const { name, estimated_value, fair_market_value, dealId, estimated_value_date, fair_market_value_date } = initState;
      if(dealOptions?.length) {
        deal = dealOptions.find((d) => d.value === initState.deal)
      }
      return { name, estimated_value, fair_market_value, deal, dealId, estimated_value_date, fair_market_value_date };
    } else return INITIAL_VALUES;
  }, [dealOptions])

  useEffect(() => {
    handleFetchFundsList();
  }, []);

  return (
    <Container fluid >
      <Formik
        initialValues={initialValues}
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
          const hasErrors = !!Object.keys(errors).length;
          return (
            <StyledForm
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: '450px' }}>
                <FormTextFieldRow
                  label="Investment Tranche Name"
                  name="name"
                  placeholder="Investment Tranche Name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                />
                <FormSelectorFieldRow
                  label="Associated Deal"
                  name="deal"
                  placeholder="Select Deal"
                  onChange={(val: any) => setFieldValue("deal", val)}
                  value={values.deal}
                  options={dealOptions}
                />

              </div>
              <Row>
                <Col>
                  <CurrencyInput
                    label="Estimated Value"
                    name="estimated_value"
                    placeholder="Estimated Value"
                    onChange={(name: any, value: any) => { setFieldValue(name, value); }}
                    value={values.estimated_value}
                    error={get(errors, 'estimated_value', "") as string}
                    optional
                  />
                </Col>
                <Col>
                  <DatePickerContainer className="date-container">
                    <Label>As of date</Label>
                    <ReactDatePickerComp
                      selected={values.estimated_value_date ? moment(values.estimated_value_date).toDate() : null}
                      onChange={(v: any) => {
                        setFieldValue('estimated_value_date', v);
                      }}
                      placeholderText="Pick a date"
                      name={'estimated_value_date'}
                    />
                  </DatePickerContainer>
                </Col>
              </Row>

              <Row>
                <Col>
                  <CurrencyInput
                    label="Fair Market Value"
                    name="fair_market_value"
                    placeholder="Fair Market Value"
                    onChange={(name: any, value: any) => { setFieldValue(name, value); }}
                    value={values.fair_market_value}
                    error={get(errors, 'fair_market_value', "") as string}
                    optional
                  />
                </Col>
                <Col>
                  <DatePickerContainer className="date-container">
                    <Label>As of date</Label>
                    <ReactDatePickerComp
                      selected={values.fair_market_value_date ? moment(values.fair_market_value_date).toDate() : null}
                      onChange={(v: any) => {
                        setFieldValue('fair_market_value_date', v);
                      }}
                      placeholderText="Pick a date"
                      name={'fair_market_value_date'}
                    />
                  </DatePickerContainer>
                </Col>
              </Row>
              <ButtonsContainer
                className="text-right"
              >
                <OutlinedButton style={{ padding: '12px 26px 12px 26px !important', height: '48px !important' }} onClick={handleClose}>Cancel</OutlinedButton>
                <SecondaryButton type="submit" disabled={isSubmitting || hasErrors}>Save</SecondaryButton>
              </ButtonsContainer>
            </StyledForm>
          );
        }}
      </Formik>
    </Container>
  );
};

export default InvestmentTrancheForm;
