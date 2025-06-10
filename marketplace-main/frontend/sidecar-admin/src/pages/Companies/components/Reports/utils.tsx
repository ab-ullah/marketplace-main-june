import React from "react";
import {ICompanyReport} from "../../../../interfaces/companyReports";
import {DownloadButton} from "./styles";
import downloadIcon from "../../../../assets/images/download-report.svg";


export const getReportColumns = (download: any) => [
  {
    title: "Name",
    dataKey: "name",
    width: 600,
    flexGrow: 1.5,
  },
  {
    title: "",
    dataKey: "document",
    width: 250,
    Cell: (row: ICompanyReport) => <DownloadButton onClick={()=>download(row.document.document_id, row.document.title)}><img src={downloadIcon}/>Download</DownloadButton>,
  },

]