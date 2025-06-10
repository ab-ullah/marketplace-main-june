import { CarryExportWrapper, DatePickerContainer, PillButton } from "./styles";
import ExcelIcon from "../../../../../../../../assets/images/excel-icon.svg";
import { useState } from "react";
import { useRequestCarryExportMutation } from "../../../../../../../../api/rtkQuery/companyApi";
import ExportSuccessModal from "./exportSuccessModal";
import { useGetExcelExportFlagQuery } from "../../../../../../../../api/rtkQuery/commonApi";
import moment from "moment";
import ReactDatePickerComp from "../../../../../../../../components/ReactDatePickerComp";

const CarryPlansExport = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { data: ExcelExportFlag } = useGetExcelExportFlagQuery();
  const [requestCarryExport, { isLoading }] = useRequestCarryExportMutation();

  const onClickExport = async () => {
    await requestCarryExport({
      date: moment(selectedDate).format('YYYY-MM-DD')
    }).unwrap().then(() => {
      setIsSuccessModalOpen(true)
    })
  }

  return ExcelExportFlag?.is_active ? <>
    <CarryExportWrapper>
      <DatePickerContainer className="date-container">
         <ReactDatePickerComp
                selected={selectedDate ? moment(selectedDate).toDate() : null}
                onChange={(v: any) => {
                  setSelectedDate(v)
                }}
                placeholderText="Pick a date"
                name={'carry-export-date'}
              />
      </DatePickerContainer>
      <PillButton onClick={onClickExport} disabled={isLoading || !selectedDate}>
        <img src={ExcelIcon} alt="x" />
        Export
      </PillButton>
    </CarryExportWrapper>
    <ExportSuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} />
  </> : null
};

export default CarryPlansExport;