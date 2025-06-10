import filter from "lodash/filter";
import RsuiteTable from "../../../../../../../../../../../../components/Table/RSuite";
import { getColumns, generateFooterData } from "./constants";

const ForfeitForm = ({
  data,
  handleEdit,
  calculateMode,
  disabledEdit
}: {
  data: any[];
  handleEdit: (allocationId: string, attributes: Record<string,any>) => void;
  calculateMode: boolean;
  disabledEdit: boolean
}) => {
  const dataWithDate =(_data:any)=>{
    if(calculateMode) return _data
    else{
      return filter(_data,(dat:any)=>dat.forfeiture_date)
    }
  }
  return (
    <RsuiteTable
      height="400px"
      allowColMinWidth={true}
      rowSelection={false}
      columns={getColumns(handleEdit,!calculateMode, disabledEdit)}
      data={[...dataWithDate(data), generateFooterData(dataWithDate(data))]}
      wordWrap={true}
    />
  );
};

export default ForfeitForm;
