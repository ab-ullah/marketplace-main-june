import React, {FunctionComponent} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {IActiveFund} from "../../../../interfaces/adminDashboard";
import FormattedCurrency from "../../../../utils/FormattedCurrency";


interface ActiveFundProps {
  activeFund: IActiveFund
}


const ActiveFundRow: FunctionComponent<ActiveFundProps> = ({activeFund}) => {
  const currencySymbol = activeFund.currency?.symbol;
  return <TableRow key={`${activeFund.id}-row`} className={activeFund.id === 0 ? 'totalRow' : ''}>
    <TableCell align="left">{activeFund.name}</TableCell>
    <TableCell align="left">{activeFund.type}</TableCell>
    <TableCell align="left"><FormattedCurrency value={activeFund.nav_share} symbol={currencySymbol}/></TableCell>
    <TableCell align="left">{activeFund.employees_count}</TableCell>
    <TableCell align="left"><FormattedCurrency value={activeFund.commitment_to_date} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={activeFund.leverage_used} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={activeFund.total_committed} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={activeFund.interest_accrued} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={activeFund.unrealized_gain} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={activeFund.total_distributions} symbol={currencySymbol}/></TableCell>

  </TableRow>

};

export default ActiveFundRow;
