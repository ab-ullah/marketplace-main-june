import Modal from "react-bootstrap/Modal";
import DatePickerComponent from "../../../../../../../components/DatePicker";
import DocumentDropZone from "../../../../../../Funds/components/CreateFund/FileUploadComp";
import { ModalBodyCont, DatePickerContainer } from "./styles";
import Button from "react-bootstrap/Button";
import { standardizeDate } from "../../../../../../../utils/dateFormatting";
import { useState } from "react";
import NavableLoader from "../../../../../../../components/NavableLoader";
import moment from "moment/moment";
import { toast } from "react-toastify";

const CreateModal = ({
  showModal,
  handleHide,
  handleConfirm,
  dateFieldName
}: {
  showModal:any
  handleHide:any
  handleConfirm:any
  dateFieldName:any
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    moment.parseZone().format("MM/DD/YYYY")
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      if (file.type === "text/csv") setSelectedFile(file);
      else {
        toast("Invalid File. Please upload a .csv file");
      }
    }
  };

  const handleDateSelect = (date: any) => {
    const formattedDate = standardizeDate(date);
    setSelectedDate(formattedDate);
  };

  const handleHideModal = () => {
    handleHide();
    setSelectedFile(null);
    setSelectedDate(moment.parseZone().format("MM/DD/YYYY"));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const res = await handleConfirm(selectedFile, selectedDate);
    if (!res.success) {
      const {non_field_errors } = res.data
      const error = (non_field_errors && non_field_errors.length>0) ? non_field_errors[0] : "Something went wrong !"
      toast(error);
    }
    setIsLoading(false);
    if (res.success) {
      handleHideModal();
    }
  };

  return (
    <Modal
      size={"lg"}
      show={showModal}
      onHide={() => handleHideModal()}
      backdrop="static"
    >
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>Select File and Date</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <>
            <NavableLoader />
            <p style={{ textAlign: "center" }}>Please wait for a few seconds</p>
          </>
        ) : (
          <ModalBodyCont>
            <DocumentDropZone
              multi={false}
              isUploading={false}
              title="Your csv File"
              allowedFormats={["text/csv"]}
              onFilesSelect={handleFileSelected}
            />
            <div>
              <p style={{ marginBottom: "10px" }}>{dateFieldName}</p>
              <DatePickerContainer>
                <div className="datepicker">
                  <DatePickerComponent
                    placeholder={dateFieldName}
                    startDate={moment.parseZone().format("MM/DD/YYYY")}
                    onChange={(value) => handleDateSelect(value)}
                  />
                </div>
              </DatePickerContainer>
            </div>
          </ModalBodyCont>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          disabled={!(selectedDate && selectedFile) || isLoading}
          onClick={() => handleSubmit()}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateModal;
