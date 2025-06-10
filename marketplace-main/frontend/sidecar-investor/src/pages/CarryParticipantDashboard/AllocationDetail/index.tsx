import React, {FunctionComponent, useEffect, useState} from "react";
import {ICarryDocument, ParticipantAllocation} from "../../../interfaces/carryManagement";
import  {ITileInfo} from "../../../components/InfoTileLayout";
import API from "../../../api/backendApi";
import {handleFormatToCurrency, limitCarryDecimalPlaces } from "../../../utils/currency";
import {Container} from "../../TaxForms/styles";
import {SideCarStyledTable} from "../../../presentational/StyledTableContainer";
import {CarryDocumentsViewProps} from "../index";
import {useHistory, useParams} from "react-router-dom";
import {SectionWrapper} from "../styles";
import NavableLoader from "../../../components/NavableLoader";
import SubInfoTileLayout from "../../../components/SubInfoTileLayout";
import VestingDetailModal from "./VestingDetailModal";
import RsSuite from "../../../components/Table/RSuite";
import {getAllocationsColumns, getDocumentsColumns} from "../constants";
import { Breadcrumb } from "react-bootstrap";
import {INVESTOR_URL_PREFIX} from "../../../constants/routes";
import {useCompanyPrefix} from "../../../utils/hooks";
import {TopRow} from "../../StartPage/styles";
import {standardizeDate} from "../../../utils/dateFormatting";
import get from "lodash/get";
import SingleAllocationDetail from "../SingleAllocationDetail";


const CarryAllocationDetail: FunctionComponent<CarryDocumentsViewProps> = () => {
    const {externalId} = useParams<{ externalId: string }>();
    const [carryDocuments, setCarryDocuments] = useState<ICarryDocument[]>([])
    const [allocations, setAllocations] = useState<ParticipantAllocation[]>([])
    const [InfoTileData, setInfoTileData] = useState<ITileInfo[][]>([[]])
    const [isLoadingOverview, setIsLoadingOverview] = useState<boolean>(false)
    const [carryPlanName, setCarryPlanName] = useState<string>("")
    const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false)
    const [isLoadingAllocations, setIsLoadingAllocations] = useState<boolean>(false)
    const [scheduleToView, setScheduleToView] = useState<null | number>(null);
    const [isAllocationDetailModalOpen, setIsAllocationDetailModalOpen] = useState<boolean>(false)
    const [allocationId, setAllocationId] = useState<string | null>(null);
    const history = useHistory()
    const {companyPrefix} = useCompanyPrefix()

    const handleCloseModal = () => {
        setScheduleToView(null);
    };

    const handleSelectScheduleToView = (scheduleId: number) => {
        return () => setScheduleToView(scheduleId);
    };


    const handleDocumentsFetch = async () => {
        const data = await API.getCarryDocumentsByCarryPlan(externalId)
        setCarryDocuments(data)
    }

    const handleAllocationsFetch = async () => {
        const data = await API.getCarryDocumentsByCarryPlan(externalId)
        setCarryDocuments(data)
    }

    const handleOverviewFetch = async () => {
        const data = await API.getCarryAllocationFromCarryPlan(externalId)
        const estimated_value = get(data, "carry_plan_estimated_value",0)
        const vested_value = get(data, "vested_value")
        const unvested_value = get(data, "unvested_value")
        const fairMarketValue = get(data, "carry_plan_fair_market_value", 0)
        const estimated_value_date = get(data, 'estimated_value_date');
        const fair_market_value_date = get(data, 'fair_market_value_date')
        console.log(data)
        setCarryPlanName(data.carry_plan_name)
        setAllocations(data.allocations)
        const tileData:ITileInfo[][] = [
            [{value: handleFormatToCurrency(parseInt(estimated_value)), label: "Estimated Total Value", subTitle: estimated_value_date ? standardizeDate(estimated_value_date) : ''},
            {value: handleFormatToCurrency(parseInt(vested_value)), label: "Vested Estimated Total Value"},
            {value: handleFormatToCurrency(parseInt(unvested_value)), label: "Unvested Estimated Total Value"},],
            [{value: limitCarryDecimalPlaces(data.points), label: "Points"},
            {value: limitCarryDecimalPlaces(data.vested_points), label: "Vested Points"},
            {value: limitCarryDecimalPlaces(data.unvested_points), label: "Unvested Points"},],
            [{value:  handleFormatToCurrency(parseInt(fairMarketValue)), label: "Fair Market Value", subTitle: fair_market_value_date ? standardizeDate(fair_market_value_date) : ''},]
        ]
        setInfoTileData(tileData)
    }

    const handleAllocationClick = (id: string) => {
        setAllocationId(id)
        setIsAllocationDetailModalOpen(true)
    }

    const onCloseAllocationModal = () => {
        setIsAllocationDetailModalOpen(false)
    }

    useEffect(() => {
        setIsLoadingDocuments(true)
        handleDocumentsFetch().then(() => {
            setIsLoadingDocuments(false)
        });
    }, [])

    useEffect(() => {
        setIsLoadingOverview(true)
        setIsLoadingAllocations(true)
        handleOverviewFetch().then(() => {
            setIsLoadingOverview(false)
            setIsLoadingAllocations(false)
        });
    }, [])

    return <Container className={'mt-5'}>
        <div style={{paddingBottom: 20}} className={'mt-4'}><h2>Carry Dashboard</h2></div>
        <TopRow>
            <Breadcrumb>
                <Breadcrumb.Item onClick={() => history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/carry-plans`)}>Carry Management</Breadcrumb.Item>
                {!isLoadingOverview && <Breadcrumb.Item>{carryPlanName}</Breadcrumb.Item>}
            </Breadcrumb>
        </TopRow>
        <SideCarStyledTable>
            <SectionWrapper className="mt-5">
                {isLoadingOverview && <NavableLoader></NavableLoader>}
                {!isLoadingOverview &&
                    <SubInfoTileLayout data={InfoTileData as ITileInfo[][]} colProps={{lg: 4, xs:12, md:4}}/>
                }
            </SectionWrapper>
            <SectionWrapper>
                <h3>
                    Allocations
                </h3>
                {isLoadingAllocations && <NavableLoader></NavableLoader>}
                {!isLoadingAllocations &&
                    <RsSuite
                        height="400px"
                        allowColMinWidth={true}
                        rowSelection={false}
                        columns={getAllocationsColumns()}
                        headerHeight={70}
                        data={allocations}
                        handleOnRowClick={(row: {allocation_id: string}) => handleAllocationClick(row.allocation_id)}
                    />
                }
            </SectionWrapper>
            <SectionWrapper>
                <h3>
                    Notifications & Documents
                </h3>
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
        </SideCarStyledTable>
        {scheduleToView && (
            <VestingDetailModal
                handleCloseModal={handleCloseModal}
                scheduleId={scheduleToView}
                planExternalId={externalId}
            />
        )}
        {
            allocationId && (
                <SingleAllocationDetail
                    allocationId={allocationId}
                    show={isAllocationDetailModalOpen} 
                    onClose={onCloseAllocationModal}/>
            )
        }
    </Container>
}

export default CarryAllocationDetail