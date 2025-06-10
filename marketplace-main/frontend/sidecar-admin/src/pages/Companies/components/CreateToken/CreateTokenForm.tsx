import React, {FunctionComponent, useEffect} from 'react';

import "react-datepicker/dist/react-datepicker.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import {Formik} from "formik";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "./constants";
import API from "../../../../api";
import {StyledForm} from "../../../../presentational/forms";
import Button from "react-bootstrap/Button";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import FormTextField from "../../../../components/Form/TextField";
import FormSelectorField from "../../../../components/Form/SelectorField";
import {getCompanyTokenInitialValues} from "./getEditInitialValues";
import {ICompany, ICompanyToken} from "../../../../interfaces/company";
import {fetchCompanies} from "../../thunks";
import {selectCompanies} from "../../selectors";
import {addCompanyToken, editCompanyToken} from "../../companiesSlice";
import {v4 as uuidv4} from 'uuid';
import {Badge} from "react-bootstrap";
import styled from "styled-components";


const GeneratorDiv = styled.div`
  text-align: right;
`


interface CreateFundFormProps {
  closeModal: () => void;
  companyToken?: ICompanyToken;
}


const CreateCompanyTokenForm: FunctionComponent<CreateFundFormProps> = ({closeModal, companyToken}) => {

  const dispatch = useAppDispatch();
  const companies = useAppSelector(selectCompanies);

  const getCompaniesOptions = () => {
    return companies.map((company: ICompany) => ({
      value: company.id, label: company.name
    }))
  }

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [])

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    const payload = {
      company: values.company.value,
      token: values.token,
    }
    if (companyToken) {
      const data = await API.editToken(companyToken.id, payload)
      dispatch(editCompanyToken(data));
      setSubmitting(false);
    } else {
      const data = await API.createCompanyToken(payload)
      dispatch(addCompanyToken(data));
      setSubmitting(false);
    }
    closeModal();
  }

  const getNewToken = () => {
    return uuidv4().split('-').join('')
  }

  return <Container fluid className={'pb-5'}>
    <Col md={{span: 10}}>
      <Formik
        initialValues={companyToken ? getCompanyTokenInitialValues(companyToken) : INITIAL_VALUES}
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
            errors
          }) => {
          return <StyledForm onSubmit={handleSubmit}>
            <FormSelectorField
              label="Company:"
              name="company"
              placeholder="Company"
              onChange={(value: any) => setFieldValue('company', value)}
              onBlur={handleBlur}
              value={values.company}
              options={getCompaniesOptions()}
            />

            <FormTextField
              label="Token:"
              name="token"
              placeholder="Token"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.token}
              disabled={true}
            />
            <GeneratorDiv>
              <Badge
                bg="success"
                className='cursor-pointer'
                onClick={() => setFieldValue('token', getNewToken())}
              >
                Generate Token
              </Badge>
            </GeneratorDiv>

            <Button variant="outline-primary" type="submit" className={'submit-button'} disabled={isSubmitting}>
              {companyToken ? 'Save' : 'Create Token'}
            </Button>
          </StyledForm>
        }}
      </Formik>
    </Col>
  </Container>;
};

export default CreateCompanyTokenForm;
