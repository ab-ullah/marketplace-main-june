import {FunctionComponent} from 'react';
import Form from "react-bootstrap/Form";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import Button from "react-bootstrap/Button";
import {getCriteriaBlockAnswer} from "../../utils/getCriteriaBlockAnswer";
import eligibilityCriteriaAPI from "../../../../api/eligibilityCriteria";
import {selectFundCriteriaPreview, selectFundCriteriaResponse, selectIsLoading} from "../../selectors";
import {updateResponseBlock, setIsLoading} from "../../eligibilityCriteriaSlice";
import {reorderOptions} from '../../../../utils/reorderOptions';
import {CheckBox} from './style';
import { JP_ELIGIBLE_ENTITY, QUALIFIED_PURCHASER_BLOCK_ID } from '../../../../constants/eligibility_block_codes';
import { ButtonWrapper } from '../styles';
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, ArrowForward } from '@material-ui/icons';


interface GenericPreviewBlockProps {
  criteriaBlock: ICriteriaBlock,
  nextFunction: () => void;
  backFunction: () => void;
}


const RadioButtonBlock: FunctionComponent<GenericPreviewBlockProps> = ({criteriaBlock, nextFunction, backFunction}) => {
  const dispatch = useAppDispatch()
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)
  const isLoading = useAppSelector(selectIsLoading);

  if (!fundCriteriaPreview) return <></>
  if (!fundCriteriaResponse) return <></>

  const blockKey = criteriaBlock.block.block_id;
  const selectedAnswer = getCriteriaBlockAnswer(criteriaBlock, fundCriteriaResponse)
  const answerValue = selectedAnswer?.response_json.value;
  let options = criteriaBlock.payload.options;
  if (!options) options = criteriaBlock.block.options?.individual;

  const updateAnswer = async (value: string, optionIdx: number) => {
    const selectedOption = options[optionIdx]
    const responseJson = {
      value: value,
      [`${selectedOption.id}_option`]: selectedOption
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


  const canMoveForward = !!answerValue && !isLoading;
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
        const isChecked = option.id === answerValue;
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
            onChange={() => updateAnswer(option.id, idx)}
            checked={isChecked}
          />
        </div>
      })}
    </div>
    <ButtonWrapper>
      <BackButton onClick={backFunction} >
        <ArrowBack /> Previous Step
      </BackButton>
      <NextButton onClick={nextFunction} disabled={!canMoveForward}>
        Next Step <ArrowForward />
      </NextButton>
    </ButtonWrapper>
  </div>
};

export default RadioButtonBlock;
