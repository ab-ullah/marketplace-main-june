import React, {FunctionComponent, useEffect, useState} from 'react';
import {IInvestmentComposition, IOwnershipFundInvestor} from "../../../../interfaces/investorOwnership";
import {createTotalRow} from "./computations";
import {useAppSelector} from "../../../../app/hooks";
import {selectCurrency, selectShowUSD} from "../../selectors";
import {useGetOwnershipPageConfigQuery} from "../../../../api/rtkQuery/pageConfigsApi";
import {getDynamicActiveInvestmentColumns} from "./utils";
import size from "lodash/size";
import cloneDeep from "lodash/cloneDeep";
import Rsuite from "../Table"
import { useCompanyPrefix } from '../../../../utils/hooks';
import {get, orderBy} from 'lodash';
import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {getDateFromStringForSorting} from "../../../../utils/dateFormatting";
import toLower from "lodash/toLower";
import {useGetCurrencyFeatureFlagQuery} from "../../../../api/rtkQuery/commonApi";

interface InvestedFundsProps {
  investedFunds: IOwnershipFundInvestor[],
  compositions: IInvestmentComposition,
  isLegacy: boolean;
  setExportData?: (data: any) => void;
}

const DEFAULT_CURRENCIES = ['company_currency', 'investor_currency']

const InvestedFunds: FunctionComponent<InvestedFundsProps> = ({investedFunds, compositions, isLegacy, setExportData}) => {
  const [sortColumn, setSortColumn] = useState('fund_name');
  const [sortType, setSortType] = useState('asc');
  const { data: currencyFeatureFlag, isLoading } = useGetCurrencyFeatureFlagQuery();
  const [data, setData] = useState<any>([]);
  const showUSD = useAppSelector(selectShowUSD);
  const selectedCurrency = useAppSelector(selectCurrency);
  const totalRow = createTotalRow(investedFunds, isLegacy, selectedCurrency);
  const {companyPrefix} =useCompanyPrefix()
  const {data: ownershipConfig} = useGetOwnershipPageConfigQuery()


  const showTotalRow = (selectedCurrency && currencyFeatureFlag?.is_active) ? DEFAULT_CURRENCIES.includes(selectedCurrency) : showUSD;

  useEffect(() => {
    const investmentData = investedFunds.map((investment: IOwnershipFundInvestor) => {
      const subInvestments = compositions[investment.fund.id]
      const hasCompositions = size(subInvestments) > 1
      if (hasCompositions) {
        const flaggedCompositions = subInvestments.map((subInvestment: IOwnershipFundInvestor) => {
          return {...subInvestment, isSubRow: true}
        })
        return {
          ...cloneDeep(investment), children: cloneDeep(flaggedCompositions)
        }
      } else {
        return {
          ...cloneDeep(investment)
        }
      }
    });
    setData(sortData(investmentData, sortColumn, sortType));
  }, [])

  const getExportData = () => {
    let records: any[] = [];
    data.forEach((investment: any) => {
      if(investment.children) {
        records = [
          ...records,
          ...investment.children
        ]
      }
      else {
        records = [
          ...records,
          investment
        ]
      }
    })
    return records
  }

  useEffect(() => {
    if(ownershipConfig) {
      setExportData && setExportData({
        tableColumns: getDynamicActiveInvestmentColumns(
          showUSD,
          isLegacy,
          ownershipConfig.tables[0].rows,
          companyPrefix,
          ownershipConfig.hide_logo,
          selectedCurrency
        ),
        data: getExportData()
      })
    }
  }, [data])

  if (!ownershipConfig) return <></>

  const onSortColumn = (dataKey: any, sortType: any) => {
    setSortColumn(dataKey);
    setSortType(sortType);
    setData(sortData(data, dataKey, sortType))
  }

  const sortData = (data: any, sortColumn: any, sortType: any) => {
    if (sortColumn && sortType) {
      const mapping = ownershipConfig.tables[0].rows.find(
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
            const currencyRate = showUSD ? row.currency.rate : 1;
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
  const columns = getDynamicActiveInvestmentColumns(
    showUSD,
    isLegacy,
    ownershipConfig.tables[0].rows,
    companyPrefix,
    ownershipConfig.hide_logo,
    selectedCurrency
  )

  return <div style={{width: "100%"}}>
    <Rsuite
      height={size(data) > 5 ? "500px" : ""}
      wordWrap={true}
      rowSelection={false}
      columns={columns}
      data={[...data,...showTotalRow?[totalRow]: []]}
      emptyMessage={"Investment Opportunities Coming Soon"}
      align={'left'}
      isTree={true}
      sortColumn={sortColumn}
      sortType={sortType}
      onSortColumn={onSortColumn}
    />
  </div>
};

export default InvestedFunds;
