import Modal from "react-bootstrap/Modal";
import DisplayTable from "./components/DisplayTable";
import { useEffect, useState } from "react";
import NavableLoader from "../../../../components/NavableLoader";
import API from "../../../../api/backendApi";

const VestingDetailModal = ({ handleCloseModal, scheduleId, planExternalId }: any) => {
  const [scheduleDetail, setScheduleDetail] = useState({});
  
  const handleFetchScheduleDetails = async () => {
    const res = await API.getVestingSchedule(scheduleId, planExternalId);
    setScheduleDetail(res);
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
       {Object.keys(scheduleDetail).length>0 ? <DisplayTable data={scheduleDetail} />: <NavableLoader/>}
      </Modal.Body>
    </Modal>
  );
};

export default VestingDetailModal;
