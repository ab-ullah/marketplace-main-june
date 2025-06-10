import React, {FunctionComponent, useEffect} from 'react';
import ReactFlow from "react-flow-renderer";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectSelectedCriteria, selectSelectedCriteriaDetail} from "../../selectors";
import {calculateFlowElements} from "./calculateFlowElements";
import {getFundCriteriaDetail} from "../../thunks";
import {FlowContainer} from "./styles";


interface CriteriaFlowProps {
}


const CriteriaFlow: FunctionComponent<CriteriaFlowProps> = () => {
  const selectedCriteria = useAppSelector(selectSelectedCriteria)
  const selectedCriteriaDetail = useAppSelector(selectSelectedCriteriaDetail)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (selectedCriteria) {
      dispatch(getFundCriteriaDetail(selectedCriteria.id))
    }
  }, [])

  if (!selectedCriteriaDetail) return <></>
  const {nodes, edges} = calculateFlowElements(selectedCriteriaDetail)


  return <FlowContainer>
    <ReactFlow nodes={nodes} edges={edges} panOnScroll={true} />
  </FlowContainer>
};

export default CriteriaFlow;
