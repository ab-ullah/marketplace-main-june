import React, { FC, useState, useRef, useEffect, useMemo } from "react";
import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import map from "lodash/map";
import get from "lodash/get";
import without from "lodash/without";
import CheckBoxCell from "./CheckboxCell";
import { Wrapper } from "./styles";
import TableHeaderFilter from "./TableHeaderFilter";
import { sortData, withFilter, getTableWidth } from "./constants";
import { difference, isEqual, sortBy, uniq } from "lodash";
import ReactDateRangePicker from "../ReactDateRangePicker";
import CustomCell from "./CustomCell";
import TooltipPopover from "../TooltipPopover";
import TreeToggleButton from "./TreeToggleButton";

export interface ISortConfig{
  sortColumn: string;
  sortType: sortOptions;
}

interface IColumns {
  title?: any;
  dataKey?: any;
  width?: any;
  Cell?: any;
  filterOptions?: any[];
  externalDateRangeFilter?: boolean;
}

type sortOptions= 'asc' | 'desc'

interface IRSuite {
  isLoading?: boolean;
  allowColMinWidth?: boolean;
  columns?: IColumns[];
  height?: string;
  width?: string;
  autoHeight?: boolean;
  data?: any;
  rowHeight?: number;
  headerHeight?: number;
  dataKey?: string;
  rowSelection?: boolean;
  disableRowSelection?: boolean;
  wordWrap?: boolean;
  handleSelectRow?: (data: any) => void;
  defaultSortBy?: string;
  defaultSortType?: sortOptions;
  selectResetTrigger?: any;
  callbackInternalDataIds?: (_dataIds:any[])=>void
  callbackSelectedFilters?: (_filters:Record<string,any>)=>void;
  externalFiltering?: boolean;
  callBackSortConfifg?: (_config:ISortConfig)=>void;
  externalSorting?: boolean;
  rowBordered?: boolean;
  rowHighlightKey?: string;
  onRowClick?: (_rowData:any)=>void;
  isTree?: boolean,
  rowKey?: string,
  selectionRowWidth?: number,
}

