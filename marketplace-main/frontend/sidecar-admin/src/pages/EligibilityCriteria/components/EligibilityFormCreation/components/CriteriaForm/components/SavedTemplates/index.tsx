import React, { FC, useMemo } from 'react';
import SavedTemplate from './SavedTemplate';
import CreateCustomSmartBlockCard from './CreateSmartBlockCard';
import { useAppSelector } from '../../../../../../../../app/hooks';
import { selectSelectedCriteriaDetail } from '../../../../../../selectors';
import { compact, get, includes, map, uniq } from 'lodash';
import { BlockContainerDiv, BlocksListWrapper, BlocksWrapper } from './Styles';

interface ISavedTemplates {
    templates: [],
    callbackEditTemplate: () => void;
    onCreateCustomSmartBlock: () => void;
}

const SavedTemplates:FC<ISavedTemplates> = ({ templates, callbackEditTemplate, onCreateCustomSmartBlock }) => {
    const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail);

    const selectedBlocks = useMemo(
        () =>
          uniq(
            compact(map(get(selectedCriteria, "criteria_blocks"), "custom_block.title"))
          ),
        [selectedCriteria]
      );

    return <BlocksWrapper>
    <h5 className='mb-2'>Custom Smart Block Templates</h5>
    <BlocksListWrapper className='row'>
    <BlockContainerDiv className='col-md-4'>
    <CreateCustomSmartBlockCard onCreateCustomSmartBlock={onCreateCustomSmartBlock} />
    </BlockContainerDiv>
    {
        templates.map((template: any) => <BlockContainerDiv className='col-md-4'>

        <SavedTemplate 
        isSelectedTemplate={includes(selectedBlocks, template.title)} 
        template={template}
        callbackEditTemplate={callbackEditTemplate}
        />
        </BlockContainerDiv>)
    }
    </BlocksListWrapper>
    </BlocksWrapper>
}

export default SavedTemplates;