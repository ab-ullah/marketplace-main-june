import { Col, Form, Modal, ModalBody, Row } from "react-bootstrap";
import {
  AccessLevelDiv,
  CheckboxBlock,
  CheckboxWrapper,
  DocumentFormDiv,
  ErrorText,
  UserActionDiv,
} from "./styles";
import { Formik } from "formik";
import { StyledForm } from "../../../presentational/forms";
import {
  INITIAL_VALUES,
  PERMISSIONS_LIST,
  VALIDATION_SCHEMA,
} from "./constants";
import { ThemeButton } from "../../Button/styles";

interface IPermission {
  name: string;
  id: number;
}

interface InviteUserModalProps {
  onHide: () => void;
}

const InviteUserModal = ({ onHide }: InviteUserModalProps) => {

  const handleHide = () => {
    onHide();
  };

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    console.log(values);
    setSubmitting(false);
    handleHide();
  };

  return (
    <Modal show={true} onHide={handleHide} size="lg">
      <Modal.Header>
        <Modal.Title>Invite User</Modal.Title>
      </Modal.Header>
      <ModalBody>
        <DocumentFormDiv>
          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={VALIDATION_SCHEMA}
            onSubmit={onSubmit}
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue,
            }) => (
              <StyledForm onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="formFilterValue">
                      <Form.Label className={"text-label"}>
                        First Name
                      </Form.Label>
                      <Form.Control
                        className={"text-input"}
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.firstName}
                      />
                      <ErrorText name="firstName" component="div" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formFilterValue">
                      <Form.Label className={"text-label"}>
                        Last Name
                      </Form.Label>
                      <Form.Control
                        className={"text-input"}
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.lastName}
                      />
                      <ErrorText name="lastName" component="div" />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group controlId="formFilterValue">
                      <Form.Label className={"text-label mt-0"}>
                        Email
                      </Form.Label>
                      <Form.Control
                        className={"text-input"}
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      <ErrorText name="email" component="div" />
                    </Form.Group>
                  </Col>
                </Row>
                <AccessLevelDiv>Level of Access</AccessLevelDiv>
                <CheckboxWrapper>
                  {PERMISSIONS_LIST?.map((permission: IPermission) => (
                    <CheckboxBlock
                      label={<p className={"m-0"}>{permission.name}</p>}
                      name={`user-permission`}
                      type={"checkbox"}
                      checked={values.accessLevels.includes(permission.id)}
                      onChange={(e: any) => {
                        if (e.target.checked) {
                          setFieldValue("accessLevels", [
                            ...values.accessLevels,
                            permission.id,
                          ]);
                        } else {
                          setFieldValue(
                            "accessLevels",
                            values.accessLevels.filter(
                              (id: number) => id !== permission.id
                            )
                          );
                        }
                      }}
                    />
                  ))}
                </CheckboxWrapper>
                <UserActionDiv>
                  <ThemeButton
                    type="submit"
                    className={"filled"}
                    disabled={isSubmitting}
                  >
                    Save
                  </ThemeButton>
                  <ThemeButton
                    var="outlined"
                    type="button"
                    onClick={handleHide}
                  >
                    Cancel
                  </ThemeButton>
                </UserActionDiv>
              </StyledForm>
            )}
          </Formik>
        </DocumentFormDiv>
      </ModalBody>
    </Modal>
  );
};

export default InviteUserModal;
