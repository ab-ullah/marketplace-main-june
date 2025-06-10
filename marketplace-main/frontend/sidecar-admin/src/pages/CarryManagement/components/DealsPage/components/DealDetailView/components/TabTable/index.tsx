import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";

const TabTable = ({data, currentTab}:{data:any[],currentTab:string}) => {
    if(!getColumns(currentTab)?.length) return null
    return ( 
        <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(currentTab)}
          data={data||[]}
          // wordWrap={true}
        />
      </div>
     );
}
 
export default TabTable;