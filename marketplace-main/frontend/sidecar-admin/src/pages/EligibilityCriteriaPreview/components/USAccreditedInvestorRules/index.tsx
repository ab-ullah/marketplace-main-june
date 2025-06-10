import React, {FunctionComponent} from 'react';
import Form from "react-bootstrap/Form";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import Button from "react-bootstrap/Button";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectAnswers, selectFundCriteriaPreview} from "../../selectors";
import {setAnswer, setLogicFlowValues, setSelectedOption, setUserFilesText, resetUserFilesText} from "../../eligibilityCriteriaPreviewSlice";
import {AcknowledgmentCheckbox} from "../styles";
import SelectorInput from "../Form/SelectorField";
import TextInput from "../Form/TextInput";
import Col from "react-bootstrap/Col";


interface AccreditedInvestorRulesProps {
  criteriaBlock: ICriteriaBlock,
  nextFunction: () => void;
}


const USAccreditedInvestorRules: FunctionComponent<AccreditedInvestorRulesProps> = ({criteriaBlock, nextFunction}) => {
  const answers = useAppSelector(selectAnswers);
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const dispatch = useAppDispatch()

  const blockKey = criteriaBlock.block.block_id;
  const answerKey = `${blockKey}-${criteriaBlock.id}`

  if (!fundCriteriaPreview) return <></>

  const updateAnswer = (value: string) => {
    const selectedOption = criteriaBlock.block.options?.individual.find((option: any) => option.text === value)
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

  const getAcknowledgedKey = (idx: number) => `${answerKey}-${idx}-acknowledged`
  const getLicenseTypeKey = (idx: number) => `${answerKey}-${idx}-licenseType`
  const getCertificateNameKey = (idx: number) => `${answerKey}-${idx}-certificateName`

  const selectedOptionIdx = criteriaBlock.block.options?.individual.findIndex((option: any) => option.text === answers[answerKey])
  const selectedOption = criteriaBlock.block.options?.individual[selectedOptionIdx]
  let needLicenseTypeText = false;
  if (selectedOption && selectedOption.has_selector_options) {
    let selectedSubOptionValue = answers[getLicenseTypeKey(selectedOptionIdx)]
    needLicenseTypeText = selectedSubOptionValue?.require_text_details
  }
  let canMoveForward = answers[answerKey]
  canMoveForward = canMoveForward && (!selectedOption.require_acknowledgement || answers[getAcknowledgedKey(selectedOptionIdx)])
  canMoveForward = canMoveForward && (!selectedOption.has_selector_options || answers[getLicenseTypeKey(selectedOptionIdx)])
  canMoveForward = canMoveForward && (!needLicenseTypeText || answers[getCertificateNameKey(selectedOptionIdx)])

  return <div>
    <h4 className="mt-5 mb-4">
      Are you an "accredited investor"? An "accredited investor" is any of the following. Please select one of the options below.
    </h4>
    <div key={`inline-radio`} className="mb-4 custom-radio-buttons">
      {criteriaBlock.block.options?.individual?.map((option: any, idx: number) => {
        const isChecked = option.text === answers[answerKey];
        const acknowledgedKey = getAcknowledgedKey(idx)
        const certificateNameKey = getCertificateNameKey(idx)
        const textValueKey = getLicenseTypeKey(idx)
        return <div key={`us-accredited-option-${idx}`}>
          <Form.Check
            className={'mb-2'}
            onChange={() => updateAnswer(option.text)}
            inline
            label={option.text}
            name={blockKey}
            type={'radio'}
            value={option.text}
            checked={isChecked}
            id={`accredited-${idx}`}
          />
          {isChecked && option.require_acknowledgement && <div>
            <AcknowledgmentCheckbox
              className={'mb-2'}
              onChange={() => dispatch(setAnswer({[acknowledgedKey]: !answers[acknowledgedKey]}))}
              inline
              label={option.acknowledgement_text}
              name={`${blockKey}`}
              type={'checkbox'}
              value={option.text}
              checked={answers[acknowledgedKey]}
              id={`accredited-${idx}`}
            />
          </div>}
          {isChecked && option.has_selector_options && <div>
            <div>
              <Col md={11} className={'mb-4 mt-2 ms-2'}>
                <SelectorInput
                  label={'Please Select License Type'}
                  placeholder={'License Type'}
                  name={`${blockKey}-license-type`}
                  value={answers[textValueKey]}
                  onChange={(v: any) => dispatch(setAnswer({[textValueKey]: v}))}
                  options={option.options}
                  hideErrorMessage={true}
                />
              </Col>
            </div>
            {needLicenseTypeText && <div>
              <Col md={11} className={'mb-4 mt-2 ms-2'}>
                <TextInput
                  label={'Name the certificate'}
                  placeholder={'Certificate Name'}
                  name={`${blockKey}-certificate-name`}
                  value={answers[certificateNameKey]}
                  onChange={(e: any) => dispatch(setAnswer({[certificateNameKey]: e.target.value}))}
                  onBlur={()=>{}}
                  hideErrorMessage={true}
                />
              </Col>
            </div>}
          </div>}
        </div>
      })}
    </div>
    <Button onClick={nextFunction} disabled={!canMoveForward}>Next</Button>
  </div>
};

export default USAccreditedInvestorRules;
