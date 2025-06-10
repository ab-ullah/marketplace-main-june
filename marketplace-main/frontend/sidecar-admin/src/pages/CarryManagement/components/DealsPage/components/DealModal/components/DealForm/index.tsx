import { Formik } from "formik";
import { Col, Container, Row } from "react-bootstrap";
import styled from "styled-components";
import { StyledForm } from "../../../../../../../../presentational/forms";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import { INITIAL_VALUES, VALIDATION_SCHEMA } from "./constants";
import API from "../../../../../../../../api/backendApi";
import { useEffect, useState } from "react";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import { toast } from "react-toastify";
import { OutlinedButton, SecondaryButton } from "../../../../../styles";
import get from "lodash/get";
import CurrencyInput from "../../../../../../../Funds/components/CreateFund/currencyInput";
import { Label } from "./styles";
import { DatePickerContainer } from "../../../../../../../FundSetup/components/CarryManagementSection/components/VestingScheduleModal/components/VestingScheduleForm/styles";
import moment from "moment";
import TooltipWrapper from "../../../../../../../../components/Tooltip";
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

interface IDealFormProps {
  closeModal: () => void;
  handleUpdateDealsList: (newDeal: Record<string, any>) => void;
  initState?: any;
}

const DealForm = ({
  closeModal,
  handleUpdateDealsList,
  initState
}: IDealFormProps) => {
  const [fundOptions, setFundOptions] = useState<any[]>([]);
  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };
  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const { name, estimated_value, fair_market_value, fund, dealId, estimated_value_date, fair_market_value_date } = values;
    const fund_external_id = fund?.value || undefined;
    const payload = {
      name,
      estimated_value,
      fair_market_value,
      estimated_value_date: estimated_value_date ? moment(estimated_value_date).format('YYYY-MM-DD') : null,
      fair_market_value_date: fair_market_value_date ? moment(fair_market_value_date).format('YYYY-MM-DD') : null,
      ...(fund_external_id && { fund_external_id }),
    };

    const res = dealId ? await API.updateDeal(dealId, payload) : await API.createDeal(payload);
    if (res.success) {
      handleUpdateDealsList(res.data);
      toast.success(`Deal ${dealId ? "edited" : "created"} successfully!!`);
    }
    else {
      toast.error(`Unable to ${dealId ? "edit" : "create"} deal at this moment !!`)
    }

    setSubmitting(false);
    closeModal();
  };
  const handleFetchFundsList = async () => {
    const res = await API.fetchCarryFundsList();
    if (res.success) {
      const funds = res.data
        .map((fund: any) => ({
          label: fund.name,
          value: fund.external_id,
        }));
      setFundOptions(funds);
    }
  };

  const getInitialValues = () => {
    if (initState && Object.keys(initState).length) {
      const { name, estimated_value, fair_market_value, fund, dealId, estimated_value_date, fair_market_value_date } = initState;
      return { name, estimated_value, fair_market_value, fund, dealId, estimated_value_date, fair_market_value_date };
    } else return INITIAL_VALUES;
  };
  useEffect(() => {
    handleFetchFundsList();
  }, []);
 
  return (
    <Container fluid >
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
          const hasErrors = !!Object.keys(errors).length;
          return (
            <StyledForm
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: '450px' }}>
                <FormTextFieldRow
                  label="Deal Name"
                  name="name"
                  placeholder="Deal Name"
                  onChange={null}
                  onBlur={handleBlur}
                  value=""
                />
                <FormSelectorFieldRow
                  label="Associated Fund"
                  name="fund"
                  placeholder="Select fund"
                  onChange={(val: any) => setFieldValue("fund", val)}
                  value={values.fund}
                  options={fundOptions}
                  optional
                />

              </div>
              <TooltipWrapper enable={Boolean (initState?.estimated_value_from_investment)} text="Controlled by associated investments">
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
                    additionalProps={{
                      key: `estimated_value`,
                      style:initState?.estimated_value_from_investment? {opacity:0.5, cursor:"not-allowed"}:{},
                      disabled: Boolean (initState?.estimated_value_from_investment)
                    }}
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
                      disabled={Boolean(initState?.estimated_value_from_investment)}
                    />
                  </DatePickerContainer>
                </Col>
              </Row>
            </TooltipWrapper>
            <TooltipWrapper enable={Boolean (initState?.fair_market_value_from_investment)} text="Controlled by associated investments">
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
                    additionalProps={{
                      key: `fair_market_value`,
                      style:initState?.fair_market_value_from_investment? {opacity:0.5, cursor:"not-allowed"}:{},
                      disabled: Boolean(initState?.fair_market_value_from_investment)
                    }}
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
                      disabled={Boolean(initState?.fair_market_value_from_investment)}
                    />
                  </DatePickerContainer>
                </Col>
              </Row>
              </TooltipWrapper>
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

export default DealForm;
