import React, {FunctionComponent, useEffect, useState} from "react";
import API from '../../api/backendApi'
import {Container} from "../TaxForms/styles";
import {SideCarStyledTable} from "../../presentational/StyledTableContainer";
import {ICarryCommitment, ICarryDocument} from "../../interfaces/carryManagement";
import InfoTileLayout, {ITileInfo} from "../../components/InfoTileLayout";
import RsSuite from "../../components/Table/RSuite";
import {getAllocationColumns, getCommitmentsColumns, getDocumentsColumns} from "./constants";
import {handleFormatToCurrency, getLatestDate} from "../../utils/currency";
import {SectionHeading, SectionWrapper, TopHeading} from "./styles";
import NavableLoader from "../../components/NavableLoader";
import {useHistory} from "react-router-dom";
import {INVESTOR_URL_PREFIX} from "../../constants/routes";
import {useCompanyPrefix} from "../../utils/hooks";
import { useGetCarryPlansPageConfigQuery } from "../../api/rtkQuery/pageConfigsApi";
import { getTooltip } from "../../utils/tooltip";
import { standardizeDate } from "../../utils/dateFormatting";
import {useGetCommitmentFeatureFlagQuery} from "../../api/rtkQuery/commonApi";

export interface CarryDocumentsViewProps {
}

const CarryDocumentsSigningView: FunctionComponent<CarryDocumentsViewProps> = () => {
    const [carryDocuments, setCarryDocuments] = useState<ICarryDocument[]>([])
    const [allocations, setAllocations] = useState<ICarryDocument[]>([])
    const [InfoTileData, setInfoTileData] = useState<ITileInfo[]>([])
    const [isLoadingOverview, setIsLoadingOverview] = useState<boolean>(true)
    const [isLoadingAllocations, setIsLoadingAllocations] = useState<boolean>(false)
    const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false)
    const [carryCommitments, setCarryCommitments] = useState<ICarryCommitment[]>([])
    const [isLoadingCarryCommitments, setIsLoadingCarryCommitments] = useState(false);
    const {companyPrefix} = useCompanyPrefix()
    const {data: commitmentFlag} = useGetCommitmentFeatureFlagQuery()
    const history = useHistory();

    const { data: carryPlansConfig, isLoading: isLoadingConfig} = useGetCarryPlansPageConfigQuery();
    const isLoading = isLoadingOverview || isLoadingConfig

    const handleDocumentsFetch = async ()=> {
        const data = await API.getCarryDocuments()
        setCarryDocuments(data)
    }

    const handleAllocationsFetch = async ()=> {
        const data = await API.getCarryAllocations()
        setAllocations(data)
    }

    const handleFetchCarryCommitments = async ()=> {
        const data = await API.getCarryCommitments()
        setCarryCommitments(data)
    }

    const redirectAllocationDetail = async (externalId : string)=> {
        history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/carry-plans/${externalId}`);
    }

    const handleOverviewFetch = async ()=> {
        const data = await API.getCarryOverview()
        const estimatedValueTooltip = getTooltip('estimated_value', carryPlansConfig?.tooltips ?? [])
        const fairMarketValueTooltip = getTooltip('fair_market_value', carryPlansConfig?.tooltips ?? [])
        const latestEstimatedCarryPlanDate = getLatestDate(allocations, 'estimated_value_date');
        const latestFairMarketValueDateCarryPlanDate = getLatestDate(allocations, 'fair_market_value_date');
        const tileData = [
            {value: 
                data.total_estimated_value ? handleFormatToCurrency(parseInt(data.total_estimated_value)) : '-', 
                label: "Total Estimated Value", tooltip: estimatedValueTooltip?.tooltip ?? null, subtitle: {latestEstimatedCarryPlanDate}},
            {value:handleFormatToCurrency(parseInt(data.estimated_vested_value)), label: "Estimated Vested Value"},
            {value:handleFormatToCurrency(parseInt(data.estimated_unvested_value)), label: "Estimated Unvested Value"},
            {value: data.total_fair_market_value > 0 ? handleFormatToCurrency(parseInt(data.total_fair_market_value)) : '-', 
                label: "Fair Market Value" , tooltip: fairMarketValueTooltip?.tooltip ?? null, subtitle: {latestFairMarketValueDateCarryPlanDate}},
            {value:handleFormatToCurrency(parseInt(data.total_distributions)), label: "Total Distributions"},
        ]
        if (commitmentFlag?.is_active) {
            tileData.push(
              {value: `${carryCommitments?.length ? carryCommitments?.length : 0 }`, label: "Commitments"},
            )
        }
        setInfoTileData(tileData)
    }

    const getTableHeight = () => {
        const length = carryCommitments.length;
        if(length > 5) return "400px";
        if(length === 1) return "110px";
        return `${110 + (length - 1) * 70}px`;
    }

    useEffect(() => {
        setIsLoadingDocuments(true)
        handleDocumentsFetch().then(() => {
            setIsLoadingDocuments(false)
        });
    }, [])

    useEffect(() => {
        handleOverviewFetch().then(() => {
            setIsLoadingOverview(false)
        });
    }, [carryPlansConfig, allocations])

    useEffect(() => {
        setIsLoadingAllocations(true)
        handleAllocationsFetch().then(() => {
            setIsLoadingAllocations(false)
        });
    }, [])

    useEffect(() => {
        setIsLoadingCarryCommitments(true)
        handleFetchCarryCommitments().then(() => {
            setIsLoadingCarryCommitments(false)
        })
    }, [])

    return <Container className={'mt-5'}>
       <TopHeading>Carry Dashboard</TopHeading>
        <SideCarStyledTable>
            <>
                <SectionWrapper className="mt-5">
                    {isLoading  && <NavableLoader></NavableLoader>}
                    {!isLoading &&
                        <InfoTileLayout data={InfoTileData as ITileInfo[]} colProps={{lg: 3}}/>
                    }
                </SectionWrapper>
                <SectionWrapper>
                    <SectionHeading>
                        Allocations
                    </SectionHeading>
                    {isLoadingAllocations && <NavableLoader></NavableLoader>}
                    {!isLoading &&
                        <RsSuite
                            height="500px"
                            allowColMinWidth={true}
                            rowSelection={false}
                            columns={getAllocationColumns(redirectAllocationDetail, carryPlansConfig?.tooltips ?? [])}
                            data={allocations}
                        />
                    }
                </SectionWrapper>
                {commitmentFlag?.is_active && <SectionWrapper>
                    <SectionHeading>
                        Commitments
                    </SectionHeading>
                    {isLoadingCarryCommitments && <NavableLoader/>}
                    {!isLoadingCarryCommitments &&
                      <RsSuite
                        height={carryCommitments.length ? getTableHeight() : undefined}
                        allowColMinWidth={true}
                        rowSelection={false}
                        columns={getCommitmentsColumns()}
                        data={carryCommitments}
                      />
                    }
                </SectionWrapper>}
                <SectionWrapper>
                    <SectionHeading>
                        Notifications & Documents
                    </SectionHeading>
                    {isLoadingDocuments && <NavableLoader></NavableLoader>}
                    {!isLoadingDocuments &&
                        <RsSuite
                            height="400px"
                            allowColMinWidth={true}
                            rowSelection={false}
                            columns={getDocumentsColumns()}
                            data={carryDocuments}
                        />
                    }
                </SectionWrapper>
            </>
        </SideCarStyledTable>
    </Container>

}

export default CarryDocumentsSigningView