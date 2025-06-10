import React, { FunctionComponent } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { eligibilityConfig } from "../../utils/EligibilityContext";
import { ICriteriaBlock } from "../../../../../../interfaces/EligibilityCriteria/criteria";
import CriteriaBlock from "./CriteriaBlock";
import { getItemStyle, getListStyle } from "../../utils/sortCriteriaBlocks";

interface CriteriaBlockListProps {
  criteriaBlocks: ICriteriaBlock[];
  allowEdit?: boolean; 
}

const CriteriaBlockList: FunctionComponent<CriteriaBlockListProps> = ({
  criteriaBlocks,
  allowEdit
}) => {
  return (
    <>
      <Droppable droppableId="droppable-left-menu">
        {(provided: any, snapshot: any) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {criteriaBlocks.map((criteriaBlock: any, index: number) => (
              <Draggable
                key={criteriaBlock.id}
                isDragDisabled={criteriaBlock.block === null || !allowEdit}
                draggableId={`${criteriaBlock.id}`}
                index={index}
              >
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <CriteriaBlock
                      criteriaBlock={criteriaBlock}
                      blockIndex={criteriaBlock.position}
                      key={`form-blocks-${criteriaBlock.id}`}
                    />
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </>
  );
};


CriteriaBlockList.defaultProps = {
  allowEdit: true,
}

export default eligibilityConfig(CriteriaBlockList);
