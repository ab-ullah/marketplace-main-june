import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import API from "../../../../api/backendApi";
import ListPage from "../CapitalDistributionComps/ListPage";
import DetailPage from "../CapitalDistributionComps/DetailPage";
import NavableLoader from "../../../../components/NavableLoader";
import { useAppDispatch } from "../../../../app/hooks";
import { fetchFundDetail } from "../../../FundDetail/thunks";
import { TAB_NAME, PARAM_ID } from "./constants";

const DistributionNoticesSection = () => {
  const { externalId } = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const searchParams = new URLSearchParams(window.location.search);
  const paramDistributionNoticeId = searchParams.get(PARAM_ID);

  const {
    getFundDistributionNotices,
    getFundDistributionNoticeDetail,
    createFundDistributionNotice,
    getUserInfo,
  } = API;
  const [selected, setSelected] = useState<any>(null);
  const [distributionList, setDistributionList] = useState<any>([]);
  const [investors, setInvestors] = useState<any>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSelectRow = async (val: any) => {
    if (val?.id) {
      const res = await getFundDistributionNoticeDetail(externalId, val.id);
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

  const fetchDistributionNoticesList = async () => {
    if (externalId) {
      const res = await getFundDistributionNotices(externalId);
      setDistributionList(res || []);
    }
  };

  const handleFetchUserInfo = async () => {
    const res = await getUserInfo();
    setIsAdmin(res.is_sidecar_admin);
  };

  const createDistributionNotice = async (payload: any) => {
    const res = await createFundDistributionNotice(externalId, payload);
    await fetchDistributionNoticesList();
    return res;
  };

  useEffect(() => {
    dispatch(fetchFundDetail(externalId));
    fetchDistributionNoticesList();
    handleFetchUserInfo();
  }, [externalId]);

  const getRowFromId = (id: any) => {
    return distributionList.find((dat: any) => dat.id.toString() === id);
  };

  useEffect(() => {
    if (paramDistributionNoticeId && distributionList.length > 0) {
      handleSelectRow(getRowFromId(paramDistributionNoticeId));
    }
  }, [distributionList]);

  return (
    <div>
      {selected && investors.length > 0 ? (
        <DetailPage
          goBack={() => handleSelectRow(null)}
          data={investors}
          selectedRow={selected}
          tabName={TAB_NAME}
        />
      ) : paramDistributionNoticeId ? (
        <NavableLoader />
      ) : (
        <ListPage
          data={distributionList}
          isAdmin={isAdmin}
          handleSelectRow={(row: any) => handleSelectRow(row)}
          handleCreate={createDistributionNotice}
          tabName={TAB_NAME}
        />
      )}
    </div>
  );
};

export default DistributionNoticesSection;
