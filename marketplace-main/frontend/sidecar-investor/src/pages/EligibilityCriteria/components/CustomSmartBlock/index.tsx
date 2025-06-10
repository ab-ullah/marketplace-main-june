import {FunctionComponent, useMemo} from 'react';
import find from "lodash/find";
import map from "lodash/map";
import get from "lodash/get";
import size from "lodash/size";
import omit from "lodash/omit";
import isUndefined from 'lodash/isUndefined';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {IEligibilityCriteriaResponse} from "../../../../interfaces/EligibilityCriteria/criteriaResponse";
import eligibilityCriteriaAPI from "../../../../api/eligibilityCriteria";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectFundCriteriaPreview, selectIsLoading} from "../../selectors";
import {setIsLoading, updateResponseBlock} from "../../eligibilityCriteriaSlice";
import {getCriteriaBlockAnswer} from "../../utils/getCriteriaBlockAnswer";
import { ButtonWrapper } from '../styles';
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import DOMPurify from 'dompurify';
import { filter, isEmpty } from 'lodash';
import TextExplanation from './TextExplanation';

interface ICustomSmartBlockProps {
  criteriaBlock: ICriteriaBlock,
  fundCriteriaResponse: null | IEligibilityCriteriaResponse, 
  nextFunction: () => void;
  backFunction: () => void;
}

