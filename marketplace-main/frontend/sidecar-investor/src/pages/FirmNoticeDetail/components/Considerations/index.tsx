import React, {FunctionComponent, useEffect, useState} from 'react';
import {getDynamicNoticeColumns} from "./utils";
import size from "lodash/size";
import cloneDeep from "lodash/cloneDeep";
import {useCompanyPrefix} from '../../../../utils/hooks';
import {get, orderBy} from 'lodash';
import {IInvestmentStat, IInvestmentTable} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {getDateFromStringForSorting} from "../../../../utils/dateFormatting";
import toLower from "lodash/toLower";
import {INotice} from "../../../../interfaces/notices";
import Rsuite from "../../../Notices/components/Table"
import {createTotalRow} from "../../../Notices/components/Considerations/computations";

interface InvestedFundsProps {
  notices: INotice[],
  configTable: IInvestmentTable;
}


const Considerations: FunctionComponent<InvestedFundsProps> = ({notices, configTable}) => {
  const [sortColumn, setSortColumn] = useState('notice_date');
  const [sortType, setSortType] = useState('desc');
  const [data, setData] = useState<any>([]);
  const {companyPrefix} = useCompanyPrefix()


  useEffect(() => {
    const investmentData = notices.map((notice: INotice) => {
      return {
        ...cloneDeep(notice)
      }
    });
    setData(sortData(investmentData, sortColumn, sortType));
  }, [notices])

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
            const currencyRate = 1;
            // const currencyRate = showUSD ? row.currency?.rate : 1;
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
    false,
    configTable.rows,
    companyPrefix
  )
  const totalRow = createTotalRow(notices);
  return <div style={{width: "100%"}}>
    <Rsuite
      height={size(data) > 5 ? "500px" : ""}
      wordWrap={true}
      rowSelection={false}
      columns={columns}
      data={[...data, totalRow]}
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
