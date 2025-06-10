import Container from "react-bootstrap/Container";
import { StyledForm } from "../../../../../../../../presentational/forms";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import { Formik } from "formik";
import { INITIAL_VALUES } from "./constants";
import API from "../../../../../../../../api/backendApi";
import { useParams } from "react-router-dom";
import { DEFAULT_ALLOCATION_ACTION_PAYLOAD, calculateAllocatedBps, getRefPoolId } from "../../../../utils";
import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { CARRY_ALLOCATE_TYPE } from "../../../../constants";

interface DilutionFormProps {
  closeModal: () => void;
  pool?: any;
  refetchData?: any;
  hierarchy: any[];
  unAllocatedBps: number;
  dilutionMode: string;
}

const ButtonsContainer = styled.div`
  text-align: right;
`;

const DilutionForm = ({
  pool,
  refetchData,
  closeModal,
  hierarchy,
  unAllocatedBps,
  dilutionMode,
}: DilutionFormProps) => {
  const { externalId } = useParams<{ externalId: string }>();
  const [users, setUsers] = useState<any[]>([]);
  //   const maxBps = (pool?.bps ?? 0) + unAllocatedBps;
  //   const minBps = pool ? calculateAllocatedBps(pool) : 0;

  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  const generateInitUsers = (_users: any[]) => {
    return _users.map((obj: any) => {
      const { display_name, email } = obj;
      return { name: display_name, email, bps: 0 };
    });
  };

  const generateUsersList=(allUsers:any[],poolAllocations:any[])=>{
    return allUsers.map((item1) => {
        const matchingItem = poolAllocations.find((item2) => item2.user.email === item1.email);
        if (matchingItem) {
          const {display_name:name,email}= matchingItem.user
          const {bps} = matchingItem
          return {name,email,bps} ;
        }
        return item1;
      });
  }

  const handleFetchUsers = async () => {
  const res = await API.getAllUsers();
  const allUsers = generateInitUsers(res);
  const poolAllocations = pool?.allocations || [];

  const allUsersWithUpdatedBps = generateUsersList(allUsers, poolAllocations);

  const _usersWithNoBps = allUsersWithUpdatedBps.filter(
    (allocation: any) => allocation.bps == 0
  );
  setUsers(_usersWithNoBps);

    // const poolParticipants = pool?.participants || [];
    // if (poolParticipants.length > 0) {
    //   const _users = poolParticipants.filter(
    //     (participant: any) => participant.bps == 0
    //   );
    //   setUsers(_users);
    // } else {
    //   const res = await API.getAllUsers();
    //   setUsers(generateInitUsers(res));
    // }
  };

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const { name, bps, email } = values;
    const { base_pool_id, parent_pool_id } = getRefPoolId(hierarchy);
    const payload = {
      ...DEFAULT_ALLOCATION_ACTION_PAYLOAD,
      base_pool_id,
      parent_pool_id,
      pool_name: dilutionMode === "pool" ? name : '',
      email: dilutionMode === "allocation" ? email : '',
      bps,
      type: CARRY_ALLOCATE_TYPE.DILUTE,
    };

    const res = await API.allocationAction(externalId,payload);
    if (res.success) {
      refetchData();
    }

    setSubmitting(false);
    closeModal();
  };

  useEffect(() => {
    if (dilutionMode === "allocation") handleFetchUsers();
  }, [dilutionMode]);

  return (
    <Container fluid className={"pb-5"}>
      <Formik
        initialValues={INITIAL_VALUES}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setValues,
        }) => {
          return (
            <StyledForm onSubmit={handleSubmit}>
              {dilutionMode === "allocation" ? (
                <Form.Group controlId="email">
                  <Form.Label>Select User</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={handleChange}
                    name="email"
                    onBlur={handleBlur}
                    value={values.email}
                  >
                    <option value="">Select User...</option>
                    {users.map((user, index) => (
                      <option key={user.email} value={user.email}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              ) : (
                <FormTextFieldRow
                  label="Pool Name"
                  name="name"
                  placeholder="Pool Name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                />
              )}
              <FormTextFieldRow
                label="Basis Points"
                name="bps"
                placeholder="Basis Points"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.bps}
                // helperText={`Enter between ${minBps} & ${maxBps}`}
              />

              <ButtonsContainer className="text-right">
                <Button
                  variant="outline-primary"
                  type="submit"
                  className={"submit-button"}
                  disabled={isSubmitting}
                >
                  Dilute
                </Button>
                <Button
                  variant="outline-primary"
                  type="cancel"
                  className={"cancel-button"}
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </ButtonsContainer>
            </StyledForm>
          );
        }}
      </Formik>
    </Container>
  );
};

export default DilutionForm;
