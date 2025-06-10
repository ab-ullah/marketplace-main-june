import React, {useState} from "react";
import {useGetExcelExportFlagQuery} from "../../../../../../../../../../api/rtkQuery/commonApi";
import {useRequestUserAllocationsExportMutation} from "../../../../../../../../../../api/rtkQuery/carryApi";
import moment from "moment";
import {
    CarryExportWrapper, DatePickerContainer
} from "../../../../../../../CarryPlansPage/components/CarryPlansListView/components/CarryPlansExport/styles";
import ReactDatePickerComp from "../../../../../../../../../../components/ReactDatePickerComp";
import {PillButton} from "../../../../../../../styles";
import ExcelIcon from "../../../../../../../../../../assets/images/excel-icon.svg"
import ExportSuccessModal from "../../../../../../../CarryPlansPage/components/CarryPlansListView/components/CarryPlansExport/exportSuccessModal"

const UserAllocationsExport = ({ participantId }: any) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const { data: ExcelExportFlag } = useGetExcelExportFlagQuery();
    const [requestAllocationExport, { isLoading }] = useRequestUserAllocationsExportMutation();

    const onClickExport = async () => {
        const res = await requestAllocationExport({
            userId: participantId,
            date: moment(selectedDate).format('YYYY-MM-DD')
        }).unwrap().then(() => {
            setIsSuccessModalOpen(true)
        })
        console.log(res)
    }

    // @ts-ignore
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

export default UserAllocationsExport;