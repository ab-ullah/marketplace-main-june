import { Breadcrumb } from "react-bootstrap";
import {PageContainer, PillButton, Title, TopButton, TopRow} from "../styles";
import FundModal from "./components/CarryFundModal";
import FundsListView from "./components/FundsListView";
import { useEffect, useState } from "react";
import { FUND_ID_PARAM } from "../../constants";
import FundDetailView from "./components/FundsDetailView";
import {ICarryFund} from "./components/FundsListView/constants";
import API from "../../../../api/backendApi"
import { ButtonAndSearchContainer, FilterBox, InputBox } from "./styles";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import filter from "lodash/filter";
import get from "lodash/get";
import {ICurrency} from "../../../../interfaces/currency";

const FundsPage = () => {
  const [fundToView, setFundToView] = useState<{
    id?: string | null;
    name?: string | null;
    data?: any | null;
  }>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [fundsList, setFundsList] = useState<ICarryFund[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectFund = (fund_id: string, fundData: ICarryFund) => {
    // setFundPayload(fundData)
    setFundToView({ id: fund_id, data: fundData });
  };
  const handleFundName = (name: string) => {
    setFundToView((prev) => ({ ...prev, name }));
  };

  const resetFundParam = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(FUND_ID_PARAM);
    window.history.replaceState({}, "", `?${searchParams.toString()}`);
    setFundToView({});
  };

  const handleFetchFunds = async () => {
    const res = await API.fetchAllCarryFunds();
    if(res.success)
      setFundsList(res.data)
  };

  const searchFilter = (data: any) => {
    if (searchQuery)
      return filter(data, (dat: any) =>
        ["name"].some(
          (attr) =>
            get(dat, attr) &&
            get(dat, attr).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    else return data;
  };

  useEffect(() => {
    handleFetchFunds();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsFund = searchParams.get(FUND_ID_PARAM);
    if (paramsFund && paramsFund !== fundToView.id) {
      setFundToView((prev) => ({ ...prev, id: paramsFund }));
    } else if (!paramsFund && fundToView.id) {
      searchParams.set(FUND_ID_PARAM, fundToView.id);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
  }, [fundToView.id]);

  useEffect(()=>{
    setSearchQuery("")
    if(fundToView.id && fundsList.length){
      const selectedFund = fundsList.find(l=>l.fund_id==fundToView.id)
      setFundToView((prev) => ({ ...prev, data: selectedFund, name: selectedFund?.name }));
    }
  },[fundToView.id,fundsList])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsFund = searchParams.get(FUND_ID_PARAM);
    if(paramsFund){
      const selectedFund = fundsList.find(fund=>fund.fund_id==paramsFund)
      if(selectedFund) {
        // setFundPayload(selectedFund)
        setFundToView((prev) => ({ ...prev, data: selectedFund, name: selectedFund.name }));
      }
    }
  }, [fundsList])

  return (
    <PageContainer>
      <TopRow>
        <Title>Funds</Title>
        {!fundToView?.id ? (
          <ButtonAndSearchContainer>
            <FilterBox>
              <InputBox
                type="text"
                placeholder="Filter"
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
              />
              <SearchOutlinedIcon />
            </FilterBox>
            <TopButton
              onClick={() => {
                setShowModal(true);
              }}
            >
              Create Fund
            </TopButton>
          </ButtonAndSearchContainer>
        ) : (
          <PillButton onClick={() => setShowModal(true)} color="#4A47A3" borderColor="#4A47A3" style={{fontSize:'16px'}}>
            Edit Fund
          </PillButton>
        )}

        {showModal && (
          <FundModal
            handleCloseModal={handleCloseModal}
            initState={fundToView.data}
            refetchData={handleFetchFunds}
          ></FundModal>
        )}
      </TopRow>
      <Breadcrumb>
        {["Carry Management", "Funds", fundToView.name]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item
              onClick={() => (i === 1 ? resetFundParam() : null)}
              key={elem}
            >
              {elem}
            </Breadcrumb.Item>
          ))}
      </Breadcrumb>
      {!fundToView.id ? (
        <FundsListView
          handleSelectFundToView={handleSelectFund}
          fundsList={searchFilter(fundsList)}
        />
      ) : (
        <FundDetailView
          fundId={fundToView.id}
          fundData={fundToView.data}
          handleFundName={handleFundName}
          goBack={resetFundParam}
        ></FundDetailView>
      )}
    </PageContainer>
  );
};

export default FundsPage;
