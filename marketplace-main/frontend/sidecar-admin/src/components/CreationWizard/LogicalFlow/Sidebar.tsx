import { map } from "lodash";
import React, { FC } from "react";
import { IBlock } from "../../../interfaces/EligibilityCriteria/blocks";
import {
  DEFAULT_BLOCKS_LABELS,
  DEFAULT_COUNTRY_SELECTOR_BLOCK,
  DEFAULT_FINAL_BLOCK,
} from "./constants";

interface ISideBarProps {
  blocks: IBlock[];
  selectedBlockIds: string[];
}

const SideBar: FC<ISideBarProps> = ({ blocks, selectedBlockIds }) => {
  // @ts-ignore
  const onDragStart = (event, nodeType, label, id) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("label", label);
    event.dataTransfer.setData("id", id);
    event.dataTransfer.effectAllowed = "move";
  };
  
  return (
    <aside>
      <div className="description">
        You can drag these blocks to the pane on the right.
      </div>
      {!selectedBlockIds.includes(DEFAULT_COUNTRY_SELECTOR_BLOCK) && <div
        className="dndnode output"
        onDragStart={(event) =>
          onDragStart(
            event,
            "output",
            DEFAULT_BLOCKS_LABELS[DEFAULT_COUNTRY_SELECTOR_BLOCK],
            DEFAULT_COUNTRY_SELECTOR_BLOCK
          )
        }
        draggable
      >
        {DEFAULT_BLOCKS_LABELS[DEFAULT_COUNTRY_SELECTOR_BLOCK]}
      </div>}
      {map(
        blocks,
        (block: any) =>
          !selectedBlockIds.includes(block.block_id) && (
            <div
              className="dndnode output"
              onDragStart={(event) =>
                onDragStart(event, "output", block.heading, block.block_id)
              }
              draggable
            >
              <p className="block_name">{block.heading}</p>
            </div>
          )
      )}
      {!selectedBlockIds.includes(DEFAULT_FINAL_BLOCK) && <div
        className="dndnode output"
        onDragStart={(event) =>
          onDragStart(
            event,
            "output",
            DEFAULT_BLOCKS_LABELS[DEFAULT_FINAL_BLOCK],
            DEFAULT_FINAL_BLOCK
          )
        }
        draggable
      >
        {DEFAULT_BLOCKS_LABELS[DEFAULT_FINAL_BLOCK]}
      </div>}
    </aside>
  );
};

export default SideBar;
