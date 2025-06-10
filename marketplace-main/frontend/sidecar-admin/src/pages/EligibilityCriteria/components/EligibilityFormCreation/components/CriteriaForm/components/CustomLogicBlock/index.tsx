import React, {FunctionComponent} from 'react';
import {eligibilityConfig} from "../../../../utils/EligibilityContext";
import {ICriteriaBlock} from "../../../../../../../../interfaces/EligibilityCriteria/criteria";
import {useAppDispatch, useAppSelector} from "../../../../../../../../app/hooks";
import {selectSelectedCriteriaDetail} from "../../../../../../selectors";
import {IReactTag} from "../../../../../../../../interfaces/ReactTags";
import {includes, toUpper} from "lodash";
import Chip from '@material-ui/core/Chip';
import API from "../../../../../../../../api"
import {updateExpression} from "../../../../../../eligibilityCriteriaSlice";
import {CustomChip, ErrorMessage} from "./styles";
import size from "lodash/size";
import get from "lodash/get";
import {CONDITION_COLOR} from "../../../../../CriteriaFlow/components/ConnectorElement/styles";

interface CustomLogicBlockProps {
  criteriaBlock: ICriteriaBlock;
  allowEdit?: boolean;
}

const AVAILABLE_OPERATORS = [
  {id: '(', text: '('},
  {id: ')', text: ')'},
  {id: 'AND', text: 'AND'},
  {id: 'OR', text: 'OR'},
]



const getChipColor = (value: string) => get(CONDITION_COLOR, toUpper(value), '#e0e0e0')

const getFontColor = (value: string) => toUpper(value) in CONDITION_COLOR ? '#FFFFFF' : '#000000'

const CustomLogicBlock: FunctionComponent<CustomLogicBlockProps> = ({criteriaBlock, allowEdit}) => {
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail)
  const dispatch = useAppDispatch()
  const [isValid, setIsValid] = React.useState<boolean>(true)

  const getBlockHeading = (criteriaBlock: ICriteriaBlock) => {
    if (criteriaBlock.block) return criteriaBlock.block.heading;
    if (criteriaBlock.custom_block) return criteriaBlock.custom_block.title
    return ''
  }

  if (!selectedCriteria) return <></>

  const tags = selectedCriteria.custom_expression ? selectedCriteria.custom_expression : []
  const selectedTagIds = tags.map(tag => `${tag.id}`)
  const availableBlockOptions = selectedCriteria?.criteria_blocks.filter(
    (criteriaBlock) => !criteriaBlock.is_final_step && !criteriaBlock.is_country_selector && !criteriaBlock.is_user_documents_step && !criteriaBlock.is_custom_logic_block && !criteriaBlock.block?.is_admin_only
  ).map((criteriaBlock) => {
    return {
      id: `${criteriaBlock.id}`,
      text: getBlockHeading(criteriaBlock)
    }
  })

  const hasPendingTags = size(availableBlockOptions) > 0


  const validateAndUpdate = async (expression: IReactTag[]) => {
    if (!allowEdit) return
    const payload = {
      criteria_id: `${selectedCriteria.id}`,
      custom_expression: expression
    }
    const data = await API.validateCustomExpression(payload)
    setIsValid(data.is_valid)
    dispatch(updateExpression(expression))
  }


  const handleDelete = (deleteIndex: number) => {
    validateAndUpdate(tags.filter((tag, index) => index !== deleteIndex));
  };

  const handleAddition = (tag: IReactTag) => {
    validateAndUpdate([...tags, tag]);
  };


  return (
    <div className="app">
      <h3 className={'mb-2'}>Available Blocks</h3>
      {availableBlockOptions?.map(blockOption => <Chip
        label={blockOption.text}
        onClick={() => handleAddition(blockOption)}
        className={'me-2'}
      />)}
      <h3 className={'mb-2 mt-4'}>Operators</h3>
      {AVAILABLE_OPERATORS.map(operator => <Chip
        label={operator.text}
        onClick={() => handleAddition(operator)}
        className={'me-1'}
      />)}
      <h3 className={'mb-2 mt-4'}> Expression </h3>
      <div>
        <div>{
          tags.map((tag, index) => <CustomChip
            className={'me-1 mt-1'}
            label={tag.text}
            style={{background: getChipColor(tag.text), color: '#FFFFFF'}}
            onDelete={() => handleDelete(index)}
            bgColor={getChipColor(tag.text)}
            textColor={getFontColor(tag.text)}

          />)
        }
          {/* {hasPendingTags && <ErrorMessage>Please include all available blocks in your expression</ErrorMessage>} */}
          {!isValid && <ErrorMessage>Invalid Expression</ErrorMessage>}
        </div>
      </div>
    </div>
  );
};

CustomLogicBlock.defaultProps = {
  allowEdit: true,
}

export default eligibilityConfig(CustomLogicBlock);
