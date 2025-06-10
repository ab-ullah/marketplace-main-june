import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import { Formik } from "formik";
import API from '../../../../../api/backendApi';
import { INIT_DATA, VALIDATION_SCHEMA } from "../constants";
import { FormTextFieldRow } from "../../../../../components/Form/TextField";
import { Col, Form, Row } from "react-bootstrap";
import FormTextAreaRow from "../../../../../components/Form/TextArea";
import { FormSelectorFieldRow } from "../../../../../components/Form/SelectorField";
import { OutlinedButton, SecondaryButton } from "../../styles";
import { FormFieldsWrapper } from "../../VehiclesPage/components/styles";

const ShareClassModal = ({ isOpen, handleCloseModal, data, refetch }: any) => {

    const [vestingScheduleOptions, setVestingSchedulesOptions] = useState([])
    const [formSubmissionError, setFormSubmissionError] = useState<any>(null)

    
    const fetchVestingSchedule = async () => {
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
        values.vesting_schedule = values.vesting_schedule?.value
            const shareClassCall = data ? API.updateCarryShareClasses : API.createCarryShareClasses
            const response = await shareClassCall(values)
            if(response.success) { 
                refetch()
                handleCloseModal()
             }
            else setFormSubmissionError(`An error occurred while ${data ? 'updating' : 'creating'} share class`)
    }

    useEffect(() => {
        fetchVestingSchedule()
        return () => {
            setFormSubmissionError(null)
        }
    }, [])
    return (
        <Modal size={"lg"} show={isOpen} onHide={() => handleCloseModal()}>
            <Modal.Header closeButton style={{ background: '#F5F7F8' }}>
                <Modal.Title>{data ? 'Update' : 'New'} Share Class</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{padding: '0'}}>
                <Formik
                    initialValues={data || INIT_DATA}
                    validationSchema={VALIDATION_SCHEMA}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({
                        errors,
                        values,
                        isSubmitting,
                        handleSubmit,
                        setFieldValue
                    }) => {
                        return <Form onSubmit={handleSubmit}>
                        <FormFieldsWrapper>
                        <Row>
                            <Col md={6}>
                                <FormTextFieldRow
                                    name="legal_name"
                                    label='Name'
                                    placeholder="Enter share class name"
                                    value={values.legal_name}
                                    onChange={(e: any) => setFieldValue(e.target.name, e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormTextAreaRow
                                    name="description"
                                    label='Description'
                                    placeholder="Enter description"
                                    value={values.description}
                                    onChange={(e: any) => setFieldValue(e.target.name, e.target.value)}
                                    onBlur={() => { }}
                                />
                            </Col>
                            {/* <div className="text-danger">{errors?.description}</div> */}
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormSelectorFieldRow
                                    label="Select Default Vesting Schedule"
                                    name="vesting_schedule"
                                    placeholder="Select Default Vesting Schedule"
                                    onChange={(value: any) => setFieldValue("vesting_schedule", value)}
                                    onBlur={() => { }}
                                    value={vestingScheduleOptions.find((option: any) => {
                                        return option.value === values.vesting_schedule
                                    })}
                                    options={vestingScheduleOptions}
                                    optional
                                />
                            </Col>
                        </Row>
                        {formSubmissionError && <div className="text-danger mt-2">{formSubmissionError}</div>}
                        </FormFieldsWrapper>
                        <Modal.Footer className="mt-4" style={{background: 'rgb(245, 247, 248)'}}>
                            <OutlinedButton onClick={handleCloseModal} variant="secondary">
                                Cancel
                            </OutlinedButton>
                            <SecondaryButton type="submit">
                                Save
                            </SecondaryButton>
                        </Modal.Footer>
                    </Form>
                    }}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default ShareClassModal;
