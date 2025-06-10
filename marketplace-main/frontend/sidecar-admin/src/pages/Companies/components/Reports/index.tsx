import React, {FunctionComponent, useState} from 'react';
import ReportsTable from "./ReportsTable";
import Select from "react-select";
import {Filters, SelectorDiv} from "./styles";
import {useGetCompanyReportsQuery} from "../../../../api/rtkQuery/companyApi";
import {ICompanyReport} from "../../../../interfaces/companyReports";
import {DUE_FROM_TO_INVESTORS, FINANCIAL_STATEMENTS, FUND_ACCOUNTING} from "./constants";
import uniqBy from "lodash/uniqBy";
import {cloneDeep} from "lodash";
import size from "lodash/size";
import orderBy from "lodash/orderBy";

interface ReportsProp {
}


const Reports: FunctionComponent<ReportsProp> = () => {
  const [year, setYear] = useState<number | null>(null)
  const [vehicle, setVehicle] = useState<number | null>(null)

  const {data: companyReports} = useGetCompanyReportsQuery()

  if (!companyReports) return <></>

  let yearsFilter = [] as any;
  let vehiclesFilter = [] as any;


  companyReports.forEach(
    (report: ICompanyReport) => yearsFilter.push(
      {
        label: report.year.toString(),
        value: report.year
      }
    )
  )
  companyReports.forEach((report: ICompanyReport) => (
    report.vehicles.forEach((vehicle => vehiclesFilter.push({label: vehicle.name, value: vehicle.id})))
    )
  )

  yearsFilter = orderBy(yearsFilter, ['value'], ['asc'])
  vehiclesFilter = orderBy(vehiclesFilter, ['label'], ['asc'])

  if (!year && size(yearsFilter)) setYear(yearsFilter[0].value)
  if (!vehicle && size(vehiclesFilter)) setVehicle(vehiclesFilter[0].value)

  const selectedYearValue = yearsFilter.find((yearOption: any) => yearOption.value === year)
  const selectedVehicleValue = vehiclesFilter.find((vehicleOption: any) => vehicleOption.value === vehicle)


  let filteredReports = cloneDeep(companyReports)
  filteredReports = filteredReports.filter((report: ICompanyReport) => report.vehicles.find(fundVehicle => fundVehicle.id === vehicle))
  filteredReports = filteredReports.filter((report: ICompanyReport) => report.year === year)

  const financialStatements = filteredReports.filter((report: ICompanyReport) => report.report_type === FINANCIAL_STATEMENTS)
  const fundAccounting = filteredReports.filter((report: ICompanyReport) => report.report_type === FUND_ACCOUNTING)
  const dueFromToInvestors = filteredReports.filter((report: ICompanyReport) => report.report_type === DUE_FROM_TO_INVESTORS)


  return <>
    <Filters>
      <div className={'vehicle-selector'}>
        <div className={'label'}>Vehicle</div>
        <SelectorDiv>
          <Select
            onChange={(value: any) => {
              setVehicle(value.value);
            }}
            placeholder="Vehicle"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isMulti={false}
            value={selectedVehicleValue}
            name="vehicle"
            options={uniqBy(vehiclesFilter, 'value')}
            onBlur={() => {
            }}
          />
        </SelectorDiv>
      </div>
      <div className={'year-selector'}>
        <div className={'label'}>Year</div>
        <SelectorDiv>
          <Select
            placeholder="Year"
            onChange={(value: any) => {
              setYear(value.value);
            }}
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isMulti={false}
            value={selectedYearValue}
            name="Year"
            options={uniqBy(yearsFilter, 'value')}
            onBlur={() => {
            }}
          />
        </SelectorDiv>
      </div>
    </Filters>
    {size(financialStatements) > 0  && <ReportsTable
      reports={financialStatements}
      heading={'Financial Statements'}
    />}
    {size(fundAccounting) > 0 && <ReportsTable
      reports={fundAccounting}
      heading={'Fund Accounting'}
    />}
    {size(dueFromToInvestors) > 0 && <ReportsTable
      reports={dueFromToInvestors}
      heading={'Due from/to Investors'}
    />}
  </>
};

export default Reports;
