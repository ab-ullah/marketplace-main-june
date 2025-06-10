import {FunctionComponent, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import { selectFund } from "./selectors";
import { clearFund, clearFundDetail } from './fundDetailSlice';
import {fetchFund, fetchFundDetail} from "./thunks";
import { FundDetailContainer, StatusBadge, StatusDiv, HeaderContainer } from "./styles";
import Header from '../../components/Header'
import FundSetup from "../FundSetup";
import AnalyticsView from './components/AnalyticsView'
import {OptionType} from "./components/ViewSelector/interfaces";
import { VIEW_SELECTOR_OPTIONS } from "./components/ViewSelector/constants";
import {PUBLISHED, SETUP, getPillsColor} from "../../constants/fundStatus";
import { ITaskDetail } from '../../interfaces/Workflow/task';



interface FundDetailProps {
  task: ITaskDetail
}


const FundDetail: FunctionComponent<FundDetailProps> = ({ task }) => {
  const [view, setView] = useState<OptionType| undefined>()
  const {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch();
  const fund = useAppSelector(selectFund);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsView = searchParams.get('view');
    const paramsViewOption = VIEW_SELECTOR_OPTIONS.find(v => v.value === paramsView);
    if (!view) {
      setView(paramsViewOption || VIEW_SELECTOR_OPTIONS[0]);
    } else if (paramsViewOption !== view) {
      searchParams.set('view', view.value);
      window.history.replaceState({}, '', `?${searchParams.toString()}`);
    }
  }, [view])


  useEffect(() => {
    const fundExternalId: string = task ? task.fund_external_id : externalId;
    if(fundExternalId){
      dispatch(fetchFund(fundExternalId));
      dispatch(fetchFundDetail(fundExternalId));
    }
    return () => {
      dispatch(clearFund());
      dispatch(clearFundDetail());
    }
  }, [dispatch, externalId])

  if (!fund || !view) return <></>

  console.log(fund)

  const status = fund.is_published ? PUBLISHED : SETUP;
  return <FundDetailContainer className="page-container" fluid>
    <HeaderContainer>
      <Header title={fund.name} >
        <StatusDiv >Status: <StatusBadge color={getPillsColor(status)}>{status}</StatusBadge></StatusDiv>
      </Header>
    </HeaderContainer>
    {view.value === 'setup' && <FundSetup task={task}/>}
    {view.value === 'analytics' && <AnalyticsView fund={fund} />}
  </FundDetailContainer>
};

export default FundDetail;
