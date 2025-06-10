import Container from "react-bootstrap/Container";
import { StyledForm } from "../../../../../../../../presentational/forms";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import { Formik, FieldArray } from "formik";
import API from "../../../../../../../../api/backendApi";
import { useParams } from "react-router-dom";
import { getRefPoolId } from "../../../../utils";
import { useEffect, useState } from "react";
import * as Yup from "yup";
// import DeleteIcon from "@material-ui/icons/DeleteOutlined";

const ButtonsContainer = styled.div`
  text-align: right;
`;

interface AllocationsFormProps {
  poolAllocations?: any[];
  closeModal: any;
  unAllocatedBps: number;
  hierarchy: any[];
  refetchData: any;
}

const AllocationsForm = ({
  poolAllocations,
  closeModal,
  unAllocatedBps,
  hierarchy,
  refetchData,
}: AllocationsFormProps) => {
  const { externalId } = useParams<{ externalId: string }>();
  const [allocations, setAllocations] = useState<any[]>([]);

  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  const generateInitAllocations = (_users: any[]) => {
    return _users.map((_user: any) => {
      const { display_name, email } = _user;
      return { name:display_name, email, bps: 0 };
    });
  };

  const reformatAllocations = (allocations:any[])=>{
    return allocations.map((allocation: any) => {
      const { display_name, email } = allocation.user;
      return { name:display_name, email, bps: allocation.bps };
    });
  }

  const handleFetchUsers = async () => {
    const res = await API.getAllUsers();
    setAllocations(generateInitAllocations(res));
  };

  useEffect(() => {
    if (poolAllocations && poolAllocations.length > 0) {
      setAllocations(reformatAllocations(poolAllocations));
    } else {
      handleFetchUsers();
    }
  }, [poolAllocations]);

  const initialValues = { allocations: allocations };
  const validationSchema = Yup.object().shape({
    allocations: Yup.array().of(
      Yup.object().shape({
        email: Yup.string().required("Required"),
        bps: Yup.number()
          .min(0, "Bps cannot be negative")
          .required("Required"),
      })
    ),
  });
  const handleSubmit = async (values: any) => {
    const { allocations } = values;
    const { base_pool_id, parent_pool_id } = getRefPoolId(hierarchy);
    const payload = {
      fund_external_id: externalId,
      base_pool_id,
      parent_pool_id,
      allocations,
    };
    const res = await API.createCarryAllocations(payload);
    if (res.success) {
      refetchData();
    }
    closeModal();
  };

  const calculateAllocationsBps = (values: any) => {
    const totalBps = values.reduce((accumulator: any, currentValue: any) => {
      return accumulator + Number(currentValue.bps);
    }, 0);

    return totalBps;
  };

  return (
    <Container fluid className={"pb-5"}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          errors,
        }) => {
          const MaxBps =
            unAllocatedBps + calculateAllocationsBps(allocations);
          const bpsUsed = calculateAllocationsBps(values.allocations);
          const limitExceeded = MaxBps - bpsUsed < 0;
          const warningMessage = `Warning ! You have allocated ${bpsUsed} bps !! Allocated bps should not exceed ${MaxBps} bps `;
          return (
            <StyledForm onSubmit={handleSubmit}>
              <div style={{ display: "grid" }}>
                <span>Max Bps : {MaxBps}</span>
                <span>Bps Used : {bpsUsed}</span>
                <span>Remaining Bps: {MaxBps - bpsUsed}</span>
              </div>
              {limitExceeded && <p className="text-danger">{warningMessage}</p>}
              <FieldArray name="allocations">
                {({ remove }) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    {values.allocations.map((allocation, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "20px 15px",
                          border: "1px dotted black",
                          display:'flex',
                          gap:'15px'
                        }}
                      >
                        {/* <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <DeleteIcon
                            onClick={() => remove(index)}
                            style={{ cursor: "pointer" }}
                          />
                        </div> */}

                        <FormTextFieldRow
                          label="Email"
                          name={`allocations.${index}.email`}
                          placeholder="Email"
                          onChange={() => {}}
                          onBlur={handleBlur}
                          value={allocation.email}
                          readOnly
                        />

                        <FormTextFieldRow
                          label="Basis Points"
                          name={`allocations.${index}.bps`}
                          placeholder="Basis Points"
                          onChange={() => {}}
                          onBlur={handleBlur}
                          value={allocation.bps}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </FieldArray>
              {limitExceeded && <p className="text-danger">{warningMessage}</p>}
              {Object.keys(errors).length > 0 && (
                <p className="text-danger">
                  Please check your entries for form errors
                </p>
              )}
              <ButtonsContainer className="text-right">
                <Button
                  variant="outline-primary"
                  type="submit"
                  className={"submit-button"}
                  disabled={isSubmitting || limitExceeded}
                >
                  Save
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

export default AllocationsForm;
