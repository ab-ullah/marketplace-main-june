import Modal from "react-bootstrap/Modal";
import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { FormTextFieldRow } from "../../../../../../components/Form/TextField";
import { FormSelectorFieldRow } from "../../../../../../components/Form/SelectorField";
import CurrencyInput from "../../../../../Funds/components/CreateFund/currencyInput";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { INITIAL_VALUES, VALIDATION_SCHEMA } from "./constants";
import get from "lodash/get";
import { getValueWithDefault } from "../../../../../../utils/getValue";
import each from "lodash/each";
import { logMixPanelEvent } from "../../../../../../utils/mixPanel";
import { ICurrency } from "../../../../../../interfaces/currency";
import find from "lodash/find";
import styled from "styled-components";
import API from "../../../../../../api"
import { toast } from "react-toastify";
import { Col, Container, Row } from "react-bootstrap";
import { SecondaryButton } from "../../../styles";
import { FormBody, CustomStyledForm, CustomOutlinedButton, Label, FormRowWrapper } from "./styles";
import { ICarryFund } from "../FundsListView/constants";
import { isEmpty } from "lodash";
import { DatePickerContainer } from "../../../../../FundSetup/components/CarryManagementSection/components/VestingScheduleModal/components/VestingScheduleForm/styles";
import moment from "moment";
import TooltipWrapper from "../../../../../../components/Tooltip";
import ReactDatePickerComp from "../../../../../../components/ReactDatePickerComp";

interface ICreateFundModal {
    handleCloseModal: () => void
    refetchData: () => void;
    initState: ICarryFund | null;
}

interface ICreateFundForm {
    handleCloseModal: () => void;
    refetchData: () => void;
    initState: ICarryFund | null;
}

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

