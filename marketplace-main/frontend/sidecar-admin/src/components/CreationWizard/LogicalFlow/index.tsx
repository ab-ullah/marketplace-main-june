import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Node,
} from "react-flow-renderer";
import "react-flow-renderer/dist/style.css";
import API from "../../../api/backendApi";

import Sidebar from "./Sidebar";

import "./index.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectBlockCategories,
  selectSelectedCriteriaDetail,
} from "../../../pages/EligibilityCriteria/selectors";
import { compact, each, filter, find, get, last, map, uniq } from "lodash";
import QuestionTitle from "./QuestionTitle";
import { getFundCriteriaDetail } from "../../../pages/EligibilityCriteria/thunks";
import {
  DEFAULT_BLOCKS,
  DEFAULT_BLOCKS_LABELS,
  DEFAULT_COUNTRY_SELECTOR_BLOCK,
  DEFAULT_DOC_BLOCK,
  DEFAULT_FINAL_BLOCK,
  getDefaultDocumentBlock,
} from "./constants";

const LogicalFlow = () => {
  const reactFlowWrapper = useRef(null);
  const dispatch = useAppDispatch();
  //@ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedBlockIds, setSelectedBlockIds] = useState<any[]>([]);
  const [isAllowCanvasEdit, setIsAllowCanvasEdit] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedodeId, setSelectedNodeId] = useState<any>(undefined);
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail);
  const blockCategories = useAppSelector(selectBlockCategories);

  useEffect(() => {
    const canvas_data = get(selectedCriteria, "smart_canvas_payload");
    const criteria_blocks = get(selectedCriteria, "criteria_blocks");
    const block_ids: any = [];
    if (canvas_data) {
      const { nodes } = canvas_data;
      setNodes(getNodes(nodes));
      setEdges(getEdges());
    }
    if (criteria_blocks) {
      each(criteria_blocks, (block: any) => {
        if (block.block) block_ids.push(get(block, "block.block_id"));
        if (block.custom_block) block_ids.push(get(block, "custom_block.id"));
      });
      setSelectedBlockIds(block_ids);
      setIsAllowCanvasEdit(true);
    }
  }, []);


  useEffect(() => {
    if (selectedCriteria?.id && isAllowCanvasEdit) {
      API.updateFundCriteria(selectedCriteria?.id, {
        smart_canvas_payload: {
          edges,
          nodes,
        },
      });
    }
  }, [nodes.length, edges.length]);

  const getCustomBlock = (block: any) => {
    const options: any = [];
    const fields = get(block, "custom_fields", []);
    each(fields, (field) => {
      options.push({
        id: `${field.id}`,
        text: field.title,
      });
    });
    return {
      block_id: `${block.id}`,
      heading: block.title,
      is_custom_block: true,
      options: {
        individual: options,
      },
    };
  };

  const criteriaBlocks = useMemo(() => {
    const blocks: any[] = [];
    const selectedCriteriaBlocks = get(selectedCriteria, "criteria_blocks");
    each(get(last(blockCategories), "category_blocks"), (block: any) => {
      blocks.push(block);
    });
    each(selectedCriteriaBlocks, (block: any) => {
      const customBlock = get(block, "custom_block");
      if (customBlock) {
        blocks.push(getCustomBlock(customBlock));
      }
    });
    return blocks;
  }, [blockCategories]);

  const getNodes = (nodes: any) => {
    const newNodes: any[] = [];
    const isDocumentBlockAdded = nodes.find((node: any) => node.id === DEFAULT_DOC_BLOCK);
    const finalBlockNode = nodes.find((node: any) => node.id === DEFAULT_FINAL_BLOCK);
    each(nodes, (node) => {
      if(!node.parentNode && !DEFAULT_BLOCKS.includes(node.id)){
        const criteriaBlock: any = find(get(selectedCriteria, "criteria_blocks"), 
                      block => block.block?.block_id === node.id || `${block.custom_block?.id}` === node.id)
        let options: any[] = []
        if(criteriaBlock?.block) options = get(criteriaBlock, 'block.options.individual', [])
        else if(criteriaBlock?.custom_block) options = get(getCustomBlock(criteriaBlock?.custom_block), 'options.individual')
        newNodes.push({
          ...node,
          style: {
            ...node.style,
            'z-index': 1,
            height: options.length * 60 + 50
          }
        })
        each(options, (option, index: number) => {
          const newNode = {
            id: option.id,
            type: "input",
            data: { label: <QuestionTitle title={option.text} /> },
            position: { x: 10, y: 50 + index * 60 },
            className: "light",
            parentNode: get(criteriaBlock, 'block.block_id', undefined) || `${get(criteriaBlock, 'custom_block.id',  )}`,
            draggable: false,
            selectable: false
          };
          newNodes.push(newNode)
      })
    }
    else if(DEFAULT_BLOCKS.includes(node.id)){
      newNodes.push(node)
    }
    });
    if(!isDocumentBlockAdded && finalBlockNode){
      newNodes.push(getDefaultDocumentBlock(finalBlockNode.position))
    }
    return newNodes;
  }

  const getEdges = () => {
    const connectors = get(selectedCriteria, 'connectors', []);
    const newEdges: any[] = []
    connectors.forEach((connector: any) => {
      const edge: any = {};
      if(connector.from_option){
        edge.source = `${connector.from_option}`
      }
      else {
        edge.source = `${getSourceTargetBlockId(connector.from_block)}`
      }
      edge.target = `${getSourceTargetBlockId(connector.to_block)}`
      edge.id = `reactflow__edge-${edge.source}-${edge.target}`
      edge.sourceHandle = null
      edge.targetHandle = null
      newEdges.push(edge)
    })
    return newEdges.filter(edge => edge.source !== 'undefined' || edge.target !== 'undefined')
  }

  const getSourceTargetBlockId = (blockId: any) => {
    const block = find(
      get(selectedCriteria, "criteria_blocks", []),
      (block) => get(block, "id") === blockId
    );
    if(block?.block){
      return get(block, 'block.block_id')
    }
    if(block?.custom_block){
      return get(block, 'custom_block.id')
    }
    if(block?.is_country_selector){
      return 'country_selector'
    }
    if(block?.is_final_step){
      return 'final_block'
    }
    if(!block){
      return DEFAULT_DOC_BLOCK;
    }
  }

  const getBlockId = (block_id: string) => {
    const block = find(
      get(selectedCriteria, "criteria_blocks", []),
      (block) => get(block, "block.block_id") === block_id
    );
    const customBlock = find(
      get(selectedCriteria, "criteria_blocks", []),
      (block) => `${get(block, "custom_block.id")}` === block_id
    );
    const countrySelectorBlock = find(
      get(selectedCriteria, "criteria_blocks", []),
      (block) => get(block, "is_country_selector") === true
    );
    const finalBlock = find(
      get(selectedCriteria, "criteria_blocks", []),
      (block) => get(block, "is_final_step") === true
    );
    if (block) return block.id;
    else if (customBlock) return customBlock.id
    else if (
      countrySelectorBlock &&
      block_id === DEFAULT_COUNTRY_SELECTOR_BLOCK
    )
      return countrySelectorBlock.id;
    else if (finalBlock && (block_id === DEFAULT_FINAL_BLOCK || block_id === DEFAULT_DOC_BLOCK))
      return finalBlock.id;
  };

  const createNodeGroup = (
    block_id: string,
    position: any,
    criteriaBlockId: any
  ) => {
    const criteria_block = find(
      criteriaBlocks,
      (block) => block.block_id === block_id
    );
    if (criteria_block) {
      const options = get(criteria_block, "options.individual", []);
      setNodes((nds) =>
      // @ts-ignore
        nds.concat({
          id: criteria_block.block_id,
          data: {
            label: criteria_block.heading
          },
          position,
          className: "light",
          style: {
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            width: 200,
            height: options.length * 60 + 50,
          },
          criteria_block_id: criteriaBlockId,
        })
      );

      setSelectedBlockIds((ids) => [...ids, criteria_block.block_id]);

      each(options, (option, index: number) => {
        const newNode = {
          id: option.id,
          type: "input",
          data: { label: <QuestionTitle title={option.text} /> },
          position: { x: 10, y: 50 + index * 60 },
          className: "light",
          parentNode: criteria_block.block_id,
          draggable: false,
          selectable: false
        };
        setNodes((nds) => nds.concat(newNode));
      });
    }
  };

  const createDefaultNode = (block_id: string, position: any) => {
    if (DEFAULT_BLOCKS.includes(block_id)) {
      setNodes((nds) =>
        nds.concat({
          id: block_id,
          data: {
            label: DEFAULT_BLOCKS_LABELS[block_id]
          },
          position,
          type:
            block_id === DEFAULT_COUNTRY_SELECTOR_BLOCK ? "input" : "output",
          className: "light",
          style: {
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            width: 200,
            height: 50,
          },
        })
      );
      if(block_id === DEFAULT_FINAL_BLOCK){
        // automatically add supporting document step and connect it with final step
        setNodes((nds) =>
        nds.concat(getDefaultDocumentBlock(position))
      );
      }
      onConnect({
        source: DEFAULT_DOC_BLOCK,
        target: block_id,
        sourceHandle: null,
        targetHandle: null
      })
      setSelectedBlockIds((ids) => [...ids, block_id]);
    }
  };

  const isCustomLogicBlockAdded = () => {
    const customLogicBlock = find(get(selectedCriteria, 'criteria_blocks'), (block: any) => block.is_custom_logic_block === true)
    if(customLogicBlock) return true
    else return false
  }

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();
      // @ts-ignore
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const id = event.dataTransfer.getData("id");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // @ts-ignore
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      if (selectedCriteria && !DEFAULT_BLOCKS.includes(id)) {
        const block = find(criteriaBlocks, (block) => block.block_id === id);
        if(!block.is_custom_block){
           await API.createCriteriaBlock(selectedCriteria?.id, {
            block: block.id,
            criteria: selectedCriteria.id,
            is_smart_view: true
          });
          dispatch(getFundCriteriaDetail(selectedCriteria.id));
        }
        if(!isCustomLogicBlockAdded()) {
          await API.createCustomLogicBlock(selectedCriteria.id)
          dispatch(getFundCriteriaDetail(selectedCriteria.id));
        }
        createNodeGroup(id, position, selectedCriteria.id);
      } else {
        createDefaultNode(id, position);
      }
    },
    [reactFlowInstance, criteriaBlocks]
  );

  const getSourceType = (sourceId: string) => {
    const sourceNode = find(nodes, (node: any) => node.id === sourceId);
    const id = get(sourceNode, "id", "");
    if (get(sourceNode, "type") === "input" && !DEFAULT_BLOCKS.includes(id))
      return "option";
    else return "block";
  };

  const getBlockIdByOptionId = (option_id: string) => {
    let blockId = null;
    each(criteriaBlocks, (block: any) => {
      const options = get(block, "options.individual", []);
      each(options, (option: any) => {
        if (option.id === option_id) {
          blockId = block.block_id;
        }
      });
    });
    return blockId;
  };

  const getEdgePayload = (source: any, target: any) => {
      let source_option = null;
      const sourceType = getSourceType(source);
      if (sourceType === "option") {
        source_option = source;
        source = getBlockIdByOptionId(source);
      }
      return {
        from_block: getBlockId(source),
        to_block: getBlockId(target),
        from_option: source_option,
      };
  }

  const onConnectEdge = useCallback(
    async (event: any) => {
      if(event['target'] === DEFAULT_FINAL_BLOCK) return
      const payload = getEdgePayload(event['source'], event['target'])
      await API.createBlockConnection(selectedCriteria?.id, payload);
      onConnect(event);
    },
    [selectedCriteria, nodes]
  );

  const handleNodeChanges = async (nodes: any) => {
    const parentNode = get(nodes, '0')
    const eventType = get(parentNode, 'type')
    if(eventType === 'select' && !DEFAULT_BLOCKS.includes(parentNode.id)){
      setSelectedNodeId(getBlockId(parentNode.id))
      onNodesChange(nodes)
    }
    if(eventType === 'remove' && DEFAULT_BLOCKS.includes(parentNode.id)) return
    if(eventType === 'remove') {
      if(selectedodeId){
        const response = await API.deleteCriteriaBlock(selectedodeId);
        if(response.status === 204){
          selectedCriteria && dispatch(getFundCriteriaDetail(selectedCriteria.id));
          setSelectedBlockIds((ids) => ids.filter((id) => id !== parentNode.id));
          onNodesChange(nodes)
        }
      }
    }
    else {
      onNodesChange(nodes)
    }
  }

  const handleEdgesChanges = async (event: any) => {
    const targetEdge = event[0];
    if(targetEdge.type === "remove"){
      const oldEdge = find(edges, (edge: any) => edge.id === targetEdge.id)
      if(oldEdge){
        const payload = getEdgePayload(oldEdge['source'], oldEdge['target'])
        await API.deleteBlockConnection(selectedCriteria?.id, payload);
        onEdgesChange(event)
      }
    }
    else{
      onEdgesChange(event)
    }
  }

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(e) => {
              handleNodeChanges(e)
            }}
            onEdgesChange={(e) => handleEdgesChanges(e)}
            onConnect={onConnectEdge}
            //@ts-ignore
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
        <Sidebar blocks={criteriaBlocks} selectedBlockIds={selectedBlockIds} />
      </ReactFlowProvider>
    </div>
  );
};

export default LogicalFlow;