const CustomSmartBlock: FunctionComponent<ICustomSmartBlockProps> = ({criteriaBlock, fundCriteriaResponse, nextFunction, backFunction}) => {
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  const selectedAnswer = getCriteriaBlockAnswer(criteriaBlock, fundCriteriaResponse)
  const answerPayload = selectedAnswer ? selectedAnswer.response_json : {};
  const isMultipleSelectionEnabled = get(criteriaBlock, 'custom_block.is_multiple_selection_enabled', false);
  const answerValue = selectedAnswer?.response_json.value;
  
  const getDetails = (key: string) => {
    return get(criteriaBlock, `custom_block.${key}`);
  }

  const blockKey = getDetails("id");

  const isChecked = (fieldId: number) => {
    return get(answerPayload, `${fieldId}`, false);
  }

  const getTextExplanationValue = (fieldId: number) => {
    return get(answerPayload, `${fieldId}_option.text_explanation_answer`, "");
  }

  const getSelectedNestedOption = (fieldId: number, nestedFieldId: number) => {
    return selectedAnswer?.response_json[`sub_option_${fieldId}`]?.value === nestedFieldId
  }

  const updateAnswer = async (value: boolean, optionIdx: number, optionId: number, textExplanation?: string) => {
    if(!fundCriteriaPreview) return;
    const selectedOption = get(getDetails('custom_fields'), `${optionIdx}`);
    const isTextExplanationEnabled = selectedOption.is_text_explanation_enabled
    let responseJson = {};
    if(isMultipleSelectionEnabled){
      const jsonPayload = omit(answerPayload, 'value');
      responseJson = {
        ...jsonPayload,
        [selectedOption.id]: value,
        [`${selectedOption.id}_option`]: {
          ...selectedOption,
          ...(isTextExplanationEnabled ? {text_explanation_answer: textExplanation} : {})
        }
      }
    }
    else {
      responseJson = {
        value: optionId,
        [`${selectedOption.id}_option`]: {
          ...selectedOption,
          ...(isTextExplanationEnabled ? {text_explanation_answer: textExplanation} : {})
        },
      }
    }
    const payload = {
      block_id: criteriaBlock.id,
      response_json: responseJson,
      eligibility_criteria_id: fundCriteriaPreview.id
    }
    dispatch(setIsLoading(true));
    const responseData = await eligibilityCriteriaAPI.createUpdateResponseBlock(payload)
    dispatch(updateResponseBlock(responseData))
    dispatch(setIsLoading(false));
  }

  const getParentRessponseJson = (value: boolean, optionIdx: number, optionId: number) => {
    if(!fundCriteriaPreview) return;
    const selectedOption = get(getDetails('custom_fields'), `${optionIdx}`);
    const isTextExplanationEnabled = selectedOption.is_text_explanation_enabled
    const textExplanation = getTextExplanationValue(selectedOption.id)
    let responseJson = {};
    if(isMultipleSelectionEnabled){
      const jsonPayload = omit(answerPayload, 'value');
      responseJson = {
        ...jsonPayload,
        [selectedOption.id]: value,
        [`${selectedOption.id}_option`]: {
          ...selectedOption,
          ...(isTextExplanationEnabled ? {text_explanation_answer: textExplanation} : {})
        }
      }
    }
    else {
      responseJson = {
        value: optionId,
        [`${selectedOption.id}_option`]: {
          ...selectedOption,
          ...(isTextExplanationEnabled ? {text_explanation_answer: textExplanation} : {})
        }
      }
    }
    return responseJson
  }

  const updatedNestedFieldAnswer = async (selectedOption: any, selectedParentOptionId: number, parentResponseJson: any) => {
    if(!fundCriteriaPreview) return;
    let responseJson = {
      ...parentResponseJson,
      [`sub_option_${selectedParentOptionId}`]: {
        value: selectedOption.id,
        [`${selectedOption.id}_option`]: selectedOption
      }
    }
    const payload = {
      block_id: criteriaBlock.id,
      response_json: responseJson,
      eligibility_criteria_id: fundCriteriaPreview.id
    }
    dispatch(setIsLoading(true));
    const responseData = await eligibilityCriteriaAPI.createUpdateResponseBlock(payload)
    dispatch(updateResponseBlock(responseData))
    dispatch(setIsLoading(false));
  }

  const handleTextExplanationChange = async (value: boolean, optionIdx: number, optionId: number, textExplanation: string) => {
    if(!fundCriteriaPreview) return;
    const selectedOption = get(getDetails('custom_fields'), `${optionIdx}`);
    const isTextExplanationEnabled = selectedOption.is_text_explanation_enabled
    const selectedSubOption = selectedAnswer?.response_json[`sub_option_${optionId}`]
    const subOptionPayload = { [`sub_option_${optionId}`]: selectedSubOption}
    let responseJson = {};
    if(isMultipleSelectionEnabled){
      const jsonPayload = omit(answerPayload, 'value');
      responseJson = {
        ...jsonPayload,
        [selectedOption.id]: value,
        [`${selectedOption.id}_option`]: {
          ...selectedOption,
          ...(isTextExplanationEnabled ? {text_explanation_answer: textExplanation} : {})
        },
        ...(selectedSubOption ? subOptionPayload : {})
      }
    }
    else {
      responseJson = {
        value: optionId,
        [`${selectedOption.id}_option`]: {
          ...selectedOption,
          ...(isTextExplanationEnabled ? {text_explanation_answer: textExplanation} : {})
        },
        ...(selectedSubOption ? subOptionPayload : {})
      }
    }
    const payload = {
      block_id: criteriaBlock.id,
      response_json: responseJson,
      eligibility_criteria_id: fundCriteriaPreview.id
    }
    dispatch(setIsLoading(true));
    const responseData = await eligibilityCriteriaAPI.createUpdateResponseBlock(payload)
    dispatch(updateResponseBlock(responseData))
    dispatch(setIsLoading(false));
  }

  const isNestedFieldAnswered = useMemo(() => {
    if(isMultipleSelectionEnabled) {
      const selectedFields = filter(getDetails('custom_fields'), (option: any) => {
        return answerPayload[option.id] && option.is_nested_fields_enabled
      });
      const keys = selectedFields.map((field) => `sub_option_${field.id}`)
      return keys.every((key) => !isUndefined(answerPayload[key])) && !isLoading
    }
    else {
      const selectedField = find(getDetails('custom_fields'), (option: any) => {
        return answerValue === option.id && option.is_nested_fields_enabled;
      });
      if(selectedField) return !isUndefined(answerPayload[`sub_option_${selectedField.id}`]) && !isLoading;
    }
    return true
  }, [answerPayload, isLoading])

  const isTextExplanationAdded = useMemo(() => {
    if(!fundCriteriaPreview) return false;
    if(isMultipleSelectionEnabled) {
      const selectedOptions = filter(getDetails('custom_fields'), (option: any) => {
        return answerPayload[option.id] && option.is_text_explanation_enabled;
      });
      return selectedOptions.every(obj => !isEmpty(getTextExplanationValue(obj.id))) && !isLoading
    }
    else {
        const selectedField = find(getDetails('custom_fields'), (option: any) => {
        return answerValue === option.id && option.is_text_explanation_enabled;;
      });
      if(selectedField) return !isEmpty(getTextExplanationValue(selectedField.id)) && !isLoading
    }
    return true
  }, [answerPayload, isLoading])
  
  const canMoveForward = useMemo(() => {
    const selectedField = find(getDetails('custom_fields'), (option: any) => {
      return answerPayload[option.id];
    });
    if(isMultipleSelectionEnabled) return !isUndefined(selectedField) && !isLoading;
    else return answerValue && !isLoading;
  }, [answerPayload, isLoading]);
  
  if (!fundCriteriaPreview) return <></>

  return <div>
    <h4 className="mt-5 mb-4">{getDetails('title')}</h4>
    {getDetails('description') && <p 
      className="mt-0"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(getDetails('description')),
      }}
      ></p>}
    {(getDetails('is_multiple_selection_enabled') === true && size(getDetails('custom_fields')) > 1) && (
      <p className="mt-0">Please select all that apply.</p>
    )}
    <div key={`inline-radio`} className="mb-4 custom-radio-buttons">
      {map(getDetails('custom_fields'), (option: any, idx: number) => {
        const isOptionSelected = isMultipleSelectionEnabled ? isChecked(option.id) : answerValue === option.id;

        return <div key={`custom-block-option-${idx}`}>
          <Form.Check
            className={'mb-2'}
            onClick={(e: any) => updateAnswer(!isChecked(option.id), idx, option.id)}
            inline
            type={isMultipleSelectionEnabled ? 'checkbox' : 'radio'}
            label={`${option.title}`}
            name={blockKey}
            value={option.title}
            checked={isMultipleSelectionEnabled ? isChecked(option.id) : answerValue === option.id}
            id={`accredited-${idx}`}
          />
            {
            isOptionSelected && option.is_text_explanation_enabled && <TextExplanation 
            key={`text-explanation-${option.id}`}
            initialValue={getTextExplanationValue(option.id)}
            label={option.text_explanation}
            submitValue={(value: string) => {
              handleTextExplanationChange(true, idx, option.id, value)
            }} 
            />
          }
          <Form id={`nested-fields-${option.id}`}>
            { 
            isOptionSelected && option.nested_fields.map((nestedField: any, index: any) => (
              <div key={`nested-field-${nestedField.id}`} style={{paddingLeft: '40px'}}>
                <Form.Check
                  className={'mb-2'}
                  onClick={(e: any) => {
                    const parentResponseJson = getParentRessponseJson(true, idx, option.id);
                    updatedNestedFieldAnswer(nestedField, option.id, parentResponseJson)
                  }}
                  inline
                  type='radio'
                  label={`${nestedField.title}`}
                  name={isMultipleSelectionEnabled ? blockKey : `${blockKey}-${nestedField.id}-${nestedField}`}
                  value={nestedField.title}
                  checked={getSelectedNestedOption(option.id, nestedField.id)}
                  id={`accredited-${idx}`}
                />
              </div>
            ))
          }
          </Form>
        </div>
      })}
    </div>
    <ButtonWrapper>
      <BackButton onClick={backFunction} >
        <ArrowBack /> Previous Step
      </BackButton>
      <NextButton onClick={nextFunction} disabled={!canMoveForward || !isNestedFieldAnswered || !isTextExplanationAdded}>
        Next Step <ArrowForward />
      </NextButton>
    </ButtonWrapper>
  </div>
};

export default CustomSmartBlock;
