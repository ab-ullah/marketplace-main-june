import { Button, Modal } from "react-bootstrap"
import * as Yup from "yup";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField"
import { useEffect, useState } from "react"
import { PointsFieldWrapper, StyledButton } from "./styles";
import { useCreateNewPoolMutation, useUpdateCarryPoolMutation } from "../../../../../../../../api/rtkQuery/carryApi";
import { Formik } from "formik";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import FormNumberField from "../../../../../../../../components/Form/NumberField";
import API from '../../../../../../../../api/backendApi';
import { map } from "lodash";
import { PLAN_ID_PARAM } from "../../../../../../constants";

  const getSchema = (pointLimit: number) => {
    return Yup.object({
        name: Yup.string().required('Required'),
        vehicle: Yup.object().required("Required").nullable(),
        share_class: Yup.object().required('Required').nullable(),
        vesting_schedule: Yup.object().required('Required').nullable(),
        bps: Yup.number().required("Required").min(1, 'Points should be greater than 0').max(pointLimit, `Points must not exceed ${pointLimit}`).nullable()
      });
  }

const AddNewPoolModal = ({
    totalExistingPoints,
    isOpen,
    onClose
}: any) => {
    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get(PLAN_ID_PARAM);
    const [carryVehicleOptions, setCarryVehicleOptions] = useState<any[]>([]);
    const [vestingSchedulesOptions, setVestingSchedulesOptions] = useState<any[]>(
        []
    );

    const [addNewPool, {isLoading}] = useCreateNewPoolMutation()

    const fetchVehicles = async () => {
        const response = await API.fetchCarryVehicles();
        if (response.success) {
            setCarryVehicleOptions(
                response.data?.map((vehicle: any) => ({
                    ...vehicle,
                    label: vehicle.legal_name,
                    value: vehicle.id,
                }))
            );
        }
    };
    const fetchShareClasses = (selectedVehicle: Record<string, any>) => {
        if (selectedVehicle) {
            return map(selectedVehicle?.classes, (shareClass: any) => ({
                ...shareClass.template_share_class,
                label: shareClass.template_share_class.legal_name,
                value: shareClass.template_share_class.id,
            }));
        } else return [];
    };

    const handleFetchVestingSchedule = async () => {
        const res = await API.fetchVestingSchedule();
        if (res.success) {
            const schedules = res.data?.map((schedule: any) => ({
                label: schedule.name,
                value: schedule.id,
            }));
            setVestingSchedulesOptions(schedules);
        }
    };


    const onSubmit = async (values: any) => {
        await addNewPool({
            carry_plan: planId,
            name: values.name,
            bps: values.bps,
            vehicle: values.vehicle.id,
            vesting_schedule: values.vesting_schedule.value,
            template_share_class: values.share_class.id
        })
        onClose(true);
    }

    useEffect(() => {
        fetchVehicles();
        handleFetchVestingSchedule();
    }, []);

    return <Modal size="lg" show={isOpen} onHide={onClose}>
        <Modal.Header closeButton>
            Add New Pool
        </Modal.Header>
        <Modal.Body>
            <Formik
                initialValues={{
                    name: '',
                    vehicle: null,
                    share_class: null,
                    vesting_schedule: null,
                    bps: 0
                }}
                validationSchema={getSchema(totalExistingPoints)}
                onSubmit={onSubmit}
            >
                {({
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <FormTextFieldRow
                            label="Carry Pool Name"
                            placeholder=""
                            name="name"
                            onChange={onchange}
                            value={values.name}
                        />
                        <FormSelectorFieldRow
                            label="Select vehicle to apply"
                            name="vehicle"
                            placeholder="Vehicle"
                            onChange={(value: any) => {
                                setFieldValue('vehicle', value)
                                setFieldValue('share_class', null)
                                setFieldValue('vesting_schedule', null)
                            }}
                            value={values.vehicle}
                            options={carryVehicleOptions}
                        />
                        <FormSelectorFieldRow
                            label="Select share class to apply"
                            name="share_class"
                            placeholder="Share Class"
                            onChange={(value: any) => {
                                setFieldValue("share_class", value);
                                setFieldValue('vesting_schedule', vestingSchedulesOptions?.find(
                                    (opt: any) => opt.value == value.vesting_schedule
                                ) || null)
                            }}
                            value={values.share_class}
                            options={values.vehicle ? fetchShareClasses(values.vehicle as unknown as Record<string, any>) : []}
                        />
                        <FormSelectorFieldRow
                            label="Select vesting schedule to apply"
                            name="vesting_schedule"
                            placeholder="Select"
                            onChange={(value: any) => { }}
                            value={values.vesting_schedule}
                            options={vestingSchedulesOptions}
                        />
                        <PointsFieldWrapper>
                            <FormNumberField
                                label="Max # of Points in Pool"
                                name="bps"
                                placeholder="Max # of Points in Pool"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.bps} />
                        </PointsFieldWrapper>
                        <Modal.Footer>
                            <Button disabled={isLoading} variant="text" onClick={()=>onClose()}>Cancel</Button>
                            <StyledButton disabled={isLoading} type="submit">Save</StyledButton>
                        </Modal.Footer>
                    </form>
                )}
            </Formik>
        </Modal.Body>
    </Modal>
}

export default AddNewPoolModal;