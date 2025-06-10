import React, {FunctionComponent} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {IFundInvestorDetail} from "../../../../interfaces/fundInvestorDetail";
import FormattedCurrency from "../../../../utils/FormattedCurrency";


interface InvestorRowProps {
  investor: IFundInvestorDetail;
}


const FundInvestorRow: FunctionComponent<InvestorRowProps> = ({investor}) => {
  const invested = investor.total_distributions + investor.leverage_used

  const currencySymbol = investor.currency?.symbol;
  return <TableRow key={`${investor.id}-row`}>
    <TableCell component="th" scope="row">{investor.investor_name}</TableCell>
    <TableCell align="left"><FormattedCurrency value={investor.total_distributions} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={investor.leverage_used} symbol={currencySymbol}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={invested} symbol={currencySymbol}/></TableCell>
    <TableCell align="left">-</TableCell>
    <TableCell align="left">-</TableCell>
    <TableCell align="left">-</TableCell>
  </TableRow>

};

export default FundInvestorRow;
