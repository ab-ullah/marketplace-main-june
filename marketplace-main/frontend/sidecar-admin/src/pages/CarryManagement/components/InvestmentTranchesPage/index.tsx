import { useEffect, useState } from "react";
import { PageContainer, PillButton, Title, TopButton, TopRow } from "../styles";
import InvestmentTrancheModal from "./components/InvestmentTrancheModal";
import { useFetchInvestmentTrancheQuery } from "../../../../api/rtkQuery/carryApi";
import InvestmentTranchesList from "./components/InvestmentTrancheList";
import { Breadcrumb } from "react-bootstrap";
import { TRANCHE_ID_PARAM } from "../../constants";
import API from "../../../../api/backendApi";
import InvestmentTrancheDetailView from "./components/InvestmentTrancheDetailsView";
import NavableLoader from "../../../../components/NavableLoader";

const InvestmentTranchesPage = () => {
    const [isInvestmentTrancheModalOpen, setIsInvestmentTrancheModalOpen] = useState(false)
    const [trancheToView, setTrancheToView] = useState(null);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedTrancheName, setSelectedTrancheName] = useState(undefined);
    const { data: investmentTranches, refetch, isLoading, isFetching } = useFetchInvestmentTrancheQuery()

    const resetTrancheParam = () => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete(TRANCHE_ID_PARAM);
        window.history.replaceState({}, "", `?${searchParams.toString()}`);
        setSelectedDeal(null)
        setTrancheToView(null)
        setSelectedTrancheName(undefined)
    };

    const handleFetchDealDetails = async (tranche: any) => {
        const res = await API.fetchCarryInvestmentAllocationsById(tranche.id)
        if (res.success) {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set(TRANCHE_ID_PARAM, tranche.id);
            window.history.replaceState({}, "", `?${searchParams.toString()}`);
            setSelectedDeal(res.data)
            setTrancheToView(tranche);
            setSelectedTrancheName(tranche.name)
        }
        else {
            resetTrancheParam()
        }
    }

    useEffect(() => {
        setTrancheToView(null);
        setSelectedDeal(null)
        setSelectedTrancheName(undefined)
    }, [])

    useEffect(() => {
        if (!investmentTranches?.length) return
        const searchParams = new URLSearchParams(window.location.search);
        const trancheParamId = searchParams.get(TRANCHE_ID_PARAM);
        const tranche = investmentTranches.find((tranche: any) => tranche.id === Number(trancheParamId))
        if (trancheParamId && tranche) {
            handleFetchDealDetails(tranche)
        }
    }, [investmentTranches])

    return <PageContainer>
        {
            isLoading || isFetching ? <NavableLoader /> : <>
                <TopRow>
                    <Title>Investment Tranche</Title>
                    {
                        selectedDeal ? <PillButton onClick={() => {
                            setIsInvestmentTrancheModalOpen(true)
                        }} color="#4A47A3" borderColor="#4A47A3" style={{ fontSize: '16px' }}>
                            Edit Investment Tranche
                        </PillButton> : <TopButton onClick={() => setIsInvestmentTrancheModalOpen(true)}>
                            Create Investment Tranche
                        </TopButton>
                    }
                </TopRow>
                <Breadcrumb>
                    {["Carry Management", "Investment Tranches", selectedTrancheName]
                        .filter((elem) => elem)
                        .map((elem, i) => (
                            <Breadcrumb.Item
                                key={elem}
                                onClick={() => (i === 1 ? resetTrancheParam() : null)}
                            >
                                {elem}
                            </Breadcrumb.Item>
                        ))}
                </Breadcrumb>
                {
                    selectedDeal ? <InvestmentTrancheDetailView
                        investmentDetail={selectedDeal}
                        goBack={() => { }}
                    /> : <InvestmentTranchesList tranchesList={investmentTranches}
                        onSelectTranche={handleFetchDealDetails}
                    />
                }
                {isInvestmentTrancheModalOpen && 
                <InvestmentTrancheModal
                    handleCloseModal={() => {
                        setIsInvestmentTrancheModalOpen(false)
                       if(!selectedDeal) setTrancheToView(null)
                    }}
                    handleUpdateTranchList={() => refetch()}
                    initState={trancheToView}
                />}
            </>
        }
    </PageContainer>
}

export default InvestmentTranchesPage;