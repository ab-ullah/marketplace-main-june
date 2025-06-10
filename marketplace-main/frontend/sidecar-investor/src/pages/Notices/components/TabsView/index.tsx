import React, {FunctionComponent, useState} from 'react';
import {Tab, Tabs} from "react-bootstrap";
import {useAppSelector} from "../../../../app/hooks";
import styled from "styled-components";
import { selectNotices, selectNoticesValuation } from '../../selectors';
import { useGetNoticesPageConfigQuery } from '../../../../api/rtkQuery/pageConfigsApi';
import { IInvestmentTable } from '../../../../interfaces/PageConfigs/investmentDashboard';
import Considerations from '../Considerations';
import { get } from 'lodash';
import { VALUATION_TABLE_ID } from '../utils/RenderTablesDynamically';
import ExportButton from "../../../../components/ExportButton";


const StyledTabs = styled(Tabs)`
  padding: 10px 10px 0 10px;
  
  button {
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    color: #020203;
    
    :hover {
      border: none;
      color: #020203;
    }
  }

  .nav-link.active {
    color: #020203;
    border: none;
    border-bottom: 7px solid #EFB335;
  }
  
  .nav-link {
    transition: none;
  }
`


interface TopDashboardProps {

}


const TableTabsView: FunctionComponent<TopDashboardProps> = ({}) => {
  const [exportData, setExportData] = useState<any>({})
  const noticeResponse = useAppSelector(selectNotices);
  const noticeValuationsResponse = useAppSelector(selectNoticesValuation);
  const {data: ownershipConfig} = useGetNoticesPageConfigQuery()
  const defaultActiveKey = get(ownershipConfig, 'tables[0].heading', '');
  const [key, setKey] = useState(defaultActiveKey);

  if (!noticeValuationsResponse ||!noticeResponse || !ownershipConfig) return <></>

  return <StyledTabs activeKey={key} onSelect={(k) => k && setKey(k)} id="uncontrolled-tab-example">
    {ownershipConfig.tables.map((configTable: IInvestmentTable) => {
      return <Tab eventKey={configTable.heading} title={configTable.heading}>
        {
            exportData[configTable.heading] && <ExportButton
                fileName={configTable.heading}
                tableColumns={exportData[configTable.heading].tableColumns}
                data={exportData[configTable.heading].data}
            />
        }
        {
            key === configTable.heading && <Considerations
            setExportData={setExportData}
            notices={configTable.id===VALUATION_TABLE_ID ? noticeValuationsResponse.transactions: noticeResponse.transactions}
          compositions={configTable.id===VALUATION_TABLE_ID ? noticeValuationsResponse.transactions_compositions :  noticeResponse.transactions_compositions}
            configTable={configTable}
          />
        }
      </Tab>
    })
    };
  </StyledTabs>
};

export default TableTabsView;
