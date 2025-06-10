import React, {FunctionComponent} from 'react';
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import {DASH_DEFAULT_VALUE} from "../../../../constants/defaultValues";
import {FundInformationTable} from "../InfoTable/styles";
import {IFundPageRequestAllocation} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import {requestAllocationDate} from "./formatDates";


interface AllocationTableProps {
  requestAllocation: IFundPageRequestAllocation
}


const AllocationTable: FunctionComponent<AllocationTableProps> = ({requestAllocation}) => {

  return <div className={'mb-2'}>
    <FundInformationTable responsive="md">
      <tr>
        <td>Dates</td>
        <td>{requestAllocationDate(requestAllocation.start_date, requestAllocation.end_date)}</td>
      </tr>
      <tr>
        <td>
          Minimum
        </td>
        <td>
          <FormattedCurrency
            value={requestAllocation.investment_amount}
            symbol={'$'}
            replaceZeroWith={DASH_DEFAULT_VALUE}
          />
        </td>
      </tr>
    </FundInformationTable>
  </div>
};

export default AllocationTable;
