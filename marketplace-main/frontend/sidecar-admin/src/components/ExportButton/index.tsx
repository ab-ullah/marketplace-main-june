import { useGetExcelExportFlagQuery } from "../../api/rtkQuery/commonApi";
import { PillButton } from "./styles";
import ExcelIcon from "../../assets/images/excel-icon.svg";
import { getHeader, getRows } from "./utils";
import { CSVLink } from "react-csv";

const ExportButton = ({
  fileName='navable-export',
  tableColumns,
  fieldsToSkip=[],
  data
}: any) => {
  const { data: ExcelExportFlag } = useGetExcelExportFlagQuery();
  if(!tableColumns || !data) return null
  const columns = tableColumns.filter((column: any) => !fieldsToSkip.includes(column.dataKey))
  const csvData = [
    getHeader(columns),
    ...getRows(columns, data)
  ]

  return (
    <div>
      {ExcelExportFlag?.is_active ? (
        <CSVLink data={csvData} filename={fileName}>
          <PillButton>
          <img src={ExcelIcon} alt="x" />
          Export
        </PillButton>
        </CSVLink>
      ) : null}
    </div>
  );
};

export default ExportButton;

const useGetExportForStats = (props: any = undefined) => {
  const {
    fileName='navable-export',
    tableColumns=[],
    fieldsToSkip=[],
    data=[]
  } = props || {};
  const { data: ExcelExportFlag } = useGetExcelExportFlagQuery();

  if (!ExcelExportFlag?.is_active) {
    return {};
  }

  if(!props) {
    return {}
  }

  return <ExportButton tableColumns={tableColumns} data={data} fileName={fileName} fieldsToSkip={fieldsToSkip}/>
};

export { useGetExportForStats };
