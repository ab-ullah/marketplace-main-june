import sortBy from "lodash/sortBy";
import { ICriteriaBlock } from "../../../../../interfaces/EligibilityCriteria/criteria";

export const sortCriteriaBlocks = (criteriaBlocks: ICriteriaBlock[]) => {
  return sortBy(criteriaBlocks, function (o) {
    return o.position;
  });
};

export const reorder = (list: any, startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};



const grid = 1;
export const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "#EBF3FB" : "transparent",
  border: `2px dashed ${isDragging ? "#CFD8DC" : "transparent"}`,
  cursor: "pointer",

  // styles we need to apply on draggables
  ...draggableStyle,
});

export const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? "rgba(235, 243, 251, 0.3)" : "transparent",
  border: `1px solid ${isDraggingOver ? "#CFD8DC" : "transparent"}`,
  padding: grid,
  width: "auto",
});