import React, {FunctionComponent} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {IFundTask} from "../../../../interfaces/adminDashboard";
import {ADMIN_URL_PREFIX} from "../../../../constants/routes";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";


interface ActiveFundProps {
  fundRow: IFundTask
}


const FundTaskRow: FunctionComponent<ActiveFundProps> = ({fundRow}) => {
  return <TableRow key={`${fundRow.id}-row`}>
    <TableCell align="left">{fundRow.name}</TableCell>
    <TableCell align="left">LXAOV</TableCell>
    <TableCell align="left">Capital Call Required</TableCell>
    <TableCell align="left">{fundRow.task_date}</TableCell>
    <TableCell align="left">{fundRow.deadline}</TableCell>
    <TableCell align="left">
      <Link to={`/${ADMIN_URL_PREFIX}/funds/${fundRow.external_id}/investors`}><Button>Review</Button></Link>
    </TableCell>
  </TableRow>

};

export default FundTaskRow;
