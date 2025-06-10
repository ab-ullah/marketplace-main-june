import { FunctionComponent, useState, useMemo, useEffect } from "react";
import get from "lodash/get";
import filter from "lodash/filter";
import includes from "lodash/includes";
import map from "lodash/map";
import debounce from "lodash/debounce";
import { useFormik, FormikHelpers } from "formik";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import { Checkbox, DeleteIcon, NestedFieldsCardFooter } from "./styles";
import TextArea from "../../../../../../../../components/Form/TextArea";
import { FormTextFieldRow as TextField } from "../../../../../../../../components/Form/TextField";
import { FormSelectorFieldRow as SelectorField } from "../../../../../../../../components/Form/SelectorField";
import { CheckboxBlock as StyledCheckbox } from "../../../../../../../../components/Form/styles";
import { useCreateCustomSmartBlockFieldsMutation, useDeleteCustomSmartBlockFieldsMutation, useUpdateCustomSmartBlockFieldsMutation } from "../../../../../../../../api/rtkQuery/eligibilityApi";
import { Field, NESTED_FIELD_VALIDATION_SCHEMA, VALIDATION_SCHEMA_DOCUMENT, initNestedFieldState, initDocField as initStates, reviewTypeOptions } from "./config";
import { ICustomField } from "../../../../../../../../interfaces/EligibilityCriteria/blocks";
import { Button } from "react-bootstrap";
import { isEmpty } from "lodash";

const initDocumentId = 0;

interface IDocumentDetails {
  blockId: number; 
  field: ICustomField;
  parentFieldId?: number;
  isNestedField?: boolean;
  callbackDeleteDocument: () => void;
}

