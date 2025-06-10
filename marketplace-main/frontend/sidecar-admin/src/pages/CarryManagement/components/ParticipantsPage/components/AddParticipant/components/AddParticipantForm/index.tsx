import { Formik } from "formik";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import {
  INITIAL_VALUES,
  VALIDATION_SCHEMA,
} from "./constants";
import styled from "styled-components";
import API from "../../../../../../../../api/backendApi";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import { StyledForm } from "../../../../../../../../presentational/forms";
import { toast } from "react-toastify";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import ToggleSwitch from "../../../../../../../../components/ToggleSwitch";
import { useEffect, useState } from "react";
import { get, map } from "lodash";
import filter from "lodash/filter";

const INDIVIDUAL_TYPE = 1;

const ButtonsContainer = styled.div`
  text-align: right;
`;

const FieldsRow = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 24px;
`;

interface IAddParticipantFormProps {
  closeModal : ()=>void;
  handleRefetchParticipants: ()=>void;
}

interface EntityType{
  id: number
  name: string
}

const AddParticipantForm = ({ closeModal, handleRefetchParticipants }: IAddParticipantFormProps) => {

  const [allUsers,setAllUsers] = useState<any[]>([])
  const [allEntityTypes, setAllEntityTypes] = useState<{label: string, value: number}[]>([])

  const handleSubmit = async (
    values: any,
    { setSubmitting, setFieldError, setFieldValue, setValues }: any
  ) => {
    const {first_name, last_name, email, add_as_entity, entity_name, entity_type} = values
    let entity_type_value = INDIVIDUAL_TYPE
    if(entity_type){
      entity_type_value = entity_type.value
    }

    const payload={
      first_name,
      last_name,
      email:email.label,
      entity: entity_type_value,
      ...(add_as_entity && { entity_name }),
    }
    const res = await API.CreateCarryParticipant(payload);
    if (res.success) {
      toast.success("Created Succesfully !!")
      handleRefetchParticipants()
      closeModal()
    } 
    else {
      const firstError = res?.data?.[Object.keys(res.data)?.[0]]?.[0]
      toast.error(firstError)
    }
  };

  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  const handleFetchAllUsers = async()=>{
    const res = await API.fetchAllCarryUsers()
    if(res.success){
      setAllUsers(map(get(res,'data',[]),(dat:any)=>{
        return {...dat, label:dat.email, value: dat.email}
      }))
    }
  }

  const handleFetchEntityTypes = async() => {
    const res = await API.fetchCarryParticipantsEntityTypes()
    if(res){
      setAllEntityTypes(
          map(res,(dat: EntityType)=>{
            return {label: dat.name, value: dat.id}
          })
      )
    }
  }

  useEffect(()=>{
    handleFetchAllUsers()
    handleFetchEntityTypes()
  },[])

  return (
    <Container fluid>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          errors,
        }) => {
          return (
            <StyledForm onSubmit={handleSubmit}>
              <div className="mb-2">
                <FormSelectorFieldRow
                  label="Email"
                  name="email"
                  placeholder="Select"
                  onChange={(value: any) => {
                    setFieldValue("email", value);
                    if(value?.is_individual_participant) setFieldValue("add_as_entity",true);
                    if(value?.first_name) setFieldValue("first_name",value.first_name);
                    if(value?.last_name) setFieldValue("last_name",value.last_name);
                  }}
                  onBlur={handleBlur}
                  allowCustom={true}
                  value={values.email}
                  options={allUsers}
                />
              </div>
              <div className="my-3">
              <ToggleSwitch 
                checked={values.add_as_entity} 
                onChange={()=>setFieldValue("add_as_entity", !values.add_as_entity)} 
                title="Add Participant as Entity"
                disabled={Boolean(values.email?.is_individual_participant)}
                />
              </div>
              <FieldsRow>
                <div className="w-50">
                  <FormTextFieldRow
                    label="First Name"
                    name="first_name"
                    placeholder="John"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.first_name}
                    disabled={isSubmitting || values.email?.first_name}
                  />
                </div>
                <div className="w-50">
                  <FormTextFieldRow
                    label="Last Name"
                    name="last_name"
                    placeholder="Doe"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.last_name}
                    disabled={isSubmitting || values.email?.last_name}
                  />
                </div>
              </FieldsRow>

            {values.add_as_entity &&
                <>
                  <FieldsRow>
                    <div className="w-100">
                      <FormTextFieldRow
                          label="Entity Name"
                          name="entity_name"
                          placeholder=""
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.entity_name}
                          disabled={isSubmitting}
                      />
                    </div>
                  </FieldsRow>
                  <FieldsRow>
                    <div className="w-100">
                      <FormSelectorFieldRow
                          label="Entity Type"
                          name="entity_type"
                          placeholder=""
                          onChange={(value: any) => setFieldValue('entity_type', value)}
                          onBlur={handleBlur}
                          value={values.entity_type}
                          options={filter(allEntityTypes, (e: {value: number, label: string}) => {
                            return e.value != INDIVIDUAL_TYPE;
                          })}
                          isDisabled={isSubmitting}
                      />
                    </div>
                  </FieldsRow>
                </>
            }

              <ButtonsContainer className="text-right">
                <Button
                  variant="outline-primary"
                  type="cancel"
                  className={"cancel-button"}
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline-primary"
                  type="submit"
                  className={"submit-button"}
                  disabled={isSubmitting}
                >
                  Add
                </Button>
              </ButtonsContainer>
            </StyledForm>
          );
        }}
      </Formik>
    </Container>
  );
};

export default AddParticipantForm;
