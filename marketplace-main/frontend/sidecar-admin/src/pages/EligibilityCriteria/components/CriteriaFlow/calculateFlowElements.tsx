import {IConnector, IEligibilityCriteriaDetail} from "../../../../interfaces/EligibilityCriteria/criteria";
import {sortCriteriaBlocks} from "../EligibilityFormCreation/utils/sortCriteriaBlocks";
import BlockElement from "./components/BlockElement";
import ConnectorElement from "./components/ConnectorElement";


export const calculateFlowElements = (criteriaDetail: IEligibilityCriteriaDetail) => {
  const nodes: any[] = [];
  const edges: any[] = [];

  const sortedCriteriaBlocks = sortCriteriaBlocks(criteriaDetail.criteria_blocks);
  let yPosition = 25;
  sortedCriteriaBlocks.forEach((criteriaBlock, index) => {
      const lastPosition = null;
      const flowPosition = nodes.length + 1;
      if (index > 0) {
        yPosition += 100
      }
      nodes.push({
        id: `${flowPosition}`,
        data: {label: <BlockElement criteriaBlock={criteriaBlock}/>},
        position: {x: 600, y: yPosition},
        draggable: false,
        connectable: false,
        style: {width: '200px'}
      })
      criteriaBlock.block_connected_to.forEach((connector: IConnector) => {
        yPosition += 200;
        const flowPosition = nodes.length + 1;
        nodes.push({
          id: `${flowPosition}`,
          data: {label: <ConnectorElement connector={connector}/>},
          position: {x: 660, y: yPosition},
          draggable: false,
          connectable: false,
          style: {width: '80px'}
        })
      })
    }
  )
  const nodesCount = nodes.length;
  for (let nodeNumber = 1; nodeNumber < nodesCount; nodeNumber++) {
    edges.push({
      id: `e${nodeNumber}-${nodeNumber + 1}`,
      source: `${nodeNumber}`,
      target: `${nodeNumber + 1}`
    })
  }

  return {nodes, edges}
}
