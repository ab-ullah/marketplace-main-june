import {useState} from "react";
import {useGetExcelExportFlagQuery} from "../../../../../../../api/rtkQuery/commonApi";
import {
    useRequestAllocationsExportMutation,
    useRequestCarryExportMutation
} from "../../../../../../../api/rtkQuery/companyApi";
import moment from "moment/moment";
import {
    CarryExportWrapper,
    DatePickerContainer, PillButton
} from "../../../../CarryPlansPage/components/CarryPlansListView/components/CarryPlansExport/styles";
import ReactDatePickerComp from "../../../../../../../components/ReactDatePickerComp";
import ExcelIcon from "../../../../../../../assets/images/excel-icon.svg";
import ExportSuccessModal
    from "../../../../CarryPlansPage/components/CarryPlansListView/components/CarryPlansExport/exportSuccessModal";

const AllocationsExport = () => {
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const { data: ExcelExportFlag } = useGetExcelExportFlagQuery();
    const [requestAllocationExport, { isLoading }] = useRequestAllocationsExportMutation();

    const onClickExport = async () => {
        await requestAllocationExport({
            date: moment().format('YYYY-MM-DD')
        }).unwrap().then(() => {
            setIsSuccessModalOpen(true)
        })
    }

    return ExcelExportFlag?.is_active ? <>
        <CarryExportWrapper>
            <PillButton onClick={onClickExport} disabled={isLoading}>
                <img src={ExcelIcon} alt="x" />
                Export
            </PillButton>
        </CarryExportWrapper>
        <ExportSuccessModal title={"Allocations export"} isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} />
    </> : null
};

export default AllocationsExport;