import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { getColumns, getRsuiteProps } from "./constants";

const TabTable = ({data, currentTab,handleSelectPlanToView,showStatus}:{data:any,currentTab:string,handleSelectPlanToView:any,showStatus:boolean}) => {
  if(!data || !getColumns(currentTab,data,showStatus)?.length) return null  

    return ( 
        <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(currentTab,data, showStatus)}
          data={data?.participants || data ||[]}
          wordWrap={true}
          defaultSortBy=''
          rowHeight={72}
         { ...getRsuiteProps(currentTab,handleSelectPlanToView)}
        />
      </div>
     );
}
 
export default TabTable;