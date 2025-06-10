import { FunctionComponent, memo } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Formik, FormikHelpers } from "formik";
import TextArea from "../../../../components/Form/TextArea";
import { EditApplicantWrapper } from "./styles";

interface IWithdrawConfirmation {
    show: boolean;
    callbackSubmit: (comment: string) => void;
    handleClose: () => void;
}

const initValues = {
    comment: ""
}

const WithdrawConfirmation: FunctionComponent<IWithdrawConfirmation> = ({
    show,
    callbackSubmit,
    handleClose,
}) => {
    const onSubmit = (values: typeof initValues, { setSubmitting }: FormikHelpers<typeof initValues>) => {
        setSubmitting(true);
        callbackSubmit(values.comment || "");
        handleClose();
    }
    return (

        <Modal size={"lg"} show={show} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title>Withdraw applicant</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={initValues}
                onSubmit={onSubmit}
            >
                {({
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    setFieldValue,
                    errors
                }) => (
                    <>
                        <Modal.Body className="p-0">
                            <EditApplicantWrapper>
                                <TextArea
                                    label="Comment"
                                    name="comment"
                                    placeholder=""
                                    onChange={(e: any) => setFieldValue('comment', e.target.value)}
                                    onBlur={handleBlur}
                                    value={values.comment}
                                />
                            </EditApplicantWrapper>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-primary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                disabled={isSubmitting}
                                variant="primary"
                                onClick={() => handleSubmit()}
                            >
                                Submit
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Formik>
        </Modal>
    );
};

export default memo(WithdrawConfirmation);
