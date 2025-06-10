import { Comment, FieldDependency, FieldDependencyValueType, KYCRecordResponse, Schema } from '../../interfaces/workflows';
import { LOOKUP_TYPES } from './constants';
import {CommentsByRecord, ParsedQuestion} from './interfaces';
import merge from "lodash/merge";

export const parseCardSchema = (schema: Schema, answers: KYCRecordResponse) => {
  const groupedTypes = schema.reduce((acc, question) => {
    const { id, field_dependencies, label } = question;
    if (getIsFieldEnabled(answers, field_dependencies)) {
      acc[id] = {
        id,
        label: question.type === 'checkbox' ? 'Is there one director': label,
        required: !!question.required,
        description: question.description,
        type: LOOKUP_TYPES[question.type] ?? LOOKUP_TYPES.text,
        data: question.data,
        submitted_answer: question.submitted_answer
      }
    }
    return acc;
  }, {} as { [key: string]: ParsedQuestion });
  return Object.values(groupedTypes) as ParsedQuestion[];
};

export const mergeComments = (currentComments: CommentsByRecord, newComments: Comment[]) => {
  let mergedComments = {...currentComments}
  newComments.forEach(comment => {
      const documentKey = comment.document_identifier ? comment.document_identifier : ''
      const categorizedComment = {
        [comment.module]: {
          [comment.module_id]: {
            [comment.question_identifier]: {
              [documentKey]: comment
            }
          }
        }
      }
      mergedComments = merge(mergedComments, categorizedComment)
    }
  );
  return mergedComments;
}

export const getIsFieldEnabled = (formValues: KYCRecordResponse, field_dependencies?: FieldDependency<FieldDependencyValueType>[]) => {
  if (!field_dependencies) return true;
  return field_dependencies.some(({ field, relation, value }) => {
    const fieldValue = formValues[field];
    if (fieldValue === null) return false;
    switch (relation) {
      case 'equals':
        return fieldValue == value; // eslint-disable-line eqeqeq
      case 'not_equals':
        return fieldValue != value; // eslint-disable-line eqeqeq
      case 'less_than':
        return fieldValue < value;
      case 'greater_than':
        return fieldValue > value;
      case 'in':
        return Array.isArray(value) && value.some(v => v == fieldValue); // eslint-disable-line eqeqeq
      case 'not_in':
        return Array.isArray(value) && !value.some(v => v == fieldValue); // eslint-disable-line eqeqeq
      default:
        return false;
    }
  });
}

export const getCountries = (countries: any) => {
  const updatedCountiesOptions: { label: any; value: any; }[] = []
  countries.forEach((countryOption: { label: any; id: any; }) => {
    updatedCountiesOptions.push({
      label: countryOption.label,
      value: countryOption.id
    })
  });
  return updatedCountiesOptions
}