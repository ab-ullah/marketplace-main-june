import React, {FunctionComponent} from 'react';
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectAnswers} from "../../selectors";
import {setAnswer, setLogicFlowValues, setSelectedOption, setUserFilesText, resetUserFilesText} from "../../eligibilityCriteriaPreviewSlice";
import Button from "react-bootstrap/Button";
import {CheckBox} from './style'
import {reorderOptions} from '../../../../utils/reorderOptions';
import { JP_ELIGIBLE_ENTITY, QUALIFIED_PURCHASER_BLOCK_ID } from '../../../../constants/eligibility_block_codes';

interface GenericPreviewBlockProps {
  criteriaBlock: ICriteriaBlock,
  nextFunction: () => void;
}


const RadioButtonBlock: FunctionComponent<GenericPreviewBlockProps> = ({criteriaBlock, nextFunction}) => {
  const answers = useAppSelector(selectAnswers);
  const dispatch = useAppDispatch()
  const blockKey = criteriaBlock.block.block_id;
  const answerKey = `${blockKey}-${criteriaBlock.id}`

  let options = criteriaBlock.payload.options;
  if (!options) options = criteriaBlock.block.options?.individual;

  const updateAnswer = (value: string) => {
    const selectedOption = options.find((option: any) => option.text === value)
    const fileUploadText = selectedOption.require_files ? selectedOption.requirement_text : null;
    const payload = {[answerKey]: value}
    dispatch(setLogicFlowValues({[criteriaBlock.id]: selectedOption.logical_value}))
    dispatch(setAnswer(payload))
    dispatch(setSelectedOption({[criteriaBlock.id]: selectedOption}))
    if(selectedOption.require_files){
      dispatch(setUserFilesText({[answerKey]: fileUploadText}))
    }
    else {
      dispatch(resetUserFilesText(criteriaBlock.id));
    }
  }

  const canMoveForward = answers[answerKey]
  // TODO
  //For all eligibility blocks we to show option having logical value false
  //at the end of list except for JP Eligibility Rules.
  //We need to find a generic solution to handle this 
  options =
  [JP_ELIGIBLE_ENTITY, QUALIFIED_PURCHASER_BLOCK_ID].includes(blockKey)
      ? options.filter((option: any) => option.text)
      : reorderOptions(options.filter((option: any) => option.text));

  return <div>
    <h4 className="mt-5 mb-4">{criteriaBlock.block.title}</h4>
    <div key={`inline-radio`} className="mb-4 custom-radio-buttons">
      {options.map((option: any, idx: number) => {
        const isChecked = option.text === answers[answerKey];
        
        return <div
          className={'mt-2'}
          key={`rules-${idx}`}
        >
          <CheckBox
            inline
            label={<p className={'m-0'}>{option.text}</p>}
            name={`${blockKey}-Option`}
            type={'radio'}
            id={`${blockKey}-Options-${idx}`}
            onChange={() => updateAnswer(option.text)}
            checked={isChecked}
          />
        </div>
      })}
    </div>
    <Button onClick={nextFunction} disabled={!canMoveForward}>Next</Button>
  </div>
};

export default RadioButtonBlock;
