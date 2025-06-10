import React, {FunctionComponent} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {IActiveFund} from "../../../../interfaces/adminDashboard";
import FormattedCurrency from "../../../../utils/FormattedCurrency";


interface ActiveFundProps {
  fundRow: IActiveFund
}


const FundraisingRow: FunctionComponent<ActiveFundProps> = ({fundRow}) => {
  const currencySymbol = fundRow.currency?.symbol;
  return <TableRow key={`${fundRow.id}-row`}>
    <TableCell align="left">{fundRow.name}</TableCell>
    <TableCell align="left">{fundRow.type}</TableCell>
    <TableCell align="left"><FormattedCurrency value={fundRow.nav_share} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={fundRow.total_available} symbol={currencySymbol}/></TableCell>
    <TableCell align="left">1</TableCell>
    <TableCell align="left"><FormattedCurrency value={fundRow.sold} symbol={currencySymbol}/></TableCell>
    <TableCell align="left">{fundRow.close_date}</TableCell>
  </TableRow>

};

export default FundraisingRow;