const RsSuite: FC<IRSuite> = ({
  isLoading,
  allowColMinWidth,
  height,
  width,
  autoHeight,
  wordWrap,
  columns,
  rowHeight,
  headerHeight,
  data,
  dataKey,
  disableRowSelection,
  rowSelection,
  handleSelectRow,
  defaultSortBy,
  defaultSortType,
  selectResetTrigger,
  callbackInternalDataIds,
  callbackSelectedFilters,
  externalFiltering,
  callBackSortConfifg,
  externalSorting,
  rowBordered,
  rowHighlightKey,
  onRowClick,
  isTree,
  rowKey,
  selectionRowWidth
}) => {
  const [tableData,setTableData]=useState<any[]>([])
  const [checkValues, setCheckValues] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] =useState<Record<string,any>>({})
  const [wrapperHeight, setHeight] = useState(0);
  const [sortColumn, setSortColumn] = useState<string>(defaultSortBy as string);
  const [sortType, setSortType] = useState<sortOptions>(defaultSortType as sortOptions);
  const ref = useRef(null);
  const tableDataWithoutFooter = tableData.filter((dat)=>!dat.isFooter)
  const dataIds = useMemo(()=> map(tableDataWithoutFooter,(elem:any)=>elem[dataKey as string]),[tableDataWithoutFooter])

  const tableRef = React.useRef();

  const handleCheckCellChange = (value: any) => {
    // value = +value;
    let nextCheckValues: any[] = [...checkValues];

    if (nextCheckValues.includes(value)) {
      nextCheckValues = without(nextCheckValues, value);
    } else {
      nextCheckValues.push(value);
    }
    setCheckValues(nextCheckValues);
    if (handleSelectRow) handleSelectRow(nextCheckValues);
  };

  const handleResetChecks = () =>{
    setCheckValues([])
      if (handleSelectRow) handleSelectRow([]);
  }

  const handleCheckAllChange = () => {
    if (!tableData) return;
    if (
      difference(dataIds,checkValues).length===0
    ) {
      setCheckValues(difference(checkValues,dataIds))
      if (handleSelectRow) handleSelectRow(difference(checkValues,dataIds));
    } else {
      const newCheckValues = uniq([...checkValues, ...dataIds]);
      setCheckValues(newCheckValues);
      if (handleSelectRow) handleSelectRow(newCheckValues);
    }
  };

  const onSortColumn = (dataKey: any, sortType: any) => {
    setSortColumn(dataKey);
    setSortType(sortType);
    if(externalSorting && callBackSortConfifg) callBackSortConfifg({sortColumn:dataKey,sortType})
    else setTableData(sortData(tableData, dataKey, sortType))
  }

  // useEffect(()=>{
  //   setTableData(sortData(data, sortColumn, sortType))
  // },[data])

  useEffect(() => {
    if (get(ref, "current.clientHeight"))
      setHeight(get(ref, "current.clientHeight"));
  }, [get(ref, "current.clientHeight")]);

  // useEffect(() => {
  //   const commonValues = tableData
  //     .map((dat) => dat[dataKey as string])
  //     .filter((element: any) => checkValues.includes(element));
  //   setCheckValues(commonValues);
  //   if (handleSelectRow) handleSelectRow(commonValues);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [tableData]);

  useEffect(()=>{
    const initialObject:Record<string,any> ={}
    columns?.forEach((column)=>{
      if(column.filterOptions){
      initialObject[column.dataKey]=[]}
    })
    setSelectedFilters(initialObject)

  },[columns])

  useEffect(()=>{
    if(callbackSelectedFilters) callbackSelectedFilters(selectedFilters)
    const unsortedData = externalFiltering? data : withFilter(data,selectedFilters)
  if(externalSorting && callBackSortConfifg) callBackSortConfifg({sortColumn,sortType})
    setTableData(externalSorting ? unsortedData : sortData(unsortedData,sortColumn,sortType))
  },[selectedFilters,data])

  useEffect(()=>{
    handleResetChecks()
  },[selectResetTrigger])

  useEffect(()=>{
   if(callbackInternalDataIds) callbackInternalDataIds(dataIds)
  },[sortColumn,sortType,tableData.length])

  return (
    <Wrapper style={{ height, width }} rowBordered={rowBordered}>
      <div className="table-container" ref={ref}>
        <Table
          height={wrapperHeight}
          data={tableData}
          ref={tableRef}
          shouldUpdateScroll={false}
          wordWrap={wordWrap}
          autoHeight={autoHeight}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          sortColumn={sortColumn}
          sortType={sortType as any}
          onSortColumn={onSortColumn}
          isTree={isTree}
          rowKey={rowKey}
          renderTreeToggle={TreeToggleButton}
          onRowClick={(rowData) => (onRowClick && !get(rowData,"isFooter")) ? onRowClick(rowData): null}
          virtualized
        >
          {rowSelection && (
            <Column key="checkColumn" width={selectionRowWidth || 56} fixed>
              <HeaderCell className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={
                    tableData &&
                    tableDataWithoutFooter.length > 0 &&
                    checkValues.length>0 &&
                    difference(dataIds,checkValues).length===0
                  }
                  onChange={handleCheckAllChange}
                  disabled={disableRowSelection || !tableData || tableDataWithoutFooter.length === 0}
                />
              </HeaderCell>
              <CheckBoxCell
                dataKey={dataKey}
                checked={(value: any) => {
                  return checkValues.includes(value);
                }}
                onChange={handleCheckCellChange}
                disabled={disableRowSelection}
              />
            </Column>
          )}
          {map(columns, (column: any) => (
            <Column
              key={column.dataKey}
              align="center"
              {...getTableWidth(column, allowColMinWidth)}
              fixed={column?.fixed}
              className={wordWrap ? "wrap-word" : ""}
              sortable={column.isSortable}
            >
              <HeaderCell>
                {column.filterOptions ? (
                  <TableHeaderFilter
                    title={column.title}
                    options={column.filterOptions}
                    selectedValues={selectedFilters[column.dataKey]}
                    setValues={(val) =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        [column.dataKey as string]: val,
                      }))
                    }
                  />
                ) :
                column.externalDateRangeFilter? 
                <ReactDateRangePicker 
                  range={selectedFilters[column.dataKey]}
                  setDateRange={(val) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      [column.dataKey as string]: val,
                    }))
                  }
                  customButton={<div className="d-flex"><div> {column.title} </div> <ArrowDropDownIcon style={{fill:'white'}}/></div>}
                />
                :
                (
                  column.title
                )}
                {column.tooltip?.tooltip && <TooltipPopover tooltip={column.tooltip.tooltip} isLight />}
              </HeaderCell>
              {/* <Cell dataKey={column.dataKey}>{column.Cell}</Cell> */}
              <CustomCell column={column} dataKey={column.dataKey} rowHighlightKey={rowHighlightKey} onRowClick={onRowClick}/>
            </Column>
          ))}
        </Table>
      </div>
    </Wrapper>
  );
};

RsSuite.defaultProps = {
  dataKey: "id",
  allowColMinWidth: true,
  rowSelection: true,
  disableRowSelection: false,
  height: "400px",
  rowHeight: 46,
  headerHeight: 40,
  width: "100%",
  autoHeight: false,
  defaultSortBy: 'created_at',
  defaultSortType: 'asc',
  externalFiltering: false,
  externalSorting: false,
  isTree: false,
  rowKey:"",
  rowHighlightKey:""
};

export default RsSuite;