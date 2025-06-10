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
import TextArea from "../../../../../../../../components/Form/TextArea";
import { FormTextFieldRow as TextField } from "../../../../../../../../components/Form/TextField";
import { FormSelectorFieldRow as SelectorField } from "../../../../../../../../components/Form/SelectorField";
import { CheckboxBlock as StyledCheckbox } from "../../../../../../../../components/Form/styles";
import { Field, VALIDATION_SCHEMA_DOCUMENT, initDocField as initStates, reviewTypeOptions } from "../CustomSmartBlock/config";
import { ICustomField } from "../../../../../../../../interfaces/EligibilityCriteria/blocks";
import { Checkbox, DeleteIcon } from "../CustomSmartBlock/styles";
import { isEmpty } from "lodash";

interface ITemplateField {
  blockId: number; 
  field: ICustomField;
  callbackDeleteDocument: () => void;
  callbackFormErrors: (isError: boolean) => void;
  handleCustomFieldUpdate: (field: any) => void;
  handleFieldDelete: (fieldId: any) => void;
}

const TemplateField: FunctionComponent<ITemplateField> = ({ blockId, field, handleFieldDelete, handleCustomFieldUpdate, callbackFormErrors }) => {

  const getUpdatedFieldData = (values: any) => {
    return {
      id: field.id,
      title: values[Field.DOC_TITLE],
      marks_as_eligible: values[Field.IS_ELIGIBLE],
      [Field.REVIEW_TYPE]: map(values[Field.REVIEW_TYPE], 'value'),
      required_documents: {
        title: values[Field.SUPPORTING_DOC_NAME],
        description: values[Field.SUPPORTING_DOC_DESC],
      },
    };
  }


  const initialValues = useMemo(() => {
    if (field?.id) {
      const docName = get(field, 'required_documents.title');
      const docDesc = get(field, 'required_documents.description');
      return {
        [Field.DOC_TITLE]: field[Field.DOC_TITLE],
        [Field.SUPPORTING_DOC]: docName || docDesc,
        [Field.SUPPORTING_DOC_NAME]: docName,
        [Field.SUPPORTING_DOC_DESC]: docDesc,
        [Field.IS_ELIGIBLE]: field[Field.IS_ELIGIBLE],
        [Field.REVIEW_TYPE]: filter(reviewTypeOptions, ({ value }) => includes(field[Field.REVIEW_TYPE], value))
      };
    }
    return initStates;
  }, [field])

  const formik = useFormik({
    initialValues,
    validationSchema: VALIDATION_SCHEMA_DOCUMENT,
    enableReinitialize: true,
    onSubmit: async (values: any, { setSubmitting }: FormikHelpers<any>) => {
        handleCustomFieldUpdate(getUpdatedFieldData(values));
    },
  });

  const { values, setFieldValue, errors } = formik;

  const handleSubmitForm = () => {
    formik.validateForm().then((errors) => {
        callbackFormErrors(isEmpty(errors));
    })
    formik.handleSubmit();
  }

  const debouncedOnChange = useMemo(
    () => debounce(handleSubmitForm, 500)
    , []);

  const handleChange = (fieldName: string, e: any) => {
    debouncedOnChange();
    switch (fieldName) {
      case Field.REVIEW_TYPE:
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
         <DeleteIcon onClick={() => handleFieldDelete(field.id)}><TrashIcon /></DeleteIcon>
        <TextField
          label="Title"
          placeholder="Title"
          {...getFieldAttr(Field.DOC_TITLE)}
        />
        <Row>
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
        <Row>
          <Col className="mt-3 ps-0">
            <Checkbox
              type="checkbox"
              label="Mark as ineligible"
              {...getFieldAttr(Field.IS_ELIGIBLE)}
              checked={!values[Field.IS_ELIGIBLE]}
            />
          </Col>
        </Row>
        {values[Field.IS_ELIGIBLE] && (
          <SelectorField
            label={'Type of review required'}
            placeholder={'Type of review required'}
            {...getFieldAttr(Field.REVIEW_TYPE)}
            error={get(errors, `${Field.REVIEW_TYPE}`, get(errors, `${Field.REVIEW_TYPE}.label`, ""))}
            options={reviewTypeOptions}
            isMulti={true}
            allowCustom={true}
          />
        )}
  
      </Card.Body>
    </Card>
  );
};

export default TemplateField;
