import React, {FunctionComponent, useState} from 'react';
import {useAppSelector} from "../../../../app/hooks";
import {selectNotices, selectNoticesValuation} from "../../selectors";
import Stack from "react-bootstrap/Stack";
import Considerations from "../Considerations";
import CurrencyToggle from "../Considerations/CurrencyToggle";
import {useGetNoticesPageConfigQuery} from "../../../../api/rtkQuery/pageConfigsApi";
import {IInvestmentTable} from "../../../../interfaces/PageConfigs/investmentDashboard";
import { VALUATION_TABLE_ID } from '../utils/RenderTablesDynamically';
import ExportButton from '../../../../components/ExportButton';


interface DesktopViewTablesProps {
}


const DesktopViewTables: FunctionComponent<DesktopViewTablesProps> = () => {
  const [exportData, setExportData] = useState<any>({})
  const noticeResponse = useAppSelector(selectNotices);
  const noticeValuationsResponse = useAppSelector(selectNoticesValuation);
  const {data: ownershipConfig} = useGetNoticesPageConfigQuery()
  if (!noticeValuationsResponse || !noticeResponse || !ownershipConfig) return <></>

  return <>
    {ownershipConfig.tables.map((configTable: IInvestmentTable) => {
      return <section>
        <Stack direction="horizontal">
          <h2 className="section-title">{configTable.heading}</h2>
          <div className="ms-auto px-2"><CurrencyToggle/></div>
          {
            exportData[configTable.heading] && <ExportButton
              fileName={configTable.heading}
              tableColumns={exportData[configTable.heading].tableColumns}
              data={exportData[configTable.heading].data}
              />
          }
        </Stack>
        <Considerations
          notices={configTable.id===VALUATION_TABLE_ID ? noticeValuationsResponse.transactions: noticeResponse.transactions}
          compositions={configTable.id===VALUATION_TABLE_ID ? noticeValuationsResponse.transactions_compositions :  noticeResponse.transactions_compositions}
          configTable={configTable}
          setExportData={setExportData}
        />
      </section>
    })
    };
  </>
}

export default DesktopViewTables;
