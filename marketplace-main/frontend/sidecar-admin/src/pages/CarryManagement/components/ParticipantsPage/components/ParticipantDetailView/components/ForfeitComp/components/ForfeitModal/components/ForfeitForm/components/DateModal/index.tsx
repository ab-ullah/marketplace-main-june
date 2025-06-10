import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { PillButton } from "../../../../../../../../../../../styles";
import ReactDatePickerComp from "../../../../../../../../../../../../../../components/ReactDatePickerComp";

interface DateModalProps {
  onDateChange: (date: any) => void;
  selectedDate: any;
  minDate?: any;
  title: string;
  disabled: boolean;
}

const DateModal = ({
  onDateChange,
  selectedDate,
  minDate,
  title,
  disabled
}: DateModalProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newDate, setNewDate] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);

  const closeModal = () => {
    setShowModal(false);
  };
  const handleChange = (d: string) => {
    setNewDate(d);
  };

  const handleSet = () => {
    onDateChange(newDate);
    closeModal();
  };

  useEffect(() => {
    if (selectedDate) {
      setStartDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  return (
    <>
      <div onClick={() => disabled? null: setShowModal(true)} style={disabled?{cursor:'not-allowed'}:{}}>
        {selectedDate || <PillButton style={disabled?{opacity:'0.5'}:{}}>Select</PillButton>}
      </div>
      <Modal size={"lg"} show={showModal} onHide={() => closeModal()}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please Select Date For Forfeiture</p>
          <ReactDatePickerComp
            onChange={handleChange}
            selected={startDate}
            minDate={minDate}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            type="cancel"
            className={"cancel-button"}
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            variant="outline-primary"
            type="submit"
            className={"submit-button"}
            disabled={!newDate}
            onClick={handleSet}
          >
            Set
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DateModal;
