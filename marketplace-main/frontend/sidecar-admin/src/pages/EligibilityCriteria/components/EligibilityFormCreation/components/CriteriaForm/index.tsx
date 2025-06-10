import {FunctionComponent} from "react";
import {Tab} from "react-bootstrap";
import {Droppable, Draggable} from "react-beautiful-dnd";
import {eligibilityConfig} from "../../utils/EligibilityContext";
import {ICriteriaBlock} from "../../../../../../interfaces/EligibilityCriteria/criteria";
import FormBlock from "./components/FormBlock";
import {FormInfoText, ConnectorWrapper} from "./components/styles";
import {getItemStyle, getListStyle} from "../../utils/sortCriteriaBlocks";
import ConnectorElement from "../../../CriteriaFlow/components/ConnectorElement";

interface CriteriaFormProps {
  criteriaBlocks: ICriteriaBlock[];
  allowEdit?: boolean;
  hasCustomEvaluation: boolean;
  isSmartDecisionFlow?: boolean;
}

const CriteriaForm: FunctionComponent<CriteriaFormProps> = ({
                                                              criteriaBlocks,
                                                              allowEdit,
                                                              isSmartDecisionFlow
                                                            }) => {
  return (
    <Tab.Content>
      <Tab.Pane eventKey="firstTab">
        <FormInfoText className="create-form-card">
          <p>
            Click the + Add button to see all the available blocks. Each block
            contains discrete rules relevant for that particular country.
          </p>
          <p>
            Let’s start building your eligibility criteria for these countries.
          </p>
          <p className="mb-0">
            Click on the block to add it into your flow. You can add blocks with
            rules for the investor country and the country the fund is domiciled
            in.
          </p>
        </FormInfoText>

        <Droppable droppableId="droppable">
          {(provided: any, snapshot: any) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {criteriaBlocks.map((criteriaBlock: any, index: number) => (
                <Draggable
                  key={criteriaBlock.id}
                  isDragDisabled={(criteriaBlock.block === null && criteriaBlock.custom_block === null) || !allowEdit || isSmartDecisionFlow}
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
                      <FormBlock
                        criteriaBlock={criteriaBlock}
                        key={`form-creation-${criteriaBlock.id}`}
                        blockIndex={criteriaBlock.position}
                      />
                      {!snapshot.isDragging &&
                        criteriaBlock?.block_connected_to[0] && (
                          <ConnectorWrapper>
                            <ConnectorElement
                              connector={criteriaBlock.block_connected_to[0]}
                              key={`${criteriaBlock.id}-${criteriaBlock.block_connected_to[0].condition}`}
                            />
                          </ConnectorWrapper>
                        )}
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </Tab.Pane>
    </Tab.Content>
  );
};

CriteriaForm.defaultProps = {
  allowEdit: true,
  isSmartDecisionFlow: false
}

export default eligibilityConfig(CriteriaForm);
