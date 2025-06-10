import React, { FunctionComponent, useMemo, Fragment } from "react";
import map from "lodash/map";
import uniq from "lodash/uniq";
import compact from "lodash/compact";
import includes from "lodash/includes";
import each from "lodash/each";
import last from "lodash/last";
import get from "lodash/get";
import styled from "styled-components";
import { useAppSelector } from "../../../../../../app/hooks";
import {
  selectBlockCategories,
  selectSelectedCriteriaDetail,
} from "../../../../selectors";
import BlockItem from "./BlockItem";
import { BlockContainerDiv } from "../../../../../../presentational/BlockContainer";
import { IBlock } from "../../../../../../interfaces/EligibilityCriteria/blocks";

const BlocksWrapper = styled.div`
  max-height: calc(100vh - 232px);
  overflow: auto;
`;

interface BlocksListProps {
  callbackSelectModal: (block: IBlock) => void;
}

const BlocksList: FunctionComponent<BlocksListProps> = ({
  callbackSelectModal,
}) => {
  const blockCategories = useAppSelector(selectBlockCategories);
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail);

  const selectedBlockIds = useMemo(
    () =>
      uniq(
        compact(map(get(selectedCriteria, "criteria_blocks"), "block.block_id"))
      ),
    [selectedCriteria]
  );

  const blockSets = useMemo(() => {
    const data: any = {
      "Any Region": [],
      "Europe Region": [],
    };
    each(get(last(blockCategories), "category_blocks"), (block: IBlock) => {
      if (!block.region_name && !block.country_name) {
        data["Any Region"].push(block);
        return;
      }
      if (block.region_name === "Europe Region") {
        data["Europe Region"].push(block);
        return;
      }
      if(block.country_name) {
        if(!data[block.country_name]) data[block.country_name] = [];
        data[block.country_name].push(block);
      }
        
    });
    return data;
  }, [blockCategories]);
  return (
    <>
      <BlocksWrapper>
        {map(blockSets, (blocks, key) => (
          <Fragment key={key}>
            <h5>{key}</h5>
            <BlockContainerDiv key={key}>
              {map(blocks, (block) => (
                <BlockItem
                  isSelectedBlock={includes(selectedBlockIds, block.block_id)}
                  block={block}
                  callbackSelectModal={callbackSelectModal}
                  key={`block-${block.id}`}
                />
              ))}
            </BlockContainerDiv>
          </Fragment>
        ))}
      </BlocksWrapper>
    </>
  );
};

export default BlocksList;
