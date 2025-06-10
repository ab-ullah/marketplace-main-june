import Container from "react-bootstrap/Container";
import { StyledForm } from "../../../../../../../../presentational/forms";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import { Formik } from "formik";
import { INITIAL_VALUES, validationSchema } from "./constants";
import _ from "lodash";
import API from "../../../../../../../../api/backendApi";
import { useParams } from "react-router-dom";
import { calculateAllocatedBps, getRefPoolId } from "../../../../utils";

interface CarryPoolFormProps {
  closeModal: () => void;
  pool?: any;
  refetchData?: any;
  hierarchy: any[];
  unAllocatedBps: number
}

const ButtonsContainer = styled.div`
  text-align: right;
`;

const CarryPoolForm = ({
  pool,
  refetchData,
  closeModal,
  hierarchy,
  unAllocatedBps
}: CarryPoolFormProps) => {
  const { externalId } = useParams<{ externalId: string }>();
  const isRootLevel = hierarchy.length <=1
  const maxBps = isRootLevel ? undefined : ((pool?.bps ?? 0) + unAllocatedBps);
  const minBps = pool ? calculateAllocatedBps(pool) : 0
  
  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  const getPoolData = () => {
    return _.pick(pool,['name','bps'])
  };



  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const { name, bps } = values;
    const fund_external_id = externalId;
    const {base_pool_id,parent_pool_id} = getRefPoolId(hierarchy)
    const pool_id = pool?.external_id
    const payload ={ name, fund_external_id, bps ,base_pool_id,parent_pool_id, ...(pool ? {pool_id} : {})}

    const res = await API.createCarryPool(payload);
      if (res.success) {
        refetchData();
      }
  
    setSubmitting(false);
    closeModal();
  };

  return (
    <Container fluid className={"pb-5"}>
      <Formik
        initialValues={pool ? getPoolData() : INITIAL_VALUES}
        validationSchema={validationSchema(minBps,maxBps)}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
        }) => {
          return (
            <StyledForm onSubmit={handleSubmit}>
              <FormTextFieldRow
                label="Pool Name"
                name="name"
                placeholder="Pool Name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
              />
              <FormTextFieldRow
                label="Basis Points"
                name="bps"
                placeholder="Basis Points"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.bps}
                helperText={ maxBps
                  ? `Enter between ${minBps} & ${maxBps}`
                  : `Enter a value greater than or equal to ${minBps}`}
              />

              <ButtonsContainer className="text-right">
                <Button
                  variant="outline-primary"
                  type="submit"
                  className={"submit-button"}
                  disabled={isSubmitting}
                >
                  {pool ? "Save" : "Create"}
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

export default CarryPoolForm;
