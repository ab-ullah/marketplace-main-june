import { useGetExcelExportFlagQuery } from "../../api/rtkQuery/commonApi";
import { PillButton } from "./styles";
import ExcelIcon from "../../assets/icons/excel-icon.svg";
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
