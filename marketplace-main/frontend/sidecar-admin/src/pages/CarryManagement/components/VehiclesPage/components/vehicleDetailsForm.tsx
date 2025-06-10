import { Formik } from "formik"
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { FormTextFieldRow } from "../../../../../components/Form/TextField";
import { VALIDATION_SCHEMA, VEHICLE_DETAILS_INIT_DATA } from "../constants"
import { OutlinedButton, SecondaryButton } from "../../styles";
import { FormFieldsWrapper } from "./styles";

const VehicleDetailsForm = ({ data, handleNext, handleCloseModal }: any) => {

    const getInitialValues = () => {
        return {
            common_name: data.common_name,
            legal_name: data.legal_name,
        }
    }

    const onSubmit = async (values: any) => {
        handleNext && handleNext(values)
    }

    return <Formik
        initialValues={data ? getInitialValues() : VEHICLE_DETAILS_INIT_DATA}
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
            console.log("errors are ", errors)
            return <Form onSubmit={handleSubmit}>
                <FormFieldsWrapper>
                <Row>
                    <Col md={6}>
                        <FormTextFieldRow
                            name="common_name"
                            label='Vehicle Common Name'
                            placeholder="Enter common name"
                            value={values.common_name}
                            onChange={(e: any) => setFieldValue(e.target.name, e.target.value)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <FormTextFieldRow
                            name="legal_name"
                            label='Vehicle Legal Name'
                            placeholder="Enter legal name"
                            value={values.legal_name}
                            onChange={(e: any) => setFieldValue(e.target.name, e.target.value)}
                        />
                    </Col>
                </Row>
                </FormFieldsWrapper>
                <Modal.Footer className="mt-3" style={{background: 'rgb(245, 247, 248)'}}>
                    <OutlinedButton onClick={handleCloseModal} variant="secondary">
                        Cancel
                    </OutlinedButton>
                    <SecondaryButton type="submit">
                        Next
                    </SecondaryButton>
                </Modal.Footer>
            </Form>
        }}
    </Formik>
}

export default VehicleDetailsForm;