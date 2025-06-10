import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import API from "../../../../../../api/backendApi";
import NavableLoader from "../../../../../../components/NavableLoader";
import VestingScheduleDisplay from "../../../VestingScheduleDisplay";

const VestingDetailModal = ({ handleCloseModal, scheduleId }: any) => {
  const [scheduleDetail, setScheduleDetail] = useState({});
  
  const handleFetchScheduleDetails = async () => {
    const res = await API.fetchVestingScheduleById(scheduleId);
    if (res.success) {
      setScheduleDetail(res.data);
    }
  };
  useEffect(() => {
    if (scheduleId) {
      handleFetchScheduleDetails();
    }
  }, [scheduleId]);
  return (
    <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
      <Modal.Header closeButton style={{background:'#F5F7F8'}}>
        <Modal.Title>Vesting Schedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
       {Object.keys(scheduleDetail).length>0 ? <VestingScheduleDisplay data={scheduleDetail} textLimit={40}/>: <NavableLoader/>}
      </Modal.Body>
    </Modal>
  );
};

export default VestingDetailModal;
