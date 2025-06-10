import { FunctionComponent, useState, useEffect, useMemo } from "react";
import get from "lodash/get";
import map from "lodash/map";
import filter from "lodash/filter";
import { useFormik, FormikHelpers } from "formik";
import Button from "react-bootstrap/Button";
import { eligibilityConfig } from "../../../../utils/EligibilityContext";
import {ISmartBlock} from "../../../../../../../../interfaces/EligibilityCriteria/blocks";
import { useAppSelector, useAppDispatch } from "../../../../../../../../app/hooks";
import { selectSelectedCriteriaDetail } from "../../../../../../selectors";
import TextArea from "../../../../../../../../components/Form/TextArea";
import { FormTextFieldRow as TextField } from "../../../../../../../../components/Form/TextField";
import { useAddCustomSmartBlockMutation, useUpdateCustomSmartBlockMutation } from "../../../../../../../../api/rtkQuery/eligibilityApi";
import DocumentDetails from "./DocumentDetails";
import { Field, VALIDATION_SCHEMA, initStates, initDocField, ERRORS } from "./config";
import { CustomBlockWrapper, ErrorMessage, SmartBlockModalFooter } from "./styles";
import { getFundCriteriaDetail } from "../../../../../../../EligibilityCriteria/thunks";
import { uuid4 } from "@sentry/utils";
import { each } from "lodash";
import { StyledSwitch } from "../../../../../../../../presentational/forms";

interface ICustomSmartBlock {
  criteriaBlock?: ISmartBlock;
  allowEdit?: boolean;
  refetchOnUnmount?: boolean;
}

const initBlockId = 0;

const CustomSmartBlock: FunctionComponent<ICustomSmartBlock> = ({ criteriaBlock, allowEdit, refetchOnUnmount }) => {
  const [blockId, setBlockId] = useState(initBlockId);
  const [isShowSaveTemplate, setIsShowSaveTemplate] = useState(!criteriaBlock?.is_template)
  const [createBlockError, setCreateBlockError] = useState('');
  const [draftDocument, setDraftDocument] = useState<any>([]);
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail);
  const [addCustomSmartBlock] = useAddCustomSmartBlockMutation();
  const [updateCustomSmartBlock] = useUpdateCustomSmartBlockMutation();
  const dispatch = useAppDispatch();

  const refetchCriteria = () => {
    if(selectedCriteria?.id)
        dispatch(getFundCriteriaDetail(selectedCriteria?.id));
  }

  const handleDeleteDraft = (uuid: string) => {
    const drafts = filter(draftDocument, (draft) => {
      return draft.uuid !== uuid;
    })
    setDraftDocument(drafts);
  }

  useEffect(() => {
    if(criteriaBlock?.id) setBlockId(criteriaBlock?.id);
    if(criteriaBlock?.is_template) setIsShowSaveTemplate(false);
  }, [criteriaBlock])

  useEffect(() => {
    return () => {
      if(refetchOnUnmount){
        refetchCriteria();
      }
    }
  }, [refetchOnUnmount])

  const createSmartBlock = async (values: any) => {
    if (!selectedCriteria) return;
    setCreateBlockError('');
    const createdBlock = await addCustomSmartBlock({
      fundId: selectedCriteria.fund,
      eligibilityId: selectedCriteria.id,
      title: values.title
    });
    const errorCode = get(createdBlock, 'error.status', undefined);
    errorCode && setCreateBlockError(getError(get(createdBlock, 'error.data', {})))
    get(createdBlock, "data.id") && setBlockId(get(createdBlock, "data.id"));
    refetchCriteria();
  }

  const getFieldAttr = (fieldName: string) => {
    return {
      name: fieldName,
      onChange: (e: any) => setFieldValue(fieldName, e.target.value),
      onBlur: () => {
        formik.validateForm();
        formik.handleSubmit();
      },
      value: get(values, `${fieldName}`, ""),
      error: get(errors, `${fieldName}`, ""),
      disabled: false,
    }
  }

  const handleAddBlock = () => {
    setDraftDocument([...draftDocument, {...initDocField, uuid: uuid4()}]);
  }

  const getError = (errorResponse: any) => {
    const error: string | null = get(errorResponse, 'non_field_errors[0]', null)
    if(error) return ERRORS[error];
    return ERRORS.default
  }

  const initialValues = useMemo(() => {
    if (criteriaBlock?.id) {
      return criteriaBlock;
    }
    return initStates;
  }, [criteriaBlock])

  const { values, isSubmitting, setFieldValue, errors, ...formik } = useFormik({
    initialValues,
    validationSchema: VALIDATION_SCHEMA,
    enableReinitialize: true,
    onSubmit: async (values: any, { setSubmitting }: FormikHelpers<any>) => {
      if (!selectedCriteria) return;
      setSubmitting(true);
      if (blockId === initBlockId) {
        createSmartBlock(values);
      } else {
        updateCustomSmartBlock({ blockId, ...values }).then(() => refetchCriteria());
      }
      
    },
  });

  const saveAsTemplate = () => {
    updateCustomSmartBlock({ blockId, is_template: true }).then(() => {
      setIsShowSaveTemplate(false);
      refetchCriteria();
    });
  }

  return (
    <CustomBlockWrapper>
      <fieldset disabled={!allowEdit}>
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
                formik.handleSubmit();
              }}
              value={get(values, Field.IS_MULTIPLE_SELECTION_ENABLED, true)}
              checked={get(values, Field.IS_MULTIPLE_SELECTION_ENABLED, true)}
              />
      <ErrorMessage>{createBlockError}</ErrorMessage>
      {criteriaBlock?.id && map(get(criteriaBlock, "custom_fields"), (field) => (
        <DocumentDetails key={field.id || 0} blockId={blockId} field={field} callbackDeleteDocument={refetchCriteria}/>
      ))}
      {map(draftDocument, (document) => (
        <DocumentDetails key={document.uuid} blockId={blockId} field={document} callbackDeleteDocument={() => handleDeleteDraft(document.uuid)}/>
      ))}
      <SmartBlockModalFooter justifyEnd={!isShowSaveTemplate}>
        {
          isShowSaveTemplate && <Button
          variant="outline-primary"
          onClick={saveAsTemplate}
        >
          Save As Template
        </Button>
        }
        <Button
          variant="primary"
          disabled={!formik.isValid || blockId === initBlockId}
          onClick={handleAddBlock}
        >
          Add Field
        </Button>
      </SmartBlockModalFooter>
      </fieldset>
    </CustomBlockWrapper>
  );
};

export default eligibilityConfig(CustomSmartBlock);
