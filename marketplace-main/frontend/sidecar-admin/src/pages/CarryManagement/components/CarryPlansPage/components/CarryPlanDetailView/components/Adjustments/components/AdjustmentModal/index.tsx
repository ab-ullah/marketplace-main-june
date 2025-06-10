import { FC } from "react";
import { Modal } from "react-bootstrap";
import { OutlinedButton, SecondaryButton } from "../../../../../../../styles";
import { AllocationValue, ButtonsContainer, DatePickerContainer } from "../../styles";
import { formatWithParenthesis } from "../../../../../../../../../../utils/currency";
import { ErrorMessage, Formik } from "formik";
import { StyledForm } from "../../../../../../../../../../presentational/forms";
import { FormSelectorFieldRow } from "../../../../../../../../../../components/Form/SelectorField";
import FormNumberField from "../../../../../../../../../../components/Form/NumberField";
import FormTextAreaRow from "../../../../../../../../../../components/Form/TextArea";
import ReactDatePickerComp from "../../../../../../../../../../components/ReactDatePickerComp";
import moment from "moment";
import { VALIDATION_SCHEMA } from "../../constants";
import { useCreateAllocationAdjustmentMutation } from "../../../../../../../../../../api/rtkQuery/carryApi";
// @ts-ignore
import { ADJUSTMENT_OPTIONS } from "./constants";
import CurrencyInput from "../../../../../../../../../Funds/components/CreateFund/currencyInput";

type AdjustmentModalProps = {
    selectedAllocation: Record<string,any>;
    carryPlanId: string;
    isOpen: boolean;
    initValues: any;
    onClose: () => void;
    afterSubmit: () => void;
}
export const AdjustmentModal: FC<AdjustmentModalProps> = ({ selectedAllocation, carryPlanId, isOpen, initValues, onClose, afterSubmit }) => {
    const {allocation_id, estimated_value, fair_market_value}= selectedAllocation
    const [ createAdjustment ] = useCreateAllocationAdjustmentMutation()

    const handleSubmit = async (values: any) => {
        const { value_type, effective_date, adjustment, note  } = values;
        await createAdjustment({
            "allocation_id": allocation_id,
            "carry_plan": carryPlanId,
            value_type: value_type.value,
            effective_date: moment(effective_date).format("YYYY-MM-DD"),
            adjustment,
            note
            }).unwrap()
        afterSubmit()
        onClose()
    }

    return <Modal size="xl" show={isOpen} onHide={onClose}>
        <Modal.Header>
            Create Adjustment
        </Modal.Header>
        <Modal.Body>
            <AllocationValue>
                <b>Estimated Value:{" "}</b>
                <p>{formatWithParenthesis(estimated_value)}</p>
            </AllocationValue>
            <AllocationValue>
                <b>Fair Market Value:{" "}</b>
                <p>{formatWithParenthesis(fair_market_value)}</p>
            </AllocationValue>
            <Formik
                initialValues={initValues || {}}
                validationSchema={VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
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
                                <FormSelectorFieldRow
                                    label="Adjustment Type"
                                    name="value_type"
                                    placeholder="Select Type"
                                    onChange={(val: any) => setFieldValue("value_type", val)}
                                    value={values.value_type}
                                    options={ADJUSTMENT_OPTIONS}
                                />

                            </div>
                            <DatePickerContainer className="date-container">
                                <span className="field-label mb-2">Effective Date</span>
                                <ReactDatePickerComp
                                    selected={values.effective_date ? moment(values.effective_date).toDate() : null}
                                    onChange={(v: any) => {
                                        setFieldValue('effective_date', v);
                                    }}
                                    placeholderText="Pick a date"
                                    name={'effective_date'}
                                />
                                <ErrorMessage name="effective_date" />
                            </DatePickerContainer>
                            <CurrencyInput
                                label="Adjustment"
                                name="adjustment"
                                placeholder={values.value_type?.label || ""}
                                onChange={(name: any, value: any) => { setFieldValue(name, value); }}
                                value={values.adjustment}
                             />
                            <FormTextAreaRow
                                name="note"
                                label='Note'
                                placeholder="Enter notes"
                                value={values.note}
                                onChange={(e: any) => setFieldValue('note', e.target.value)}
                                onBlur={() => { }}
                            />
                            <ButtonsContainer
                                className="text-right"
                            >
                                <OutlinedButton style={{ padding: '12px 26px 12px 26px !important', height: '48px !important' }} onClick={onClose}>Cancel</OutlinedButton>
                                <SecondaryButton type="submit" disabled={isSubmitting || hasErrors}>Save</SecondaryButton>
                            </ButtonsContainer>
                        </StyledForm>
                    );
                }}
            </Formik>
        </Modal.Body>
    </Modal>
}

export default AdjustmentModal;
