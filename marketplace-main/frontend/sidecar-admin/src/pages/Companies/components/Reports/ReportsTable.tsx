import React, {FunctionComponent} from 'react';
import RsuiteTable from "../../../../components/Table/RSuite";
import {getReportColumns} from "./utils";
import {ICompanyReport} from "../../../../interfaces/companyReports";
import {TableHeading} from "./styles";
import API from "../../../../api";

interface ReportsTableProp {
  reports: ICompanyReport[],
  heading: string
}


const ReportsTable: FunctionComponent<ReportsTableProp> = ({reports, heading}) => {

  const downloadDocument = async (documentId: string, documentName: string) => {
    await API.downloadDocument(documentId, documentName)
  }

  return <>
    <TableHeading>
      {heading}
    </TableHeading>
    <RsuiteTable
      height="auto"
      autoHeight={true}
      allowColMinWidth={false}
      wordWrap={true}
      rowSelection={false}
      rowHeight={75}
      columns={getReportColumns(downloadDocument)}
      data={reports}
    />

  </>
};

export default ReportsTable;
