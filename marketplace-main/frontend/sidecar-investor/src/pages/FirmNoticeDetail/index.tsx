import React, {FunctionComponent, useEffect} from 'react';
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchFirmNotices, fetchFirmNoticesValuations} from "./thunks";
import Stack from "react-bootstrap/Stack";
import {LoggedInFooter} from "../../components/Footer";
import {useGetFirmNoticesPageConfigQuery} from "../../api/rtkQuery/pageConfigsApi";
import {IInvestmentTable} from "../../interfaces/PageConfigs/investmentDashboard";
import {selectFirmNotices, selectFirmNoticesValuations} from './selectors';
import {createTotalRow} from '../Notices/components/Considerations/computations';
import TopDashboard from './components/TopDashboard';
import Considerations from './components/Considerations';
import {resetFirmNotices, resetFirmNoticesValuations} from './firmNoticeDetailSlice';
import ExportButton from '../../components/ExportButton';


interface FirmNoticesDetailProps {
}

const VALUATION_TABLE_ID = 'valuation'

const FirmNoticeDetail: FunctionComponent<FirmNoticesDetailProps> = () => {
  const {firmId} = useParams<{ firmId: string }>();
  const {data: ownershipConfig} = useGetFirmNoticesPageConfigQuery()
  const dispatch = useAppDispatch();
  const firmNotices = useAppSelector(selectFirmNotices);
  const firmNoticesValuations = useAppSelector(selectFirmNoticesValuations);

  useEffect(() => {
    dispatch(fetchFirmNotices({firmId: firmId}));
    dispatch(fetchFirmNoticesValuations({firmId: firmId}));
    return () => {
      dispatch(resetFirmNotices())
      dispatch(resetFirmNoticesValuations())

    }
  }, [])
 if (!firmNotices || !ownershipConfig || !firmNoticesValuations) return <></>
  const totalRow = createTotalRow(firmNotices);
  const totalRowValuation = createTotalRow(firmNoticesValuations);
  return <>
    <TopDashboard totalRow={{...totalRow, ...totalRowValuation}} hasData={true}/>
    {ownershipConfig.tables.map((configTable: IInvestmentTable) => {
      return <section key={`${firmId}-${configTable.heading}`}>
        <Stack direction="horizontal" className='d-flex justify-content-between'>
          <h2 className="section-title">{configTable.heading}</h2>
          <ExportButton/>
        </Stack>
        <Considerations
          notices={configTable.id === VALUATION_TABLE_ID ? firmNoticesValuations: firmNotices}
          configTable={configTable}
        />
      </section>
    })
    };
    <LoggedInFooter/>
  </>
};

export default FirmNoticeDetail;
