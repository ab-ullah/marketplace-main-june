import React, {FunctionComponent} from 'react';
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectAnswers} from "../../selectors";
import {resetUserFilesText, setAnswer, setLogicFlowValues, setUserFilesText} from "../../eligibilityCriteriaPreviewSlice";
import Button from "react-bootstrap/Button";
import {CheckBox} from './style'


interface CheckboxBlockProps {
  criteriaBlock: ICriteriaBlock,
  nextFunction: () => void;
}


const CheckboxBlock: FunctionComponent<CheckboxBlockProps> = (
  {
    criteriaBlock,
    nextFunction
  }
) => {
  const answers = useAppSelector(selectAnswers);
  const dispatch = useAppDispatch()
  const answerKey = `${criteriaBlock.block.block_id}-${criteriaBlock.id}`
  const options = criteriaBlock.block.options?.individual;

  const getOptionKey = (idx: number) => {
    return `${answerKey}-option-${idx}`
  }

  const calculateLogicValue = (updatedIdx: number, value: string | boolean) => {
    let logicalValue = true;
    const booleanValue = !!value;
    options.map((option: any, idx: number) => {
      const optionBooleanValue = !!option.logical_value
      if (idx === updatedIdx) {
        const updatedValue = optionBooleanValue == booleanValue;
        logicalValue = logicalValue && updatedValue
      } else {
        const optionKey = getOptionKey(idx)
        const answerValue = !!answers[optionKey] == optionBooleanValue
        logicalValue = logicalValue && answerValue
      }
    })
    const payload = {[criteriaBlock.id]: logicalValue}
    dispatch(setLogicFlowValues(payload))
  }

  const updateAllAnswers = (value: boolean, updatedIdx: number) => {
    options.forEach((option: any, idx: number) => {
      if (idx !== updatedIdx) {
        const optionKey = getOptionKey(idx)
        const payload = {[optionKey]: value}
        dispatch(setAnswer(payload))
      }
    })
  }

  const noneValueSelected = () => {
    let selected = false;
    options.map((option: any, idx: number) => {
      if (!option.logical_value) {
        const optionKey = getOptionKey(idx)
        if (!selected && answers[optionKey]) selected = true;
      }
    })
    return selected;
  }

  const updateAnswer = (value: string | boolean, optionKey: string, idx: number) => {
    const selectedOption = criteriaBlock.block.options?.individual[idx]
    if (selectedOption.logical_value && noneValueSelected()) return
    const fileUploadText = value && selectedOption.require_files ? selectedOption.requirement_text : null;
    if (!selectedOption.logical_value && value) updateAllAnswers(false, idx)
    const payload = {[optionKey]: value}
    dispatch(setAnswer(payload))
    if(selectedOption.require_files){
      dispatch(setUserFilesText({[optionKey]: fileUploadText}))
    }
    else {
      dispatch(resetUserFilesText(criteriaBlock.id));
    }
    calculateLogicValue(idx, value)
  }

  return <div>
    <h4 className="mt-5 mb-4">{criteriaBlock.block.title}</h4>
    <div key={`inline-radio`} className="mb-4 custom-radio-buttons">
      {criteriaBlock.block.options?.individual?.map((option: any, idx: number) => {
        const optionKey = getOptionKey(idx)
        if (option.sub_options) {
          return <>
            <div>
              <p>{option.text}</p>
            </div>
            <div>
              {option.sub_options.map((subOption: any, subIdx: number) => {
                return <>
                  <div
                    className={'mt-2'}
                    key={`rules-${idx}`}
                  >
                    <CheckBox
                      inline
                      label={<p className={'m-0'}>{subOption.text}</p>}
                      name={`subOptions`}
                      type={'radio'}
                      id={`${criteriaBlock.block.block_id}-Suboptions-${subIdx}`}
                      onChange={() => updateAnswer(subOption.text, optionKey, idx)}
                      checked={subOption.text === answers[optionKey]}
                    />
                  </div>
                </>
              })}
            </div>
          </>
        }
        return <>
          <div
            className={'mt-2'}
            key={`rules-${idx}`}
          >
            <CheckBox
              inline
              label={<p className={'m-0'}>{option.text}</p>}
              name={`${criteriaBlock.block.block_id}-${idx}`}
              id={`${criteriaBlock.block.block_id}-${idx}`}
              type={'checkbox'}
              onChange={() => updateAnswer(!answers[optionKey], optionKey, idx)}
              checked={answers[optionKey]}
            />
          </div>
        </>
      })}
    </div>
    <Button onClick={nextFunction}>Next</Button>
  </div>
};

export default CheckboxBlock;
