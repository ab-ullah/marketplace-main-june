import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import API from "../../../../api/backendApi";
import ListPage from "../CapitalDistributionComps/ListPage";
import DetailPage from "../CapitalDistributionComps/DetailPage";
import NavableLoader from "../../../../components/NavableLoader";
import { useAppDispatch } from "../../../../app/hooks";
import { fetchFundDetail } from "../../../FundDetail/thunks";
import { TAB_NAME, PARAM_ID } from "./constants";

const CapitalCallsSection = () => {
  const { externalId } = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const searchParams = new URLSearchParams(window.location.search);
  const paramCapitalCallId = searchParams.get(PARAM_ID);

  const {
    getFundCapitalCalls,
    getFundCapitalCallDetail,
    createFundCapitalCall,
    getUserInfo,
  } = API;
  const [selected, setSelected] = useState<any>(null);
  const [callList, setCallList] = useState<any>([]);
  const [investors, setInvestors] = useState<any>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSelectRow = async (val: any) => {
    if (val?.id) {
      const res = await getFundCapitalCallDetail(externalId, val.id);
      setInvestors(res);
      setSelected(val);
    } else {
      setSelected(val);
      setInvestors([]);
      searchParams.delete(PARAM_ID);
      history.replace({
        search: searchParams.toString(),
      });
    }
  };

  const fetchCapitalCallsList = async () => {
    if (externalId) {
      const res = await getFundCapitalCalls(externalId);
      setCallList(res || []);
    }
  };

  const handleFetchUserInfo = async () => {
    const res = await getUserInfo();
    setIsAdmin(res.is_sidecar_admin);
  };

  const createCapitalCall = async (payload: any) => {
    const res = await createFundCapitalCall(externalId, payload);
    await fetchCapitalCallsList();
    return res;
  };

  useEffect(() => {
    dispatch(fetchFundDetail(externalId));
    fetchCapitalCallsList();
    handleFetchUserInfo();
  }, [externalId]);

  const getRowFromId = (id: any) => {
    return callList.find((dat: any) => dat.id.toString() === id);
  };

  useEffect(() => {
    if (paramCapitalCallId && callList.length > 0) {
      handleSelectRow(getRowFromId(paramCapitalCallId));
    }
  }, [callList]);

  return (
    <div>
      {selected && investors.length > 0 ? (
        <DetailPage
          goBack={() => handleSelectRow(null)}
          data={investors}
          selectedRow={selected}
          tabName={TAB_NAME}
        />
      ) : paramCapitalCallId ? (
        <NavableLoader />
      ) : (
        <ListPage
          data={callList}
          isAdmin={isAdmin}
          handleSelectRow={(row: any) => handleSelectRow(row)}
          handleCreate={createCapitalCall}
          tabName={TAB_NAME}
        />
      )}
    </div>
  );
};

export default CapitalCallsSection;
