import React, {FunctionComponent} from 'react';
import { eligibilityConfig } from "../../../../utils/EligibilityContext";
import {ICriteriaBlock} from "../../../../../../../../interfaces/EligibilityCriteria/criteria";
import API from "../../../../../../../../api";
import APISyncTextField from "../../../../../../../../components/AutoSyncedInputs/TextInput";


interface FinalStepProps {
  criteriaBlock: ICriteriaBlock;
  allowEdit?: boolean;
}


const FinalStep: FunctionComponent<FinalStepProps> = ({criteriaBlock, allowEdit}) => {
  const onChange = async (name: string, value: string) => {
    const data = {
      payload: {
        [name]: value
      }
    }
    await API.updateCriteriaBlock(criteriaBlock.id, data)
  }

  return <div>
    <h4>Not eligible</h4>
    <APISyncTextField
      name={'failureText'}
      placeholder="Failure Text"
      onChange={(value: string) => onChange('failure_text', value)}
      value={criteriaBlock.payload.failure_text}
      disabled={!allowEdit}
    />
    <h4>Ready for review</h4>
    <APISyncTextField
      name={'needReviewText'}
      placeholder="Need Review Text"
      onChange={(value: string) => onChange('need_review_text', value)}
      value={criteriaBlock.payload.need_review_text}
      disabled={!allowEdit}
    />
  </div>
};

FinalStep.defaultProps = {
  allowEdit: false,
}

export default eligibilityConfig(FinalStep);
