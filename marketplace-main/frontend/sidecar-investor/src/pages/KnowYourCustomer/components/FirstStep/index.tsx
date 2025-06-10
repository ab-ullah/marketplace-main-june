import React, { FunctionComponent, useMemo, useState } from 'react';
import API from '../../../../api';
import { AML_FLOW_SLUGS, AML_KYC_ENTITIES_WORKFLOW, AML_SLUG_SELECTION_ID, STATUS_CODES } from '../../constants';
import { FormValues } from '../../interfaces';
import { fetchKYCRecord } from '../../thunks';
import { selectKYCRecord } from '../../selectors';
import { WorkFlow } from '../../../../interfaces/workflows';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { setSelectedWorkflowSlug, setWorkflow, setRecordUUID } from '../../kycSlice';
import { getAMLInitialWorkflow, getAnswerInputComponent, getIndividualFormInitialValues, getIsFieldEnabled, handleValidation, parseCard } from '../../utils';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { BigTitle, ButtonRow, Container, FieldContainer, FieldInner, FormContainer, NextButton, Title } from '../../styles';
interface FirstStepProps {externalId: string }

const FirstStep: FunctionComponent<FirstStepProps> = ({externalId}) => {
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const { fundWorkflows, applicationRecord } = useAppSelector(selectKYCRecord);
  const workflow = useMemo(getAMLInitialWorkflow(), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkFlow>(workflow);

  const onValidate = (values: FormValues) => handleValidation(values, schema);

  const card = useMemo(() => currentWorkflow.cards[activeStep], [activeStep, currentWorkflow.cards]);

  const initialValues = useMemo(() => getIndividualFormInitialValues(card?.schema ?? []), [card?.schema]);

  const onSubmit = async (values: any, _: FormikHelpers<FormValues>) => {
    const selectedWfSlug = values[AML_SLUG_SELECTION_ID];
    const wf = fundWorkflows.find(wf => wf.slug === selectedWfSlug) || fundWorkflows.find(wf => wf.slug.startsWith(selectedWfSlug));
    let kycRecord;
    switch (selectedWfSlug) {
      case AML_FLOW_SLUGS.INDIVIDUAL:
        kycRecord = await API.createKYCRecord(wf!.slug, STATUS_CODES.CREATED, {});
        API.updateAppRecord(applicationRecord!.uuid, { kyc_record: { uuid: kycRecord.uuid } });
        dispatch(setRecordUUID(kycRecord.uuid));
        dispatch(fetchKYCRecord(kycRecord.uuid))
        dispatch(setSelectedWorkflowSlug(selectedWfSlug));
        dispatch(setWorkflow(wf));
        break;
      case AML_FLOW_SLUGS.ENTITY_SELECTION:
        const entitiesWf = AML_KYC_ENTITIES_WORKFLOW();
        setCurrentWorkflow(entitiesWf);
        setActiveStep(0);
        break;
      case AML_FLOW_SLUGS.PRIVATE_COMPANY:
        if(wf){
          kycRecord = await API.createKYCEntityRecord(wf!.slug, { entity_name:values.entity_name })
          API.updateAppRecord(applicationRecord!.uuid, { kyc_record: { uuid: kycRecord.uuid } });
          dispatch(setRecordUUID(kycRecord.uuid));
          dispatch(fetchKYCRecord(kycRecord.uuid))
          dispatch(setWorkflow(wf));
        }
        break;
      case AML_FLOW_SLUGS.LIMITED_PARTNERSHIP:
        const { entity_name } = values;
        kycRecord = await API.createKYCEntityRecord(wf!.slug, { entity_name })
        API.updateAppRecord(applicationRecord!.uuid, { kyc_record: { uuid: kycRecord.uuid } });
        dispatch(setRecordUUID(kycRecord.uuid));
        dispatch(fetchKYCRecord(kycRecord.uuid))
        dispatch(setWorkflow(wf));
        break;
      case AML_FLOW_SLUGS.TRUST:
        kycRecord = await API.createKYCEntityRecord(wf!.slug, { entity_name: values.entity_name })
        API.updateAppRecord(applicationRecord!.uuid, { kyc_record: { uuid: kycRecord.uuid } });
        dispatch(setRecordUUID(kycRecord.uuid));
        dispatch(fetchKYCRecord(kycRecord.uuid))
        dispatch(setWorkflow(wf));
        break;
      default:
        dispatch(setSelectedWorkflowSlug(selectedWfSlug));
        break;
    }
  };

  if (!card) return <Container>No card found.</Container>

  const { schema, title } = parseCard(card);

  return <Container>
    <BigTitle>{workflow.name}</BigTitle>
    <Formik
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={onValidate}
      validateOnMount={true}
      enableReinitialize={true}
    >
      {(formikProps: FormikProps<any>) => {
        return <FormContainer>
          <Form>
            <Title>{title}</Title>
            {schema.map(question => {
              const isFieldEnabled = getIsFieldEnabled(formikProps.values, question.field_dependencies);
              if (!isFieldEnabled) return null;
              const AnswerInput = getAnswerInputComponent(question);

              return <Field key={question.id}>
                {(_: FieldProps) => (
                  <FieldContainer>
                    <FieldInner>
                      <AnswerInput question={question} />
                    </FieldInner>
                  </FieldContainer>
                )}
              </Field>
            })}
          </Form>
          <br />
          <ButtonRow>
            <NextButton
              onClick={formikProps.submitForm}
              disabled={Object.values(formikProps.errors).filter(p => p).length > 0 || formikProps.isSubmitting}>
              Next
            </NextButton>
          </ButtonRow>
        </FormContainer>
      }}
    </Formik>
  </Container>;
}

export default FirstStep;