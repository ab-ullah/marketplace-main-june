import Modal from "react-bootstrap/Modal";
import { OutlinedButton, TopButton } from "../../../../../../../styles";
import ForfeitForm from "./components/ForfeitForm";
import { useEffect, useMemo, useState } from "react";
import { getSumByProperty } from "../../../../../../../../../../utils/getValue";
import { decimalEqual, decimalGreaterThan } from "../../../../../../../../../../utils/decimal";
import API from "../../../../../../../../../../api/backendApi"
import { formatForfeitureRes } from "../../../OverviewSection/constants";

interface IForfeitModal {
  handleCloseModal: () => void;
  initState: Record<string, any>[];
  refreshData?: (_fundId: string) => void;
  participantName: string;
  handleForfeit: ((payload:any[])=>void);
  participantId: any
  forfeitLoading: boolean
}

const ForfeitModal = ({
  handleCloseModal,
  initState,
  refreshData,
  participantName,
  handleForfeit,
  participantId,
  forfeitLoading
}: IForfeitModal) => {
  const [state, setState] = useState<any[]>([]);
  const [calculateMode,setCalculateMode] = useState(true)
  const [isLoading,setIsLoading] = useState(false)

  const hasErrors = useMemo(
    () => state.map((elem) => elem.error).filter((elem) => elem).length >0,
    [state]
  );

  const hasNoChanges = useMemo(()=>decimalEqual(getSumByProperty(state,'points_to_forfeit'),'0'),[state])

  const handleChangePointsToForfeit = (allocationId: string, attributes: Record<string,any>) => {
    const updatedState = state.map((row) => {
      if (row.allocation_id === allocationId) {
        const updatedRow = {
          ...row,
          ...attributes,
        };
        const {points_to_forfeit, forfeiture_date} = updatedRow
        updatedRow.error = (points_to_forfeit && !isNaN(points_to_forfeit)) ?  (decimalGreaterThan(points_to_forfeit,row.bps) || !forfeiture_date) : false
        return updatedRow
      }
      return row;
    });

    setState(updatedState);
  };

  const generatePayload = ()=>{
    const payload = state.map((elem) => {
      const { allocation_id, base_pool_id, parent_pool_id, points_to_forfeit, forfeiture_date } =
        elem;
      return {
        allocation_id,
        base_pool_id,
        parent_pool_id,
        forfeiture_date,
        bps:isNaN(points_to_forfeit)? 0: Number(points_to_forfeit),
      };
    });

    return payload
  }

  const handleSubmit = async () => {
   const payload = generatePayload()
    handleForfeit(payload)
  };

  const handleInitState = ()=>{
    const newState = initState.map((elem) => ({
      ...elem,
      points_to_forfeit: 0,
      error: false,
      forfeiture_date:null
    }));
    setState(newState);
    setCalculateMode(true)
  }

  const handleCalculate = async()=>{
    setIsLoading(true)
    if(calculateMode){
    const payload = generatePayload()
    const res = await API.calculateUserAllocationsByIdWithDate( participantId,payload)
    if(res.success){
     const updatedState = formatForfeitureRes(res.data)
     const formattedState = updatedState.map((elem) => ({
      ...elem,
      points_to_forfeit: 0,
      error: false,
    }));
    setState(formattedState);
    setCalculateMode(false)
    }
  }
  else{
    handleInitState()
  }
  setIsLoading(false)
  }

  useEffect(() => {
    handleInitState()
  }, [initState]);

  return (
    <>
      <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton>
          <Modal.Title>Carry Forfeiture - {participantName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-end mb-3">
      
        <p className="m-0">Vested and unvested will be calculated based on the respective forfeiture dates selected</p>
        <OutlinedButton onClick={handleCalculate} disabled={isLoading}>{calculateMode ? "Calculate": "Reset"}</OutlinedButton>
        </div>
          <ForfeitForm data={state} handleEdit={handleChangePointsToForfeit} calculateMode={calculateMode} disabledEdit={isLoading || forfeitLoading}/>
        </Modal.Body>
        <Modal.Footer>
          <TopButton onClick={handleSubmit} disabled={calculateMode || forfeitLoading || hasErrors || hasNoChanges}>Create Forfeit</TopButton>
          <OutlinedButton onClick={handleCloseModal}>Cancel</OutlinedButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ForfeitModal;
