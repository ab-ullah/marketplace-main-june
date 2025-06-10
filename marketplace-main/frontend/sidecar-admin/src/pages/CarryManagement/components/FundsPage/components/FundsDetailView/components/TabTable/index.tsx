import { useHistory } from "react-router-dom";
import { useGetCarryPlansConfigQuery } from "../../../../../../../../api/rtkQuery/companyApi";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import {getColumns} from "./constants";

const TabTable = ({data, currentTab,showGpCommit}:{data:any[],currentTab:string,showGpCommit:boolean}) => {
    const {data: carryPlansConfig } = useGetCarryPlansConfigQuery();
    const history = useHistory();
    if(!getColumns(currentTab, [],history,showGpCommit)?.length) return null
    return (
        <div className="mt-5">
            <RsuiteTable
                height="400px"
                allowColMinWidth={true}
                rowSelection={false}
                columns={getColumns(currentTab, carryPlansConfig?.tooltips ?? [],history,showGpCommit)}
                data={data||[]}
                wordWrap={true}
            />
        </div>
    );
}

export default TabTable;