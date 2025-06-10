import { FunctionComponent, useState, useEffect } from "react";
import get from "lodash/get";
import map from "lodash/map";
import filter from "lodash/filter";
import { useFormik, FormikHelpers } from "formik";
import Button from "react-bootstrap/Button";
import API from '../../../../../../../../api/backendApi'
import { useAppSelector, useAppDispatch } from "../../../../../../../../app/hooks";
import { selectSelectedCriteriaDetail } from "../../../../../../selectors";
import TextArea from "../../../../../../../../components/Form/TextArea";
import { FormTextFieldRow as TextField } from "../../../../../../../../components/Form/TextField";
import { fetchSmartBlockTemplates, getFundCriteriaDetail } from "../../../../../../thunks";
import { v4 as uuidv4 } from "uuid";
import { StyledSwitch } from "../../../../../../../../presentational/forms";
import { Field, VALIDATION_SCHEMA } from "../CustomSmartBlock/config";
import { CustomBlockWrapper } from "../CustomSmartBlock/styles";
import TemplateField from "./TemplateField";
import { INIT_FIELD } from "./constants";
import { FooterWrapper } from "./Styles";

interface ITemplateForm {
  template?: any;
  closeModal: () => void
}

const initBlockId = 0;

const TemplateForm: FunctionComponent<ITemplateForm> = (props) => {
  const [blockId, setBlockId] = useState(initBlockId);
  const [template, setTemplate] = useState(props.template);
  const [customFieldErrors, setCustomFieldErrors] = useState({});
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail);
  const dispatch = useAppDispatch();

  const refetchCriteria = () => {
    if(selectedCriteria?.id)
        dispatch(getFundCriteriaDetail(selectedCriteria?.id));
  }

  useEffect(() => {
    if(template?.id) setBlockId(template?.id);
  }, [template])

  const getFieldAttr = (fieldName: string) => {
    return {
      name: fieldName,
      onChange: (e: any) => setFieldValue(fieldName, e.target.value),
      onBlur: () => {
        formik.validateForm();
      },
      value: get(values, `${fieldName}`, ""),
      error: get(errors, `${fieldName}`, ""),
      disabled: false,
    }
  }

  const handleAddField = () => {
    const newField = {
        id: uuidv4().split("-").join(""),
        ...INIT_FIELD
    }
    setTemplate((previousTemplate: any) => ({
        ...previousTemplate,
        custom_fields: [
            ...previousTemplate.custom_fields,
            newField
        ]
    }))
  }

  const handleCustomFieldUpdate = (updatedField: any) => {
    const oldFields = get(template, 'custom_fields');
    const newFields  = oldFields.map((field: any) => field.id === updatedField.id ? updatedField : field)
    setTemplate({
        ...template,
        custom_fields: newFields
    })
  }

  const handleFieldDelete = (fieldId: any) => {
    const oldFields = get(template, 'custom_fields');
    const newFields = oldFields.filter((field: any) => field.id !== fieldId);
    setTemplate((previousTemplate: any) => ({
        ...previousTemplate,
        custom_fields: newFields
    }))
  }

  const { values, isSubmitting, setFieldValue, errors, ...formik } = useFormik({
    initialValues: template,
    validationSchema: VALIDATION_SCHEMA,
    enableReinitialize: true,
    onSubmit: async (values: any, { setSubmitting }: FormikHelpers<any>) => {
        await API.updateTemplate(template.id, values);
        dispatch(fetchSmartBlockTemplates());
        props.closeModal();
    },
  });

  return (
    <CustomBlockWrapper>
      <fieldset>
      <TextField
        label="Title"
        placeholder="Title"
        {...getFieldAttr(Field.TITLE)}
      />
      <TextArea
        label="Description"
        placeholder="Description"
        {...getFieldAttr(Field.DESCRIPTION)}
      />
      <StyledSwitch
              id="smart-flow-toggle"
              className="m-2"
              label="Enable multiple selection"
              variant="sm"
              type="switch"
              onChange={(e: any) => {
                setFieldValue(Field.IS_MULTIPLE_SELECTION_ENABLED, get(e, 'target.checked'));
              }}
              value={get(values, Field.IS_MULTIPLE_SELECTION_ENABLED, true)}
              checked={get(values, Field.IS_MULTIPLE_SELECTION_ENABLED, true)}
              />

      {template?.id && map(get(template, "custom_fields"), (field) => (
        <TemplateField 
        key={field.id || 0} 
        blockId={blockId} field={field}
        handleCustomFieldUpdate={handleCustomFieldUpdate}
        handleFieldDelete={handleFieldDelete}
        callbackDeleteDocument={refetchCriteria}
        callbackFormErrors={(isValid: boolean) => setCustomFieldErrors((previousErrors) =>({
            ...previousErrors,
            [field.id]: isValid
        }))}
        />
      ))}
      <div className="mt-4 mb-4 text-end">
        <Button
          variant="primary"
          onClick={handleAddField}
        >
          Add Field
        </Button>
      </div>
      </fieldset>
      <FooterWrapper>
        {/* @ts-ignore */}
        <Button variant="primary" disabled={Object.values(customFieldErrors).includes(false) || !formik.isValid} onClick={formik.handleSubmit}>Update</Button>
        <Button variant="outline-primary" onClick={props.closeModal}>Cancel</Button>
      </FooterWrapper>
    </CustomBlockWrapper>
  );
};

export default TemplateForm;
