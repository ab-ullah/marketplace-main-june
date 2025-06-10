import { PillButton, SecondaryButton } from "../../../styles";
import { useMemo, useState } from "react";
import { filter, get, isEmpty, map, omit } from "lodash";
import { FormSelectorFieldRow } from "../../../../../../components/Form/SelectorField";
import CurrencyInput from "../../../../../Funds/components/CreateFund/currencyInput";
import ToggleSwitch from "../../../../../../components/ToggleSwitch";
import { Formik } from "formik";
import {
  getColumns,
  appliesToOptions,
  INITIAL_VALUES,
  VALIDATION_SCHEMA,
} from "./constants";
import API from "../../../../../../api/backendApi";
import { toast } from "react-toastify";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { useGetCarrySubpoolsFlagQuery } from "../../../../../../api/rtkQuery/commonApi";
import { Description, HurdlePreferenceWrapper, Label, StyledForm, StyledModal } from "./styles";

interface ICarryHurdleModalProps {
  handleCloseModal: (_refetch?:boolean)=>void;
  carryPlanDetail: any;
}

const CarryHurdleModal = ({
  handleCloseModal,
  carryPlanDetail,
}: ICarryHurdleModalProps) => {
  const { data: carrySubpoolsFlag } = useGetCarrySubpoolsFlagQuery();
  const [selectSourceResetTrigger, setSelectSourceResetTrigger] =
    useState(false);
  const [sourceDisabled, setSourceDisabled] = useState(false);
  const isCarrySubpoolsActive = Boolean(carrySubpoolsFlag?.is_active);
  const { allocations } = carryPlanDetail;

  const allocationOptions = useMemo(() => {
    return map(allocations, (allocation: any) => ({
      ...allocation,
      label: `${allocation.name} - ${allocation.bps}`,
      value: allocation.allocation_id,
    }));
  }, [allocations.length]);

  const handleCreateHurdle = async (values: any) => {
    const payload = {
      ...values,
      impact_type:get(values,'impact_type.value'),
      applies_to:get(values,'applies_to.value'),
    }
    const res = await API.createCarryHurdle(
      carryPlanDetail.carryPlanId,
      payload
    );

    if (res.success) {
      toast.success("Hurdle created successfully !!");
      handleCloseModal(true);
    } else {
      const firstError = res?.data?.[Object.keys(res.data)?.[0]]?.[0]
      toast.error(firstError)
    }
  };

  const handleAssignSourceAllocation = () => {
    if (sourceDisabled) {
      setSelectSourceResetTrigger((prev) => !prev);
      setSourceDisabled(false);
    } else {
      setSourceDisabled(true);
    }
  };

  return (
    <StyledModal size={"xl"} show={true} onHide={() => handleCloseModal()}>
      <StyledModal.Header closeButton>
        <StyledModal.Title>Create Hurdle</StyledModal.Title>
      </StyledModal.Header>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={handleCreateHurdle}
        enableReinitialize
      >
        {({
          values,
          setValues,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          errors,
        }) => {
          const handleToggleChange = () => {
            setValues({
              ...values,
              is_supercharged: !Boolean(values.is_supercharged),
              supercharge_end_value: "",
            });
          };
          const handleSelectSourceAllocationRow = (_rows: any[]) => {
            const rows = _rows.filter((row) => row);
            setFieldValue("source_allocations", rows);
          };
          const handleSelectImpactedAllocationRow = (_rows: any[]) => {
            const rows = _rows.filter((row) => row);
            setFieldValue("impacted_allocations", rows);
          };

          const sourceAllocationOptions = sourceDisabled
            ? filter(allocationOptions, (opt: Record<string, any>) =>
                (values.source_allocations as string[]).includes(
                  get(opt, "allocation_id", "")
                )
              )
            : filter(allocationOptions,opt=>!(opt?.ecv_hurdle && opt?.fmv_hurdle));

          const affectedAllocationOptions = filter(
            allocationOptions,
            (opt: any) =>
              !(get(values, "source_allocations") as string[]).includes(
                opt.allocation_id
              )
          );

          return (
            <>
              <StyledModal.Body>
                <StyledForm
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div className="d-flex justify-content-end"></div>
                  <div className="d-flex w-auto align-items-end gap-3">

                    <CurrencyInput
                      label="Hurdle Rate"
                      name="hurdle_rate"
                      placeholder="Hurdle Rate"
                      onChange={(name: any, value: any) => {
                        setFieldValue(name, value);
                      }}
                      value={values.hurdle_rate}
                      additionalProps={{
                        key: `hurdle_rate`,
                        style: isSubmitting
                          ? { opacity: 0.5, cursor: "not-allowed" }
                          : {},
                        disabled: Boolean(isSubmitting),
                      }}
                    />
                    <div style={{width: '200px'}}>
                    <FormSelectorFieldRow
                      label="Applies To"
                      name="applies_to"
                      placeholder="Applies To"
                      onChange={(value: any) => setFieldValue("applies_to", value)}
                      value={values.applies_to}
                      options={appliesToOptions}
                    />
                    </div>
                     <HurdlePreferenceWrapper>
                     <ToggleSwitch
                        checked={Boolean(values.is_supercharged)}
                        onChange={handleToggleChange}
                        title="Post-hurdle preference"
                        disabled={isSubmitting}
                      />
                  <CurrencyInput
                      label=""
                      name="supercharge_end_value"
                      placeholder="Preference End Value"
                      onChange={(name: any, value: any) => {
                        setFieldValue(name, value);
                      }}
                      value={values.supercharge_end_value}
                      additionalProps={{
                        key: `supercharge_end_value`,
                        style: (Boolean(isSubmitting) || !Boolean(values.is_supercharged))
                          ? { opacity: 0.5, cursor: "not-allowed" }
                          : {},
                        disabled: Boolean(isSubmitting) || !Boolean(values.is_supercharged),
                      }}
                    />
                     </HurdlePreferenceWrapper>
                      <SecondaryButton
                      onClick={() => {
                        handleAssignSourceAllocation();
                        setFieldValue("impacted_allocations", []);
                      }}
                      disabled={isEmpty(values.source_allocations)}
                    >
                      {sourceDisabled ? "Reset" : "Next"}
                    </SecondaryButton>
                  </div>
                  <div className="mt-4">
                    <div className="d-flex justify-content-between">
                      <div>
                      <Label>Apply hurdle to</Label>
                      <Description>Allocations having hurdles for both FMV and ECV are not listed in the table below</Description>
                      </div>
                    </div>
                    <RsuiteTable
                      height={
                        sourceDisabled
                          ? `${values.source_allocations.length * 100 + 40}px`
                          : "400px"
                      }
                      allowColMinWidth={true}
                      rowSelection={true}
                      dataKey={"allocation_id"}
                      handleSelectRow={(rows) =>
                        handleSelectSourceAllocationRow(rows)
                      }
                      selectResetTrigger={selectSourceResetTrigger}
                      columns={getColumns(isCarrySubpoolsActive)}
                      data={sourceAllocationOptions}
                      rowHeight={72}
                      selectionRowWidth={30}
                      wordWrap={true}
                      disableRowSelection={sourceDisabled}
                    />
                  </div>

                  {sourceDisabled &&
                    Boolean(affectedAllocationOptions.length) && (
                      <div className="mt-5">
                        <Label>Reallocate to</Label>
                        <RsuiteTable
                          height="400px"
                          allowColMinWidth={true}
                          rowSelection={true}
                          dataKey={"allocation_id"}
                          selectionRowWidth={30}
                          handleSelectRow={(rows) =>
                            handleSelectImpactedAllocationRow(rows)
                          }
                          columns={getColumns(isCarrySubpoolsActive)}
                          data={affectedAllocationOptions}
                          rowHeight={72}
                          wordWrap={true}
                        />
                      </div>
                    )}
                </StyledForm>
              </StyledModal.Body>
              <StyledModal.Footer>
                <PillButton
                  borderColor="#4A47A3"
                  color="#4A47A3"
                  font={{
                    "font-size": "14px",
                    "font-family": "Quicksand Bold",
                  }}
                  onClick={() => handleCloseModal()}
                >
                  Cancel
                </PillButton>
                <PillButton
                  borderColor="#4A47A3"
                  color="white"
                  borderWidth="1px"
                  background="#4A47A3"
                  font={{
                    "font-size": "14px",
                    "font-family": "Quicksand Bold",
                  }}
                  onClick={() => handleSubmit()}
                  disabled={!sourceDisabled || isSubmitting || !isEmpty(errors)}
                >
                  Create
                </PillButton>
              </StyledModal.Footer>
            </>
          );
        }}
      </Formik>
    </StyledModal>
  );
};

export default CarryHurdleModal;
