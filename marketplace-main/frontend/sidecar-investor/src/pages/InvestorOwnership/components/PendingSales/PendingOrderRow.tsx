import React, {FunctionComponent} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {IFundSale} from "../../../../interfaces/investorOwnership";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import Button from "react-bootstrap/Button";


interface PendingSaleRowProps {
  pendingSale: IFundSale,
}


const PendingSaleRow: FunctionComponent<PendingSaleRowProps> = ({pendingSale}) => {
  return <TableRow key={`${pendingSale.id}-row`}>
    <TableCell align="left">{pendingSale.fund_name}</TableCell>
    <TableCell align="left"><FormattedCurrency value={pendingSale.requested_sale}/></TableCell>
    <TableCell align="left"><FormattedCurrency value={115000}/></TableCell>
    <TableCell align="left"><Button className={'mr-5'}>Accept</Button><Button>Reject</Button></TableCell>
  </TableRow>

};

export default PendingSaleRow;
