import React, {FunctionComponent, useEffect, useState} from 'react';
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import AutoSave from '../AutoSave';
import { FormValues, DispatchStatus } from '../../interfaces';
import { Field, FieldProps, Formik, FormikHelpers, FormikValues, FormikProps, useFormikContext } from 'formik';
import { Comment, Schema } from '../../../../interfaces/workflows';
import { getAnswerInputComponent, getIsFieldEnabled, getIsShowProofOfAddressField, handleValidation } from '../../utils';
import CommentWrapper from "../../../../components/CommentWrapper";
import { useAppSelector } from '../../../../app/hooks';
import { selectKYCRecord } from '../../selectors';
import { NON_SENSITIVE_FIELD_IDS, VALIDATE_ON_MOUNT_FIELDS } from '../../constants';

interface CardProps {
  schema: Schema;
  onSubmit?: (values: FormikValues, helpers: FormikHelpers<FormValues>) => Promise<void>;
  initialValues: FormikValues;
  ignoreRequired?: boolean;
  isParticipant?: boolean;
  recordId: number;
  onStatusChange?: DispatchStatus;
  innerRef?: React.MutableRefObject<{ [key: string]: FormikProps<FormikValues> }>;
  recordComments?: {
    [key: string]: Comment[];
  };
}

const CardContainer: FunctionComponent<CardProps> = ({ schema, onSubmit, initialValues, recordId, isParticipant, onStatusChange, innerRef, recordComments }) => {
  const { answers } = useAppSelector(selectKYCRecord)
  //@ts-ignore
  const onValidate = (values: FormikValues) => handleValidation(values, schema, answers);
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(false);

  const atSubmit = async (values: FormikValues, helpers: FormikHelpers<FormValues>) => {
    onSubmit && await onSubmit(values, helpers);
  };

  const getComments = (question: any) => {
    const questionId = `participant_${recordId || ""}_${question.id}.`;
    const comments = uniqBy(get(recordComments, questionId), 'id');
    return comments;
  }

  return <Formik
    initialValues={initialValues}
    validate={onValidate}
    onSubmit={atSubmit}
    enableReinitialize={true}
    validateOnMount={true}
    initialTouched={{...VALIDATE_ON_MOUNT_FIELDS}}
    innerRef={ref => (innerRef !== undefined && ref !== null) ? innerRef.current[recordId] = ref : undefined}
  >
    {(formikProps: FormikValues) => {
      return <div >
        {autosaveEnabled && <AutoSave />}
        {(isParticipant && onStatusChange) && <CardStatus onStatusChange={onStatusChange} participantId={recordId} />}
        {schema.map(question => {
          const isFieldEnabled = getIsFieldEnabled(formikProps.values, question.field_dependencies);
          if(question.id === 'proof_of_address' && !getIsShowProofOfAddressField(formikProps.values, answers)){
            return null;
          }
          if (!isFieldEnabled) return null;
          const AnswerInput = getAnswerInputComponent(question);
          const comments = getComments(question);
          
          return <Field key={question.id}>
            {(_: FieldProps) => (
              <>
                <AnswerInput key={question.id} question={question} customOnBlur={() => {
                  setAutosaveEnabled(true)
                }} 
                isInspectletSensitive={!NON_SENSITIVE_FIELD_IDS.includes(question.id)}
                />
                {comments?.map((comment) => <CommentWrapper key={comment.id} comment={comment} />)}
              </>
            )}
          </Field>
        })}
      </div>
    }}
  </Formik>
}

const CardStatus = ({ onStatusChange, participantId }: { onStatusChange: DispatchStatus, participantId: number }) => {
  const { errors, dirty, isValidating, isSubmitting } = useFormikContext();

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const newStatus = { dirty, hasErrors, isValidating, isSubmitting }
    onStatusChange({ newStatus, participantId });
  }, [onStatusChange, participantId, errors, dirty, isValidating, isSubmitting]);

  return null;
}

export default CardContainer;