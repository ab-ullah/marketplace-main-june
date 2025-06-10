import { each, get } from "lodash";
import { DEFAULT_BLOCKS } from "./constants";
import QuestionTitle from "./QuestionTitle";


export const getNodes = (nodes: any) => {
    const newNodes: any[] = [];
    each(nodes, (node: any) => {
      const type = get(node, "type");
      const title = get(node, "data.label.props.title");
      if ((type === "input" || type === "output") && title) {
        const id = get(node, "id");
        const newNode = {
          id,
          type,
          data: { label: <QuestionTitle title={title} /> },
          position: get(node, "position"),
          className: get(node, "className"),
          parentNode: get(node, "parentNode"),
          draggable: DEFAULT_BLOCKS.includes(id) ? true : false,
          selectable: false
        };
        newNodes.push(newNode);
      } else {
        newNodes.push(node);
      }
    });
    return newNodes;
  };