const DocumentDetails: FunctionComponent<IDocumentDetails> = ({ blockId, field, parentFieldId, isNestedField, callbackDeleteDocument }) => {
  const [documentId, setDocumentId] = useState(initDocumentId);
  const [createFields] = useCreateCustomSmartBlockFieldsMutation();
  const [updateFields] = useUpdateCustomSmartBlockFieldsMutation();
  const [deleteField] = useDeleteCustomSmartBlockFieldsMutation();

  const getRequestPayload = (values: any) => {
    return {
      block: blockId,
      title: values[Field.DOC_TITLE],
      marks_as_eligible: values[Field.IS_ELIGIBLE],
      [Field.REVIEW_TYPE]: map(values[Field.REVIEW_TYPE], 'value'),
      required_documents: {
        title: values[Field.SUPPORTING_DOC_NAME],
        description: values[Field.SUPPORTING_DOC_DESC],
      },
      [Field.IS_TEXT_EXPLANATION_ENABLED]: values[Field.IS_TEXT_EXPLANATION_ENABLED],
      [Field.TEXT_EXPLANATION]: values[Field.TEXT_EXPLANATION],
      [Field.IS_NESTED_FIELDS_ENABLED]: values[Field.IS_NESTED_FIELDS_ENABLED],
      [Field.NESTED_FIELDS]: values[Field.NESTED_FIELDS],
      ...(parentFieldId ? {parent_field: parentFieldId} : {})
    };
  }

  const createSmartBlockFields = async (values: any) => {
    if (!blockId) return;
    const resp = await createFields(getRequestPayload(values));
    get(resp, "data.id") && setDocumentId(get(resp, "data.id"));
  }

  useEffect(() => {
    if (field?.id) {
      setDocumentId(field?.id);
    }
  }, [field]);

  const handleDeleteField = () => {
    if(blockId && documentId) {
      deleteField({block: blockId, fieldId: documentId});
    }
    callbackDeleteDocument();
  }

  const handleDeleteNestedField = (index: number) => {
    debouncedOnChange();
    const updatedFields = values[Field.NESTED_FIELDS].filter((_: any, i: any) => i !== index)
    setFieldValue(Field.NESTED_FIELDS, updatedFields)
  }

  const initialValues = useMemo(() => {
    if (field?.id) {
      const docName = get(field, 'required_documents.title');
      const docDesc = get(field, 'required_documents.description');
      const isTextExplanationEnabled = get(field, `${Field.IS_TEXT_EXPLANATION_ENABLED}`)
      const textExplanation = get(field, `${Field.TEXT_EXPLANATION}`)
      const isNestedFieldsEnabled = get(field, `${Field.IS_NESTED_FIELDS_ENABLED}`)
      const nestedFields = get(field, `${Field.NESTED_FIELDS}`)
      return {
        [Field.DOC_TITLE]: field[Field.DOC_TITLE],
        [Field.SUPPORTING_DOC]: docName || docDesc,
        [Field.SUPPORTING_DOC_NAME]: docName,
        [Field.SUPPORTING_DOC_DESC]: docDesc,
        [Field.IS_ELIGIBLE]: field[Field.IS_ELIGIBLE],
        [Field.REVIEW_TYPE]: filter(reviewTypeOptions, ({ value }) => includes(field[Field.REVIEW_TYPE], value)),
        [Field.IS_TEXT_EXPLANATION_ENABLED]: isTextExplanationEnabled,
        [Field.TEXT_EXPLANATION]: textExplanation,
        [Field.IS_NESTED_FIELDS_ENABLED]: isNestedFieldsEnabled,
        [Field.NESTED_FIELDS]: nestedFields ?? []
      };
    }
    return initStates;
  }, [field])

  const formik = useFormik({
    initialValues,
    validationSchema: isNestedField ? NESTED_FIELD_VALIDATION_SCHEMA :  VALIDATION_SCHEMA_DOCUMENT,
    enableReinitialize: true,
    onSubmit: async (values: any, { setSubmitting }: FormikHelpers<any>) => {
      setSubmitting(true);
      if (documentId === initDocumentId) {
        createSmartBlockFields(values);
      } else {
        updateFields({ documentId, ...getRequestPayload(values) });
      }
      setSubmitting(false);
    },
  });

  const { values, setFieldValue, errors } = formik;

  const handleSubmitForm = () => {
    formik.validateForm();
    formik.handleSubmit();
  }

  const debouncedOnChange = useMemo(
    () => debounce(handleSubmitForm, 2000)
    , []);

  const handleChange = (fieldName: string, e: any) => {
    debouncedOnChange();
    switch (fieldName) {
      case Field.REVIEW_TYPE:
        setFieldValue(fieldName, e);
        break;
      case Field.IS_NESTED_FIELDS_ENABLED:
          setFieldValue(fieldName, e);
          break;
      case Field.IS_TEXT_EXPLANATION_ENABLED:
            setFieldValue(fieldName, e);
            break;
      case Field.IS_ELIGIBLE:
        const isEligible = !values[Field.IS_ELIGIBLE];
        if (isEligible)
          setFieldValue(fieldName, isEligible);
        else
          formik.setValues({
            ...values,
            [Field.IS_ELIGIBLE]: !values[Field.IS_ELIGIBLE],
            // [Field.REVIEW_TYPE]: []
          });
        break;
      default:
        setFieldValue(fieldName, e.target.value);
    }
  }

  const getFieldAttr = (fieldName: string) => {
    return {
      name: fieldName,
      onChange: (e: any) => handleChange(fieldName, e),
      onBlur: () => { },
      value: get(values, `${fieldName}`, ""),
      error: get(errors, `${fieldName}`, ""),
      disabled: false,
    }
  }

  return (
    <Card className="mt-2 mb-2">
      <Card.Body>
         <DeleteIcon onClick={handleDeleteField}><TrashIcon /></DeleteIcon>
        <TextField
          label="Title"
          placeholder="Title"
          {...getFieldAttr(Field.DOC_TITLE)}
        />
        {
          !isNestedField && <Row>
          <Col className="mt-3 ps-0">
            <StyledCheckbox
              type="checkbox"
              label="Require Supporting documentation"
              {...getFieldAttr(Field.SUPPORTING_DOC)}
              checked={values[Field.SUPPORTING_DOC]}
              onChange={(e: any) => setFieldValue(Field.SUPPORTING_DOC, !values[Field.SUPPORTING_DOC])}
            />
          </Col>
        </Row>
        }

        {values[Field.SUPPORTING_DOC] && (
          <Card>
            <Card.Body>
              <TextField
                label="Document Name"
                placeholder="Document Name"
                {...getFieldAttr(Field.SUPPORTING_DOC_NAME)}
              />
              <TextArea
                label="Document Description"
                placeholder="Document Description"
                {...getFieldAttr(Field.SUPPORTING_DOC_DESC)}
              />
            </Card.Body>
          </Card>
        )}
        {
          !isNestedField && <Row>
          <Col className="mt-3 ps-0">
            <StyledCheckbox
              type="checkbox"
              label="Enable Text Explanation"
              {...getFieldAttr(Field.IS_TEXT_EXPLANATION_ENABLED)}
              checked={values[Field.IS_TEXT_EXPLANATION_ENABLED]}
              onChange={(e: any) => handleChange(Field.IS_TEXT_EXPLANATION_ENABLED, !values[Field.IS_TEXT_EXPLANATION_ENABLED])}
            />
          </Col>
        </Row>
        }
        {values[Field.IS_TEXT_EXPLANATION_ENABLED] && (
          <Card>
            <Card.Body>
              <TextArea
                label="Text Explanation"
                placeholder="Text Explanation"
                {...getFieldAttr(Field.TEXT_EXPLANATION)}
              />
            </Card.Body>
          </Card>
        )}
        {
          !isNestedField && <Row>
          <Col className="mt-3 ps-0">
            <StyledCheckbox
              type="checkbox"
              label="Enable Nested Multipe Choices"
              {...getFieldAttr(Field.IS_NESTED_FIELDS_ENABLED)}
              checked={values[Field.IS_NESTED_FIELDS_ENABLED]}
              disabled={!isEmpty(errors)}
              onChange={(e: any) => handleChange(Field.IS_NESTED_FIELDS_ENABLED, !values[Field.IS_NESTED_FIELDS_ENABLED])}
            />
          </Col>
        </Row>
        }
        {
          values[Field.IS_NESTED_FIELDS_ENABLED] && values[Field.NESTED_FIELDS].map((nestedField: any, index: number) => (
            <DocumentDetails 
            blockId={blockId} 
            parentFieldId={field.id ?? documentId}
            isNestedField
            field={nestedField}
            callbackDeleteDocument={() => {handleDeleteNestedField(index)}}
             />
          ))
        }
        {
          values[Field.IS_NESTED_FIELDS_ENABLED] && !isNestedField && (
            <NestedFieldsCardFooter justifyEnd>
              <Button
                variant="primary"
                onClick={() => {
                  setFieldValue(Field.NESTED_FIELDS, [
                    ...values[Field.NESTED_FIELDS],
                    initNestedFieldState
                  ])
                }}
              >
                Add Nested Field
              </Button>
            </NestedFieldsCardFooter>
          )
        }
        {
          !isNestedField && <Row>
          <Col className="mt-3 ps-0">
            <Checkbox
              type="checkbox"
              label="Mark as ineligible"
              {...getFieldAttr(Field.IS_ELIGIBLE)}
              checked={!values[Field.IS_ELIGIBLE]}
            />
          </Col>
        </Row>
        }
        {values[Field.IS_ELIGIBLE] && !isNestedField && (
          <SelectorField
            label={'Type of review required'}
            placeholder={'Type of review required'}
            {...getFieldAttr(Field.REVIEW_TYPE)}
            error={get(errors, `${Field.REVIEW_TYPE}`, get(errors, `${Field.REVIEW_TYPE}.label`, ""))}
            options={reviewTypeOptions}
            isMulti={true}
          />
        )}
      </Card.Body>
    </Card>
  );
};

export default DocumentDetails;
