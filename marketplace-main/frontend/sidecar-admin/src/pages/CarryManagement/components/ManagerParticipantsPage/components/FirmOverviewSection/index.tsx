/* eslint-disable react-hooks/exhaustive-deps */
import { SubTitle } from "../../../styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import RefreshIcon from "@material-ui/icons/Refresh";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { filterData, getColumns, transformParticipantsToMap } from "./constants";
import isEmpty from "lodash/isEmpty";
import { FilterBox, InputBox } from "../../../../../Funds/styles";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import { FormSelectorFieldRow } from "../../../../../../components/Form/SelectorField";
import { FiltersRow } from "./styles";
import debounce from "lodash/debounce";
import DetailModal from "../DetailModal";
import NavableLoader from "../../../../../../components/NavableLoader";
import {
  useGetEmploymentFiltersQuery,
} from "../../../../../../api/rtkQuery/employeeApi";
import DynamicFilterDropdown from "./components/dynamicFilterDropdown";
import { OptionTypeBase } from "react-select";
import { get } from "lodash";
import React from "react";
import { useFetchManagerFirmOverviewQuery } from "../../../../../../api/rtkQuery/carryApi";
import { formatDateTime } from "../../../../../../utils/dateFormatting";

const displayOptions =[
    {label: 'Points', value: 'bps'},
    {label: 'Estimated Value', value: 'estimated_value'},
    {label: 'Fair Market Value', value: 'fair_market_value'},
]

const vestingOptions =[
  { label: "Vested & Unvested", value: "all" },
    {label:'Vested',value:'vested'},
    {label:'Unvested',value:'un_vested'},
]

const FirmOverviewSection = () => {

  const {data: dataFilters} = useGetEmploymentFiltersQuery(1);
  const {data: firmOverviewData ={}, isLoading: isDataLoading, refetch:refetchData, isFetching} = useFetchManagerFirmOverviewQuery()

  const isLoading = isDataLoading || isFetching

  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterState, setFilterState] = useState<Record<string, any[] | string>>({searchQuery:""});

  const [viewState, setViewState] = useState<Record<string, any[]>>({
    display: [displayOptions[0]],
    vesting: [vestingOptions[0]]
  });

  const [formattedFilters, setFormattedFilters] = useState<any[]>([])

  const [selectedEmployee, setSelectedEmployee] = useState('')

  const cellDataKey = useMemo(()=>{
    return [get(viewState, 'vesting[0].value', ""),get(viewState, 'display[0].value', "")].join("_")
  },[viewState.display,viewState.vesting])

  const showBps = useMemo(()=>{
    return get(viewState, 'display[0].value', "") as string ==='bps'
  },[get(viewState, 'display[0].value', "")])

  const memoizedCols = useMemo(()=>{
    return (isLoading || isEmpty(firmOverviewData)) ? []: getColumns(firmOverviewData,cellDataKey,showBps)
  },[isLoading,Object.keys(firmOverviewData).length,cellDataKey,showBps])

  const debouncedFilter = useMemo(() => 
    debounce((data, filters) => {
      const result = filterData(data, filters);
      setFilteredData(result);
    }, 300),
    []
  );

const handleParticipantClick =(_row:any)=>{
  console.log('clicked',_row)
  setSelectedEmployee(_row.carry_participant_id)
}

  useEffect(() => {
    const participants = firmOverviewData?.participants || [];
    debouncedFilter(participants, filterState);

    // Cancel debounce on unmount
    return () => {
      debouncedFilter.cancel();
    };
  }, [firmOverviewData?.participants?.length,JSON.stringify(filterState), debouncedFilter]);

  useEffect(() => {
    if(dataFilters) {
      const filters = dataFilters?.filters_options.map((filter: any) => ({
        label: filter.label,
        key: filter.name,
        options: filter.options
      }))
      setFormattedFilters(filters)
    }
  }, [dataFilters])

  useEffect(() => {
    const configFilterKeys = formattedFilters.map((config: any) => config.key)
    const initFilterState: any = {};
    configFilterKeys.forEach((key: any, index: number) => {
      initFilterState[key] = []
    })
    setFilterState((prevState) => ({
      ...prevState,
      ...initFilterState
    }))
  }, [formattedFilters])

  return (
    <div>
      <div className="d-flex justify-content-between">
      <SubTitle>Firm Overview</SubTitle>
      {/* {firmOverviewData?.lastUpdated &&
          (isFetching ? (
            <div> Fetching updated data... </div>
          ) : (
            <div>
              Last Updated: {formatDateTime(firmOverviewData?.lastUpdated)}{" "}
              <RefreshIcon
                style={{ cursor: "pointer" }}
                onClick={() => refetchData()}
              />
            </div>
          ))} */}
      </div>

      <FilterBox className="mt-2">
        <InputBox
          type="text"
          placeholder="Search"
          value={filterState?.searchQuery}
          onChange={(e: any) =>
            setFilterState((prev: any) => ({ ...prev, searchQuery: e.target.value }))
          }
        />
        <SearchOutlinedIcon />
      </FilterBox>
      <FiltersRow>
        <div className="single-filter">

          <FormSelectorFieldRow
            label="Display"
            name="display"
            placeholder=""
            onChange={(value: any) =>
              setViewState((prev: any) => ({ ...prev, display: [value] }))
            }
            value={viewState.display}
            options={displayOptions}
          />
        </div>
        <div className="single-filter">

          <FormSelectorFieldRow
            label="Vesting"
            name="vesting"
            placeholder=""
            onChange={(value: any) =>
              setViewState((prev: any) => ({ ...prev, vesting: [value] }))
            }
            value={viewState.vesting}
            options={vestingOptions}
          />
        </div>
        {
          formattedFilters.map((config: any) => (
            <div style={{marginTop: "20px"}}>
              <DynamicFilterDropdown config={config}
                selectedOptions={(filterState ? filterState[config.key]: []) as OptionTypeBase[]}
                onChange={(values: OptionTypeBase[]) => setFilterState((prevState) => ({
                  ...prevState,
                  [config.key]: values
                }))}
              />
            </div>
          ))
        }

      </FiltersRow>
      {isLoading ? <div className={'mt-5 mb-5'}><NavableLoader/></div> : !isEmpty(firmOverviewData) && (
        <TableSection
          memoizedCols={memoizedCols}
          data={filteredData}
          handleParticipantClick={handleParticipantClick}
        />
      )}
     {Boolean(selectedEmployee) && <DetailModal participantId={selectedEmployee} onClose={()=>setSelectedEmployee('')}/>}
    </div>
  );
};

interface ITableSectionProps {
  memoizedCols: any[];
  data:any[];
  handleParticipantClick:any
}

const TableSection = React.memo(({memoizedCols,data,handleParticipantClick}: ITableSectionProps) => {

  return (  <div className="mt-5">
    <RsuiteTable
      height="650px"
      allowColMinWidth={true}
      rowSelection={false}
      columns={memoizedCols}
      data={data}
      rowHeight={50}
      headerHeight={60}
      onRowClick={handleParticipantClick}
    />
  </div> );
})
 


export default FirmOverviewSection;