const FundForm = ({ handleCloseModal, refetchData, initState }: ICreateFundForm) => {
    const [currencies, setCurrencies] = useState<ICurrency[]>([]);

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const onSubmit = async (
        values: any,
        { setSubmitting, setFieldError, setFieldValue, setValues }: any
    ) => {
        setSubmitting(true);
        let payload: any = {
            name: values.name,
            fund_currency: get(values.fund_currency, "value", false),
            target_fund_size: getValueWithDefault(values, "target_fund_size", 0),
            estimated_value: getValueWithDefault(values, "estimated_value", 0),
            ...(values.estimated_value_date ? {estimated_value_date: moment(getValueWithDefault(values, 'estimated_value_date', '')).format('YYYY-MM-DD')} : {}),
            fair_market_value: getValueWithDefault(values, "fair_market_value", 0),
            ...(values.fair_market_value_date ? {fair_market_value_date: moment(getValueWithDefault(values, 'fair_market_value_date', '')).format('YYYY-MM-DD')} : {}),
        };

        const formData: any = new FormData();
        each(payload, (val, key) => {
            formData.append(key, val);
        });
        let res
        if (initState?.fund_id) {
            res = await API.updateCarryFund(initState.fund_id, formData)
            payload = { id: initState.fund_id, ...payload }
            refetchData();
        } else {
            res = await API.createCarryFund(formData);
            refetchData();
        }
        if (res.success) {
            logMixPanelEvent(`Carry fund ${payload.id ? "updated" : "created"}`);
            handleCloseModal();
            toast.success(`Carry Fund ${payload.id ? "updated" : "created"}`)
        } else {
            toast.error(`Error ${payload.id ? "updating" : "creating"} carry fund`)
        }
        setSubmitting(false);
    };

    const getCurrenciesOptions = () => {
        return currencies.map((currency: ICurrency) => ({
            value: currency.id,
            label: currency.code,
        }));
    };

    const getCurrencyOption = (value: any) => {
        if (value && value.value) {
            return value;
        }
        const options = getCurrenciesOptions();
        return find(options, (currency) => currency.value === value);
    };

    const fetchCurrencies = async () => {
        const fetchedCurrencies = await API.getCurrencies();
        setCurrencies(fetchedCurrencies);
    };


    const getInitialValues = () => {
        if (initState && !isEmpty(initState) && currencies.length) {
            // return {
            //     name: initState.name,
            //     estimated_value: initState.estimated_value,
            //     estimated_value_date: initState.estimated_value_date,
            //     fair_market_value: initState.fair_market_value,
            //     fair_market_value_date: initState.fair_market_value_date,
            //     fund_currency: getCurrencyOption(initState.fund_currency),
            //     target_fund_size: initState.target_fund_size
            // };
            return {...initState, fund_currency: getCurrencyOption(initState.fund_currency)}
        } else return INITIAL_VALUES;
    };

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
                    return (
                        <CustomStyledForm onSubmit={handleSubmit}>
                            <FormBody>
                                <FormTextFieldRow
                                    label="Fund Name"
                                    name="name"
                                    placeholder="Name"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.name}
                                />
                                <FormSelectorFieldRow
                                    label="Currency of fund"
                                    name="fund_currency"
                                    placeholder="Select"
                                    onChange={(value: any) => setFieldValue("fund_currency", value)}
                                    onBlur={handleBlur}
                                    value={getCurrencyOption(values.fund_currency)}
                                    options={getCurrenciesOptions()}
                                />

                                <CurrencyInput
                                    label="Target Fund Size (Fund Currency)"
                                    name="target_fund_size"
                                    placeholder="Enter Target Fund Size (Fund Currency)"
                                    onChange={(name: any, value: any) => {
                                        setFieldValue(name, value);
                                    }}
                                    value={values.target_fund_size}
                                    error={get(errors, 'target_fund_size')}
                                />
                            </FormBody>
                                <TooltipWrapper enable={Boolean (initState?.estimated_value_from_deal)} text="Controlled by associated deals">
                                    <Row>
                                <Col>
                                <CurrencyInput
                                    label="Estimated Carry Value"
                                    name="estimated_value"
                                    placeholder="Enter Estimated Carry Value"
                                    onChange={(name: any, value: any) => {
                                        setFieldValue(name, value);
                                    }}
                                    value={values.estimated_value}
                                    error={get(errors, 'estimated_value')}
                                    additionalProps={{
                                        key: `estimated_value`,
                                        style:initState?.estimated_value_from_deal? {opacity:0.5, cursor:"not-allowed"}:{},
                                        disabled: Boolean (initState?.estimated_value_from_deal)
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
                                        disabled={Boolean(initState?.estimated_value_from_deal)}
                                    />
                                </DatePickerContainer>
                                </Col>
                                </Row>
                                </TooltipWrapper>
                                <TooltipWrapper enable={Boolean(initState?.fair_market_value_from_deal)} text="Controlled by associated deals">
                            <Row>
                                <Col>
                                <CurrencyInput
                                    label="Fair Market Value"
                                    name="fair_market_value"
                                    placeholder="Enter Fair Market Carry Value"
                                    onChange={(name: any, value: any) => {
                                        setFieldValue(name, value);
                                    }}
                                    value={values.fair_market_value}
                                    error={get(errors, 'fair_market_value')}
                                    additionalProps={{
                                        key: `fair_market_value`,
                                        style:initState?.fair_market_value_from_deal? {opacity:0.5, cursor:"not-allowed"}:{},
                                        disabled: Boolean(initState?.fair_market_value_from_deal)
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
                                        disabled={Boolean(initState?.fair_market_value_from_deal)}
                                    />
                                </DatePickerContainer>
                                </Col>
                            </Row>
                            </TooltipWrapper>
                            <ButtonsContainer className="text-right">
                                <CustomOutlinedButton onClick={handleCloseModal}>Cancel</CustomOutlinedButton>
                                <SecondaryButton type="submit" disabled={isSubmitting || !isEmpty(errors)}>Save</SecondaryButton>
                            </ButtonsContainer>
                        </CustomStyledForm>
                    );
                }}
            </Formik>
        </Container>
    )
}

const FundModal = ({ handleCloseModal, refetchData, initState }: ICreateFundModal) => {
    return (
        <>
            <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
                <Modal.Header closeButton style={{ background: '#F5F7F8' }}>
                    <Modal.Title>{initState?.fund_id ? "Edit" : "Create"} Fund</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FundForm
                        handleCloseModal={handleCloseModal}
                        refetchData={refetchData}
                        initState={initState}></FundForm>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default FundModal;