import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import { useLocation } from 'react-router-dom';
import {useAppSelector} from "../../../../app/hooks";
import {selectInvestorOwnership} from "../../selectors";
import Stack from "react-bootstrap/Stack";
import InvestedFunds from "../InvestedFunds";
import NotificationsList from "../Notifications";
import CurrencyToggle from "../InvestedFunds/CurrencyToggle";
import {getInvestedFunds, getInvestmentCompositions} from "../InvestedFunds/computations";
import {useGetOwnershipPageConfigQuery} from "../../../../api/rtkQuery/pageConfigsApi";
import ExportButton from '../../../../components/ExportButton';
import { NOTIFICATIONS } from '../../../../constants/urlHashes';


interface DesktopViewTablesProps {
}


const DesktopViewTables: FunctionComponent<DesktopViewTablesProps> = () => {
  const notificationsSectionRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const investorOwnership = useAppSelector(selectInvestorOwnership);
  const {data: ownershipConfig} = useGetOwnershipPageConfigQuery()
  const [exportData, setExportData] = useState({
    tableColumns: [],
    data: []
  });
  const [legacyExportData, setLegacyExportData] = useState({
    tableColumns: [],
    data: []
  });

  useEffect(() => {
    if(location.hash === NOTIFICATIONS && notificationsSectionRef.current) {
      notificationsSectionRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [])

  if (!investorOwnership || !ownershipConfig) return <></>

  const {activeInvestedFunds, legacyInvestedFunds} = getInvestedFunds(investorOwnership.invested_funds);
  const {activeInvestedCompositions, legacyInvestmentCompositions} = getInvestmentCompositions(investorOwnership.investment_compositions);

  return <>
    <section>
      <Stack direction="horizontal">
        <h2 className="section-title">{ownershipConfig.active_investments_label}</h2>
        <div className="ms-auto"><CurrencyToggle/></div>
        <ExportButton 
          fileName="Active Investments" 
          tableColumns={exportData.tableColumns} 
          data={exportData.data}/>
      </Stack>
      <InvestedFunds
        investedFunds={activeInvestedFunds}
        compositions={activeInvestedCompositions}
        isLegacy={false}
        setExportData={setExportData}
      />
    </section>
    {legacyInvestedFunds.length > 0 &&
      <section>
        <Stack direction="horizontal" className="justify-content-between">
          <h2 className="section-title">{ownershipConfig.legacy_investments_label}</h2>
          <ExportButton 
          fileName="Legacy Investments" 
          tableColumns={legacyExportData.tableColumns} 
          data={legacyExportData.data}/>
        </Stack>
        <Stack direction="horizontal">
          <p>Metrics are based on the most recent available data. Some metrics are not available.</p>
        </Stack>
        <InvestedFunds
          investedFunds={legacyInvestedFunds}
          compositions={legacyInvestmentCompositions}
          isLegacy={true}
          setExportData={setLegacyExportData}
        />
      </section>
    }
    <section ref={notificationsSectionRef}>
      <h2 className="section-title">Notifications & Documents</h2>
      <NotificationsList key={'desktop-view-notifications'} hideDueDate={ownershipConfig?.hide_due_date}/>
    </section>
  </>
};

export default DesktopViewTables;
