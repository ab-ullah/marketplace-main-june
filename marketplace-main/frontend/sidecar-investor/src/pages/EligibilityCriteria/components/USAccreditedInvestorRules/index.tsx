import {FunctionComponent, useEffect, useState, useMemo} from 'react';
import Form from "react-bootstrap/Form";
import debounce from "lodash/debounce";
import {ICriteriaBlock} from "../../../../interfaces/EligibilityCriteria/criteria";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import TextField from "../../../../components/Form/TextField";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectIsLoading} from "../../selectors";
import {AcknowledgmentCheckbox} from "../styles";
import {getCriteriaBlockAnswer} from "../../utils/getCriteriaBlockAnswer";
import eligibilityCriteriaAPI from "../../../../api/eligibilityCriteria";
import {setIsLoading, updateResponseBlock} from "../../eligibilityCriteriaSlice";
import SelectorInput from "../../../IndicateInterest/components/DetailsForm/SelectorField";
import { ButtonWrapper } from '../../../TaxForms/styles';
import { BackButton, NextButton } from '../../../KnowYourCustomer/styles';
import { ArrowBack, ArrowForward } from '@material-ui/icons';


interface AccreditedInvestorRulesProps {
  criteriaBlock: ICriteriaBlock,
  nextFunction: () => void;
  backFunction: () => void;
  fundCriteriaPreview: any,
  fundCriteriaResponse: any, 
}


const USAccreditedInvestorRules: FunctionComponent<AccreditedInvestorRulesProps> = ({
  criteriaBlock,
  fundCriteriaPreview,
  fundCriteriaResponse, 
  nextFunction,
  backFunction
}) => {
  const [certificateName, setCertificateName] = useState("");
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectIsLoading)

  const selectedAnswer = getCriteriaBlockAnswer(criteriaBlock, fundCriteriaResponse)
  const blockKey = criteriaBlock.block.block_id;

  const answerValue = selectedAnswer?.response_json.value;
  const answerPayload = selectedAnswer ? selectedAnswer.response_json : {};
  const acknowledgedValue = selectedAnswer?.response_json.acknowledged_value;
  const licenseType = selectedAnswer?.response_json.license_type;
  
 

  let needLicenseTypeText = false;
  const options = criteriaBlock.block.options?.individual;
  const selectedOptionIdx = options.findIndex((option: any) => option.id === answerValue)
  const selectedOption = options[selectedOptionIdx];
  if (selectedOption && selectedOption.has_selector_options) {
    needLicenseTypeText = licenseType?.require_text_details
  }

  const saveAnswer = async (responseJson: any) => {
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

  const updateValue = async (value: any, optionIdx: number) => {
    const selectedOption = options[optionIdx]
    const payload = {...answerPayload, value, [`${selectedOption.id}_option`]: selectedOption}
    await saveAnswer(payload)
  }

  const updateAcknowledgement = async () => {
    const payload = {...answerPayload, acknowledged_value: !acknowledgedValue}
    await saveAnswer(payload)
  }

  const updateLicenseType = async (updatedLicenseType: string) => {
    const payload = {...answerPayload, license_type: updatedLicenseType}
    await saveAnswer(payload)
  }

  const updateCertificateName = async (certificate_name: string) => {
    const payload = {...answerPayload, certificate_name}
    await saveAnswer(payload)
  }

  const debouncedOnChange = useMemo(
    () => debounce(updateCertificateName, 2000)
    , [answerPayload]);

  useEffect(() => {
    if(selectedAnswer?.response_json.certificate_name && certificateName === "")
      setCertificateName(selectedAnswer?.response_json.certificate_name);
  }, [selectedAnswer]); 

  let canMoveForward = answerValue;
  canMoveForward = canMoveForward && (!selectedOption?.require_acknowledgement || acknowledgedValue)
  canMoveForward = canMoveForward && (!selectedOption?.has_selector_options || licenseType)
  canMoveForward = canMoveForward && (!needLicenseTypeText || certificateName)

  return <div>
    <h4 className="mt-5 mb-4">
      Are you an "accredited investor"? An "accredited investor" is any of the following. Please select one of the options below.
    </h4>
    <div key={`inline-radio`} className="mb-4 custom-radio-buttons">
      {criteriaBlock.block.options?.individual?.map((option: any, idx: number) => {
        const isChecked = option.id === answerValue;
        return <div key={`us-accredited-option-${idx}`}>
          <Form.Check
            className={'mb-2'}
            onChange={() => updateValue(option.id, idx)}
            inline
            label={option.text}
            name={blockKey}
            type={'radio'}
            value={option.id}
            checked={isChecked}
            id={`accredited-${idx}`}
          />
          {isChecked && option.require_acknowledgement && <div>
            <AcknowledgmentCheckbox
              className={'mb-2'}
              onChange={updateAcknowledgement}
              inline
              label={option.acknowledgement_text}
              name={`${blockKey}`}
              type={'checkbox'}
              value={option.id}
              checked={acknowledgedValue}
              id={`accredited-${idx}`}
            />
          </div>}
          {isChecked && option.has_selector_options && (
            <>
            <Col md={11} className={'mb-4 mt-2 ms-2'}>
              <SelectorInput
                label={'Please Select License Type'}
                placeholder={'License Type'}
                name={`${blockKey}-license-type`}
                value={licenseType}
                onChange={updateLicenseType}
                options={option.options}
                hideErrorMessage={true}
              />
            </Col>
            {needLicenseTypeText && 
              <Col md={11} className={'mb-4 mt-2 ms-2'}>
                <TextField
                  label={'Name the certificate'}
                  placeholder={'Certificate Name'}
                  name={`${blockKey}-certificate-name`}
                  value={certificateName}
                  onChange={(e: any) => {
                    setCertificateName(e.target.value);
                    debouncedOnChange(e.target.value);
                  }}
                  onBlur={(e: any) => {}}
                  onFocus={() => {}}
                  hideError={true}
                  inlineLabel={false}
                />
              </Col>
            }
            </>
          )}
        </div>
      })}
    </div>
    <ButtonWrapper>
      <BackButton onClick={backFunction} >
        <ArrowBack /> Previous Step
      </BackButton>
      <NextButton onClick={nextFunction} disabled={!canMoveForward || isLoading}>
        Next Step <ArrowForward />
      </NextButton>
    </ButtonWrapper>
  </div>
};

export default USAccreditedInvestorRules;
