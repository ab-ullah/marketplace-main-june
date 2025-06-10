import {FunctionComponent} from 'react';
import each from "lodash/each";
import Form from "react-bootstrap/Form";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import Button from "react-bootstrap/Button";
import {getCriteriaBlockAnswer} from "../../utils/getCriteriaBlockAnswer";
import eligibilityCriteriaAPI from "../../../../api/eligibilityCriteria";
import {selectFundCriteriaPreview, selectFundCriteriaResponse, selectIsLoading} from "../../selectors";
import {updateResponseBlock, setIsLoading} from "../../eligibilityCriteriaSlice";
import {CheckBox} from './style';
import { ButtonWrapper } from '../styles';
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, ArrowForward } from '@material-ui/icons';


interface CheckboxBlockProps {
  criteriaBlock: ICriteriaBlock,
  nextFunction: () => void;
  backFunction: () => void;
}


const CheckboxBlock: FunctionComponent<CheckboxBlockProps> = (
  {
    criteriaBlock,
    nextFunction,
    backFunction
  }
) => {
  const dispatch = useAppDispatch()
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const fundCriteriaResponse = useAppSelector(selectFundCriteriaResponse)
  const isLoading = useAppSelector(selectIsLoading)

  if (!fundCriteriaPreview) return <></>
  if (!fundCriteriaResponse) return <></>

  const selectedAnswer = getCriteriaBlockAnswer(criteriaBlock, fundCriteriaResponse)
  const options = criteriaBlock.block.options?.individual;
  const answerPayload = selectedAnswer ? selectedAnswer.response_json : {};

  const updateAllAnswers = (value: boolean, updatedIdx: number) => {
    let updatedPayload = {...answerPayload}
    options.forEach((option: any, idx: number) => {
      if (idx !== updatedIdx) {
        updatedPayload[option.id] = false
      }
    })
    return updatedPayload;
  }

  const noneValueSelected = () => {
    let selected = false;
    each(options, (option: any) => {
      if (!option.logical_value) {
        if (!selected && answerPayload[option.id]) selected = true;
      }
    })
    return selected;
  }

  const updateAnswer = async (value: string | boolean, idx: number) => {
    const selectedOption = options[idx]
    if (selectedOption.logical_value && noneValueSelected()) return
    let responseJson: {};
    if (!selectedOption.logical_value && value) {
      responseJson = {...updateAllAnswers(false, idx), [selectedOption.id]: value, [`${selectedOption.id}_option`]: selectedOption}
    } else {
      responseJson = {
        ...answerPayload,
        [selectedOption.id]: value,
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

  return <div>
    <h4 className="mt-5 mb-4">{criteriaBlock.block.title}</h4>
    <div key={`inline-radio`} className="mb-4 custom-radio-buttons">
      {options.map((option: any, idx: number) => {
        const selectedValue = answerPayload[option.id];
        if (option.sub_options) {
          return <div>
            <div>
              <p>{option.text}</p>
            </div>
            <div>
              {option.sub_options.map((subOption: any, subIdx: number) => {
                return <div key={`${criteriaBlock.id}-${subOption.id}`}>
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
                      onChange={() => updateAnswer(subOption.id, idx)}
                      checked={subOption.id === selectedValue}
                    />
                  </div>
                </div>
              })}
            </div>
          </div>
        }
        return <div key={`${criteriaBlock.id}-${option.id}`}>
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
              onChange={() => updateAnswer(!selectedValue, idx)}
              checked={selectedValue}
            />
          </div>
        </div>
      })}
    </div>
    <ButtonWrapper>
      <BackButton onClick={backFunction} >
        <ArrowBack /> Previous Step
      </BackButton>
      <NextButton onClick={nextFunction} disabled={isLoading}>
         Next Step <ArrowForward />
      </NextButton>
    </ButtonWrapper>
  </div>
};

export default CheckboxBlock;
