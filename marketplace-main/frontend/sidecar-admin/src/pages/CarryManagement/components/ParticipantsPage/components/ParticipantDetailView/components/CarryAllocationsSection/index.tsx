import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { Label } from "../../../../styled";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import API from '../../../../../../../../api/backendApi'
import React, { useEffect, useState } from "react";
import { get } from "lodash";
import NavableLoader from "../../../../../../../../components/NavableLoader";
import { getCarryPlansColumns } from "./constants";
import InfoTileLayout from "../../../../../InfoTileLayout";
import {getLatestDate, getSumByProperty} from "../../../../../../../../utils/getValue";
import AllocationDetails from "../../../../../CarryPlansPage/components/CarryPlanDetailView/components/AllocationDetails";
import Dropdown from "react-bootstrap/Dropdown";
import {
  StyledSelect
} from "../../../../../../../EligibilityCriteria/components/EligibilityFormCreation/components/CriteriaForm/components/FundDocuments/styles";
import carryAllocationsStep
  from "../../../../../CarryPlansPage/components/CarryPlanModal/components/CarryPlanForm/components/CarryAllocationsStep";
import { useGetCarryPlansConfigQuery } from "../../../../../../../../api/rtkQuery/companyApi";
import { getTooltip } from "../../../../../FundsPage/components/FundsListView/constants";
import { CARRY_VALUE_LABEL } from "../../../../../../constants";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";

const CarryAllocationsStep = ({participantId, onDataLoaded}:any) => {
  const [state,setState] = useState<any>({})
  const [filteredCarryPlansData,setFilteredCarryPlansData] = useState<any[]>([])
  const [hasEntity, setHasEntity] = useState<boolean>(false)
  const [entityOptions, setEntityOptions] = useState<{label: string, value: string}[]>([])
  const [isLoading,setIsLoading]=useState(true)
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);

  const {data: carryPlansConfig} = useGetCarryPlansConfigQuery();

  const handleFetchCarryPlans = async () => {

    const res = await API.fetchUserAllocationsById(participantId);

    if (res.success) {
     return res.data
    }
    return [];
  };

  const handleFetchDetail = async () => {
    setIsLoading(true)
    // const sectionData = await handleFetchParticipantDetail();
    const carryPlansData = await handleFetchCarryPlans();

    setIsLoading(false)
    // setData({ ...sectionData, tableData });
    onDataLoaded(carryPlansData)
    setState({carryPlansData})
    setFilteredCarryPlansData(carryPlansData)
    const uniqueValues = new Set<string>();
    console.log(carryPlansData)
    let result = carryPlansData.map((participant: any) => ({
      label: participant.entity_name ?? participant.full_name!,
      value: participant.carry_participant_id
    })).filter((participant: any) => {
      if (uniqueValues.has(participant.value)) {
        return false; // Skip if the label is already in the set
      }
      uniqueValues.add(participant.value);
      return true;
    });
    result.splice(0, 0, {label: "All", value: null})
    setEntityOptions(result)
    setHasEntity(carryPlansData.some((item: any) => item.entity_name && item.entity_name.trim() !== ''))
  };

  const handleAllocationClick = (allocation: any) => {
    setSelectedAllocation(allocation);
    setIsAllocationModalOpen(true)
  }

  const InfoTileData =()=> {
    const totalEstimatedCarryValue = getSumByProperty(filteredCarryPlansData,'participant_estimated_carry')
    const totalDistributions = getSumByProperty(filteredCarryPlansData,'distributions')
    const totalVestedValue = getSumByProperty(filteredCarryPlansData,'participant_estimated_carry_vested')
    const totalUnvestedValue = getSumByProperty(filteredCarryPlansData,'participant_estimated_carry_un_vested')
    const totalAllocations = filteredCarryPlansData.length
    const totalFairMarketValue = getSumByProperty(filteredCarryPlansData,'participant_fair_market_value')
    const latestEstimatedValueDate = getLatestDate(filteredCarryPlansData, 'estimated_value_date')
    const latestFairMarketValueDate = getLatestDate(filteredCarryPlansData, 'fair_market_value_date')
    return[
    {
      label: CARRY_VALUE_LABEL.total_estimated_value,
      value:  formatCurrencyWithTwoDecimals(totalEstimatedCarryValue),
      tooltip: getTooltip('estimated_value', carryPlansConfig?.tooltips ?? [])?.tooltip,
      subTitle: latestEstimatedValueDate && `As of ${standardizeDate(latestEstimatedValueDate)}`
    },
    {
      label: "Estimated Vested Value",
      value: formatCurrencyWithTwoDecimals(totalVestedValue),
    },
    {
      label: "Estimated Unvested Value",
      value: formatCurrencyWithTwoDecimals(totalUnvestedValue),
    },
    { label: "Allocations", value: totalAllocations },
    {
      label: CARRY_VALUE_LABEL.total_fair_market_value,
      value: formatCurrencyWithTwoDecimals(totalFairMarketValue),
      tooltip: getTooltip('fair_market_value', carryPlansConfig?.tooltips ?? [])?.tooltip,
      subTitle: latestFairMarketValueDate && `As of ${standardizeDate(latestFairMarketValueDate)}`
    },
    {
      label: "Distributions",
      value: formatCurrencyWithTwoDecimals(totalDistributions)
    }
  ]}
  useEffect(() => {
    handleFetchDetail();
  }, []);

  if (isLoading) return <NavableLoader />;

  return (
    <div>
      {/* <SplitInfoTiles data={data}/> */}
      {hasEntity && <span style={{
          width: 400,
          display: "block",
          paddingBottom: 30
      }}>
        Entity
          <StyledSelect
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              placeholder={"Select Entity"}
              onKeyDown={(e:any)=>e.stopPropagation()}
              options={entityOptions}
              onChange={(value: { label: string, value: string }) =>{
                setFilteredCarryPlansData(state.carryPlansData.filter((data: any) => {
                  if(value.value){
                    return data.carry_participant_id == value.value
                  }
                  return true
                }))
              }}
              defaultValue={entityOptions[0]}
              isDisabled={false}
              menuPosition="fixed"
          />
      </span>}
      <InfoTileLayout data={InfoTileData()}/>
      <div>
        <Label>Allocations</Label>
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          defaultSortBy=""
          // defaultSortType="desc"
          onRowClick={handleAllocationClick}
          columns={getCarryPlansColumns(hasEntity, carryPlansConfig?.tooltips ?? [])}
          data={filteredCarryPlansData||[]}
          wordWrap={true}
        />
      </div>
      <AllocationDetails
        carryPlanId={selectedAllocation?.carry_plan_id}
        allocation={selectedAllocation?.allocation_id}
        show={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        />
    </div>
  );
};

export default CarryAllocationsStep;
