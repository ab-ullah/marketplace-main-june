import React, {FunctionComponent, useEffect, useState} from 'react';
import {createTotalRow} from "./computations";
import {useAppSelector} from "../../../../app/hooks";
import {selectShowUSD} from "../../selectors";
import {getDynamicNoticeColumns, mergeChildRecords} from "./utils";
import size from "lodash/size";
import cloneDeep from "lodash/cloneDeep";
import Rsuite from "../Table"
import {useCompanyPrefix} from '../../../../utils/hooks';
import {get, orderBy} from 'lodash';
import {IInvestmentStat, IInvestmentTable} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {getDateFromStringForSorting} from "../../../../utils/dateFormatting";
import toLower from "lodash/toLower";
import {INotice, ITransactionComposition} from "../../../../interfaces/notices";

interface InvestedFundsProps {
  notices: INotice[],
  compositions: ITransactionComposition,
  configTable: IInvestmentTable;
  setExportData: (data: any) => void;
}


const Considerations: FunctionComponent<InvestedFundsProps> = ({notices,compositions, configTable, setExportData}) => {
  const [sortColumn, setSortColumn] = useState('notice_date');
  const [sortType, setSortType] = useState('desc');
  const [data, setData] = useState<any>([]);
  const showUSD = useAppSelector(selectShowUSD);
  const totalRow = createTotalRow(notices);
  const {companyPrefix} =useCompanyPrefix()

  useEffect(() => {
    const investmentData = notices.map((notice: INotice) => {
      const subInvestments = compositions[notice.firm.id]
      // const hasCompositions = size(subInvestments) > 1
      const hasCompositions = true
      if (hasCompositions) {
        const flaggedCompositions = subInvestments.map((subInvestment: INotice) => {
          return {...subInvestment, isSubRow: true, id: `${configTable.id}-sub-${subInvestment.id}`}
        })
        return {
          ...cloneDeep(notice),
          children: cloneDeep(flaggedCompositions),
          id: `${configTable.id}-main-${notice.id}`
        }
      } else {
        return {
          ...cloneDeep(notice)
        }
      }
    });
    setData(sortData(investmentData, sortColumn, sortType));
    setExportData((prevState: any) => ({
      ...prevState,
      [configTable.heading]: {
        tableColumns: getDynamicNoticeColumns(
          showUSD,
          configTable.rows,
          companyPrefix
        ),
        data: mergeChildRecords(sortData(investmentData, sortColumn, sortType) ?? [])
      }
    }))
  }, [notices, compositions])

  if (!configTable) return <></>

  const onSortColumn = (dataKey: any, sortType: any) => {
    setSortColumn(dataKey);
    setSortType(sortType);
    setData(sortData(data, dataKey, sortType))
  }

  const sortData = (data: any, sortColumn: any, sortType: any) => {
    if (sortColumn && sortType) {
      const mapping = configTable.rows.find(
        (mappingRow: IInvestmentStat) => mappingRow.field_name === sortColumn
      )
      return orderBy(data, (row: any) => {
        if (!mapping) return get(data, sortColumn)
        let canShow = true
        if (mapping.depends_on_field && !get(row, mapping.depends_on_field)) canShow = false
        switch (mapping.field_type) {
          case 'date':
            if (!canShow) return getDateFromStringForSorting(null)
            return getDateFromStringForSorting(get(row, sortColumn))
          case 'string':
            if (!canShow) return ''
            return toLower(get(row, sortColumn))
          case 'currency':
            const currencyRate = showUSD ? row.conversion_rate : 1;
            if (!currencyRate || !canShow) return 0
            const value = get(row, sortColumn, 0)
            if (!value) return value
            return value * currencyRate
          default:
            if (!canShow) return 0
            return get(row, sortColumn)
        }
      }, [sortType])
    }
    return data;
  };
  const columns = getDynamicNoticeColumns(
    showUSD,
    configTable.rows,
    companyPrefix
  )

  return <div style={{width: "100%"}}>
    <Rsuite
      height={size(data) > 5 ? "500px" : ""}
      wordWrap={true}
      rowSelection={false}
      columns={columns}
      data={[...data,...showUSD?[totalRow]: []]}
      emptyMessage={"Investment Opportunities Coming Soon"}
      align={'left'}
      isTree={true}
      sortColumn={sortColumn}
      sortType={sortType}
      onSortColumn={onSortColumn}
    />
  </div>
};

export default Considerations;
