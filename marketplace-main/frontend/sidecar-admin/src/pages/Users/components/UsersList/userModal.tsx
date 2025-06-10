import {each, find} from "lodash";
import React, {FC, useEffect, useState} from "react";
import {Button, Col, Form, Modal, ModalBody, ModalFooter, Row,} from "react-bootstrap";
import {StyledForm} from "../../../../presentational/forms";
import {AccessLevelDiv, CheckboxBlock, CheckboxWrapper, ErrorText, UserActionDiv} from "../../styles";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "../CreateUser/constants";
import {Formik} from "formik";
import {useCreateUserMutation, useGetGroupsQuery, useUpdateUserMutation} from "../../../../api/rtkQuery/usersApi";
import {IGroup} from "../../interfaces";
import {DocumentFormDiv} from "../../../../components/CompanyInfo/styles";
import Alert from "react-bootstrap/Alert";

interface IUserModal {
  isOpen: boolean;
  onHide: () => void;
  user: any;
}

const UserModal: FC<IUserModal> = ({isOpen, onHide, user}) => {
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [error, setError] = useState<string|null>(null);
  const {data: groups} = useGetGroupsQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    return () => {
      setSelectedGroups([])
    }
  }, [])

  useEffect(() => {
    const temp: any = [];
    if (user) {
      each(groups, (group) => {
        if (find(user.groups, (userGroup) => userGroup.id === group.id)) {
          temp.push(group.id);
        }
      });
    }
    setSelectedGroups(temp);
  }, [groups, user]);

  const handleHide = () => {
    setSelectedGroups([])
    setError(null)
    onHide()
  }

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    const payload = {
      email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
      group_ids: selectedGroups
    }
    try {
      if (!user) {
        await createUser(payload).unwrap();
      } else {
        await updateUser({userId: user.id, ...payload}).unwrap();

      }
      setError(null)
      handleHide();
    }
    catch (e) {
      console.log("Exception occurred")
      setError(`User ${user ? 'update' : 'creation'} Failed`)
    }
    setSubmitting(false);
  }


  let initialValues = {...INITIAL_VALUES}
  if (user) {
    initialValues = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    }
  }

  return (
    <Modal show={isOpen} onHide={handleHide} size="lg">
      <Modal.Header>
        <Modal.Title>User Management</Modal.Title>
      </Modal.Header>
      <ModalBody>
        {error && <Alert variant={'danger'}>
          {error}
        </Alert>}
        <DocumentFormDiv>
          <Formik
            initialValues={initialValues}
            validationSchema={VALIDATION_SCHEMA}
            onSubmit={onSubmit}
          >
            {({
                values,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
              <StyledForm onSubmit={handleSubmit}>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="formFilterValue">
                      <Form.Label className={'text-label'}>First Name</Form.Label>
                      <Form.Control
                        className={'text-input'}
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.firstName}
                      />
                      <ErrorText name="firstName" component="div"/>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formFilterValue">
                      <Form.Label className={'text-label'}>Last Name</Form.Label>
                      <Form.Control
                        className={'text-input'}
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.lastName}
                      />
                      <ErrorText name="lastName" component="div"/>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group controlId="formFilterValue">
                      <Form.Label className={'text-label mt-0'}>Email</Form.Label>
                      <Form.Control
                        className={'text-input'}
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      <ErrorText name="email" component="div"/>
                    </Form.Group>
                  </Col>
                </Row>
                <AccessLevelDiv>Level of Access</AccessLevelDiv>
                <CheckboxWrapper>
                  {groups?.map((group: IGroup) => (

                    <CheckboxBlock
                      label={<p className={"m-0"}>{group.name}</p>}
                      name={`kr-reverse-inqury`}
                      type={"checkbox"}
                      checked={selectedGroups.includes(group.id)}
                      onChange={(e: any) => {
                        if (e.target.checked) {
                          setSelectedGroups([...selectedGroups, group.id]);
                        } else {
                          setSelectedGroups(
                            selectedGroups.filter((id: number) => id !== group.id)
                          );
                        }
                      }}
                    />
                  ))}
                </CheckboxWrapper>
                <UserActionDiv>
                  <Button
                    variant="primary"
                    type="submit"
                    className={'filled'}
                    disabled={isSubmitting}>
                    Save
                  </Button>
                  <Button
                    variant="outline-primary"
                    type="button"
                    onClick={handleHide}
                  >
                    Cancel
                  </Button>
                </UserActionDiv>
              </StyledForm>
            )}
          </Formik>
        </DocumentFormDiv>
      </ModalBody>
    </Modal>
  )
    ;
};

export default UserModal;
