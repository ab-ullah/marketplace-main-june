import ForfeitModal from "./components/ForfeitModal";
import API from "../../../../../../../../api/backendApi"
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { formatForfeitureRes } from "../OverviewSection/constants";
import { PARTICIPANT_NAME_PARAM } from "../../../../../../constants";

interface IForfeitCompProps {
    setShowForfeitModal:any;
    showForfeitModal:boolean;
    participantId:any;
    setForfeitLoading:any;
    forfeitLoading: boolean;
}

const ForfeitComp = ({setShowForfeitModal,showForfeitModal,participantId,setForfeitLoading,forfeitLoading}:IForfeitCompProps) => {
    const [isLoading,setIsLoading]=useState(false)
    const [carryPlansData, setCarryPlansData] = useState<any[]>([])

    const searchParams = new URLSearchParams(window.location.search);
    const paramsParticipantName = searchParams.get(PARTICIPANT_NAME_PARAM) || ""

    const handleForfeit = async (payload: any[]) => {
        setForfeitLoading(true)
        const forfeitRes = await API.updateCarryParticipantForfeitureById(
          participantId,
          payload
        );
        setForfeitLoading(false)
        if (forfeitRes.success) {
          toast.success("Points forfeited successfully!")
          setCarryPlansData(formatForfeitureRes(forfeitRes.data));
        }
        else {
          toast.error('Unable to forfeit!')
        }
      };

      const handleFetchCarryParticipantForfeiture = async () => {
        setIsLoading(true);
        const res = await API.fetchUserAllocationsById(participantId);
        setIsLoading(false);
    
        if (res.success) {
            setCarryPlansData(formatForfeitureRes(res.data));
        }
      };


      useEffect(()=>{
        handleFetchCarryParticipantForfeiture()
      },[])

      if(isLoading || !showForfeitModal) return <></>

    return ( 
        <ForfeitModal
        handleCloseModal={() => setShowForfeitModal(false)}
        participantName={paramsParticipantName}
        initState={carryPlansData}
        handleForfeit={(payload) => handleForfeit(payload)}
        participantId={participantId}
        forfeitLoading={forfeitLoading}
      />
     );
}
 
export default ForfeitComp;